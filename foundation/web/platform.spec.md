<!-- Instance of the foundation spec for Archetype Web. aidd spec new chore platform "Platform" --domain foundation --from .product/foundation/platform.spec.md -->
# {id}-platform — Platform

## Problem

Each project must start in the same way in each environment, with its settings outside the code, and the operator must see what occurred when a failure occurs. Each later spec must use these services, never make its own.

### User Stories

- As an operator, I want **to set each project with environment variables, and an incorrect setting to stop it when it starts** so that one build operates in each environment, never with an incomplete configuration.
- As an operator, I want **one short log line for each request and each error, in a daily file** so that I can find the cause of a failure.
- As a developer, I want **each server to show its address when it starts** so that I can open it.

### Business rules

- Each setting must have a documented default and a check. A relative path in a setting starts at the project folder, never at the working directory.
- A project must stop cleanly: it must not lose a request in progress or a log line.
- A log line must be plain text that a person can read, never JSON. A log line or a console line must never contain a password, a token or a form value.
- An error must not show internal details.

### Out of context

- The management of secrets. Metrics, tracing, log shipping, rate limits. Log rotation, other than one file for each day.
- A configuration file for the `back` and the `front`: only environment variables and an optional local `.env` file.

## Solution

### All projects

- Each file of `core` is in the folder of its concern, from the closed list of `core` folders of `project-types.md` (section 3), with its unit test: `settings/`, `logging/`, `http/`, `database/`, `lifecycle/`. Only the entry `main` is at the root of `src`: it gives the manifest and the identity to `start` of `core/lifecycle/`, which composes the application, starts it and stops it.
- An example environment file lists each variable and its default.
- The check of each setting: a port is an integer from 1 to 65535; a path (`DATABASE_URL`, `LOG_DIR`, `{PROJECT}_DIRECTORY`) or a command (`{PROJECT}_START`) is not empty; a timeout (`E2E_STARTUP_TIMEOUT_MS`) is an integer from 1 to 600000; a URL (`API_BASE_URL`) is an absolute `http` or `https` URL; `LOG_LEVEL` is one of `debug`, `info`, `warn`, `error`; `CORS_ORIGIN` is `*` or a comma list of origins; `BODY_LIMIT_KB` is an integer from 1 to 10240. Each number and each length has a closed range: no setting is unbounded. A setting that a feature adds has its own check. A unit test of `core` proves each check with its list of values: the invalid ones and each limit.
- Logger in `core/logging/`, contract in `shared/logging/`: one line for each event in `{LOG_DIR}/{yyyy-mm-dd}.log`, with the columns `time source LEVEL message` (local time `HH:MM:SS.mmm`; `source` is the project name), ` | ` for line breaks, `WARN` and `ERROR` also to standard error. `LOG_LEVEL` filters each line below it. It never blocks the work, and writes each queued line before the stop. A failed write never stops the project: that line goes to standard error, and the next lines go on. The logger reads `LOG_DIR` and `LOG_LEVEL` only through their definitions, also before the configuration loads, so that a failure at startup has a log line. An invalid `LOG_DIR` writes no file; an invalid `LOG_LEVEL` takes its fallback. The file of each line comes from the time of that line, never from the time of the start: after midnight, the next line goes to the file of the new day. A unit test of `core` proves the format, the filter, the change of day and the stop, with the clock and the life cycle as arguments.
- The expected error of the Bedrock (`shared/expected.error.ts`) has a kind, a message and optional `fields`; `platform` gives each kind its exit code or status. Each check of a setting uses the primitives of `shared/values/`, never one of its own.

### back

- Settings: `PORT` (3000), `HOST` (all interfaces), `DATABASE_URL` (`./data/app.sqlite`), `CORS_ORIGIN` (`*`), `LOG_DIR` (`./logs`), `LOG_LEVEL` (`info`), `BODY_LIMIT_KB` (100).
- `core` checks each setting one time, before the port opens, with `readSetting` and `parseInteger`; the error names the variable, and the process stops with a non-zero exit code.
- `core` opens the database and applies the migrations of the features (`0001-{name}`, one transaction each, in order), and records the version of each one. An unknown version in the database stops the start with that version. No feature creates a table. The database contract (`Database`) and `openMemoryDatabase()` come with the Bedrock in `shared/database/`: the adapter of `core` opens the file with the same contract. A unit test of `core` proves the order, the record of each version and the unknown version, with `openMemoryDatabase()`.
- `core` writes its own middleware, each in `src/core/http/{concern}.middleware.ts`: CORS from `CORS_ORIGIN` (a preflight, `OPTIONS` with `Access-Control-Request-Method`, answers 204 with an empty body, and allows the methods `GET`, `HEAD`, `PUT`, `PATCH`, `POST` and `DELETE` and the headers `Content-Type`, `X-Request-Id` and `Authorization`), the security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`), the request identifier (keep a received `X-Request-Id` only if it has 1 to 128 characters, and each character is a letter, a digit or `-`; else a new unique one), the body limit (`BODY_LIMIT_KB`) and one log line for each request. The log line has the method, the full path (read before a mounted router changes it), the status and the duration in whole milliseconds with `formatMilliseconds` (`GET /api 200 12ms`), with no request identifier; its level is `ERROR` for a status of 500 or more, `WARN` from 400 to 499, and `INFO` otherwise.
- The error handler of `core` is the only code that makes an error answer. It gives each kind of the expected error its status, and logs any other error at `ERROR` with its cause.
- After the port opens, one console line with a URL that a browser can open: the configured host, or `localhost` when it listens on all interfaces; an IPv6 host in brackets. No line when it cannot start.
- Clean stop on a stop signal: finish the requests, write the log, close the database. A unit test of `core` proves it, with the life cycle as an argument: no test sends a signal of the operating system.
- Schema impact: the table of applied versions (`version`, `appliedAt`), one row for each applied migration.

### front

- Settings: `PORT` (4000), `API_BASE_URL` (`http://localhost:3000`).
- The `vite.config.ts` of the project reads the settings with `loadEnv` of Vite, never with `process.env` alone. A unit test of `core` proves that a value of the `.env` file changes `PORT` and `API_BASE_URL`, with the reader of the environment as an argument.
- The development server listens on `PORT` with `strictPort` and on all interfaces (`host: true`), as the `back`. The listening line comes only after the server listens.
- `core` serves `GET /runtime-config.json` (`{ "apiBaseUrl" }`); the HTTP client is its only reader. The development server serves it with a Connect middleware `(request, response, next)` in `src/core/http/runtime-config.middleware.ts`, as a middleware of Express: a Vite plugin in `core` registers it, and `vite.config.ts` only adds the plugin. The contract of the HTTP client is in `shared/http/`. No build for each environment.
- The HTTP client of `core` changes each error answer into the expected error, with its `fields`.
- Console logger in `core`, contract in `shared/logging/`: one line for each user action, with no words of a feature and no form value. `shell` writes one line for each page that it shows (the path) and each theme that the user selects. A unit test of `core` proves the lines.

### e2e

- Helpers in `shared` check the error body of the `back`.
- No acceptance test in this spec: the suite is ready for the contract tests of `shell`. Checked by `review-implementation`.

## Verification

### Requirements

None: a `chore` changes nothing that a person or a client sees. The unit tests of `core` prove each check, format and order with its list of values; the review checks the rules of this spec; the regression of the release runs all the tests. The contract tests of `shell` prove the wiring.

### Expected URLs and APIs

None.
