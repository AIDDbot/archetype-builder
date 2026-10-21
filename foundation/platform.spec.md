<!--
Foundation spec 1 of 6: how does each project start, and how do we observe it? (Halloween D39; it replaces `configuration` and `monitoring`). It comes after `scaffold`.
Written in ASD-STE100 Simplified Technical English. Technical names are not dictionary words.
Create: aidd spec new chore platform "Platform" --domain foundation
Instance: replace each role (`api`, `web`, `cli`, `e2e`) with the project name.
Remove the rules and Solution subsections of the roles that the system does not have.
A `chore` has no requirements and no acceptance test: the unit tests of `core`, the review and the regression of the release are its verification. `shell` proves the wiring with its contract tests (Halloween D39).
The technology is in the AGENTS.md of each project, never here.
-->
# {id}-platform — Platform

## Problem

Each project must start in the same way in each environment, with its settings outside the code, and the operator must see what occurred when a failure occurs. Each later spec must use these services, never make its own.

### User Stories

- As an operator, I want **to set each project with environment variables, and an incorrect setting to stop it when it starts** so that one build operates in each environment, never with an incomplete configuration.
- As an operator, I want **one short log line for each request, each command and each error, in a daily file** so that I can find the cause of a failure.
- As a developer, I want **each server to show its address when it starts** so that I can open it.

### Business rules

- Each setting must have a documented default and a check. A relative path in a setting starts at the project folder, never at the working directory.
- A project must stop cleanly: it must not lose a request in progress or a log line.
- A log line must be plain text that a person can read, never JSON. A log line or a console line must never contain a password, a token or a form value.
- An error must not show internal details.

### Out of context

- What a person or a client sees: the error answers of the API, the `error:` line of the `cli` and the contract tests (`shell`), the `config` command and the preferences (`settings`).
- The management of secrets. Metrics, tracing, log shipping, rate limits. Log rotation, other than one file for each day.
- A configuration file for the `api` and the `web`: only environment variables and an optional local `.env` file.

## Solution

### All projects

- Each file of `core` is in the folder of its concern, from the closed list of `core` folders of `project-types.md` (section 3), with its unit test: `settings/`, `logging/`, `http/`, `database/`, `lifecycle/`. Only the entry `main` is at the root of `src`: it gives the manifest and the identity to `start` of `core/lifecycle/`, which composes the application, starts it and stops it (Halloween D40, D41).
- An example environment file lists each variable and its default.
- The check of each setting: a port is an integer from 1 to 65535; a path (`CONFIG_FILE`, `DATABASE_URL`, `LOG_DIR`, `{PROJECT}_DIRECTORY`) or a command (`{PROJECT}_START`) is not empty; a timeout (`E2E_STARTUP_TIMEOUT_MS`) is a positive integer; a URL (`API_BASE_URL`) is an absolute `http` or `https` URL; `LOG_LEVEL` is one of `debug`, `info`, `warn`, `error`; `CORS_ORIGIN` is `*` or a comma list of origins; `BODY_LIMIT_KB` is a positive integer. A setting that a feature adds has its own check. A unit test of `core` proves each check with its list of values: the invalid ones and each limit.
- Logger in `core/logging/`, contract in `shared/logging/`: one line for each event in `{LOG_DIR}/{yyyy-mm-dd}.log`, with the columns `time source LEVEL message` (local time `HH:MM:SS.mmm`; `source` is the project name), ` | ` for line breaks, `WARN` and `ERROR` also to standard error. `LOG_LEVEL` filters each line below it. It never blocks the work, and writes each queued line before the stop. The logger reads `LOG_DIR` and `LOG_LEVEL` only through their definitions, also before the configuration loads, so that a failure at startup has a log line. An invalid `LOG_DIR` writes no file; an invalid `LOG_LEVEL` takes its fallback. The file of each line comes from the time of that line, never from the time of the start: after midnight, the next line goes to the file of the new day. A unit test of `core` proves the format, the filter, the change of day and the stop, with the clock and the life cycle as arguments (Daylight, from web-I).
- The expected error of `shared`, a seed of the scaffold, gets a kind, a message and optional `fields`.

### api

- Settings: `PORT` (3000), `HOST` (all interfaces), `DATABASE_URL` (`./data/app.sqlite`), `CORS_ORIGIN` (`*`), `LOG_DIR` (`./logs`), `LOG_LEVEL` (`info`), `BODY_LIMIT_KB` (100).
- `core` checks each setting one time, before the port opens, with `readSetting` and `parseInteger`; the error names the variable, and the process stops with a non-zero exit code.
- `core` opens the database and applies the migrations of the features (`0001-{name}`, one transaction each, in order), and records the version of each one. An unknown version in the database stops the start with that version. No feature creates a table. The database contract is in `shared/database/`. A unit test of `core` proves the order, the record of each version and the unknown version, with a fake database.
- `core` writes its own middleware, each in `src/core/http/{concern}.middleware.ts`: CORS from `CORS_ORIGIN` (a preflight, `OPTIONS` with `Access-Control-Request-Method`, answers 204 with an empty body), the security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`), the request identifier (keep a received `X-Request-Id` only if it has 1 to 128 characters, and each character is a letter, a digit or `-`; else a new unique one), the body limit (`BODY_LIMIT_KB`) and one log line for each request. The log line has the method, the full path (read before a mounted router changes it), the status and the duration in milliseconds, with no request identifier; its level is `ERROR` for a status of 500 or more, `WARN` from 400 to 499, and `INFO` otherwise.
- The error handler of `core` is the only code that makes an error answer. It gives each kind of the expected error its status, and logs any other error at `ERROR` with its cause.
- After the port opens, one console line with a URL that a browser can open: the configured host, or `localhost` when it listens on all interfaces; an IPv6 host in brackets. No line when it cannot start.
- Clean stop on a stop signal: finish the requests, write the log, close the database. A unit test of `core` proves it, with the life cycle as an argument: no test sends a signal of the operating system.
- Schema impact: the table of applied versions (`version`, `appliedAt`), one row for each applied migration.

### web

- Settings: `PORT` (4000), `API_BASE_URL` (`http://localhost:3000`).
- The `vite.config.ts` of the project reads the settings with `loadEnv` of Vite, never with `process.env` alone: Vite loads the `.env` file after it reads its configuration, and it does not copy the values to `process.env`. A unit test of `core` proves that a value of the `.env` file changes `PORT` and `API_BASE_URL`, with the reader of the environment as an argument (Daylight, from web-I).
- The development server listens on `PORT` with `strictPort` and on all interfaces (`host: true`), as the `api`. With the default `localhost`, Vite can listen on `::1` only, and the suite, which calls `127.0.0.1`, gets no answer. The listening line comes only after the server listens.
- `core` serves `GET /runtime-config.json` (`{ "apiBaseUrl" }`); the HTTP client is its only reader. The contract of the HTTP client is in `shared/http/`. No build for each environment.
- The HTTP client of `core` changes each error answer into the expected error, with its `fields`.
- Console logger in `core`, contract in `shared/logging/`: one line for each user action, with no words of a feature and no form value. `shell` writes one line for each page that it shows (the path) and each theme that the user selects. A unit test of `core` proves the lines.

### cli

- A local cli: no server; each invocation does one command and stops. No database: a spec that stores data adds it.
- Settings: `CONFIG_FILE` (`./config.json`), `LOG_DIR` and `LOG_LEVEL` as the `api`, `API_BASE_URL` (`http://localhost:3000`) for a cli with an `api`. One list of settings in `core` (name, default, check); a feature adds its settings there.
- Sources, in this order: the option `--{name}` (such as `--config-file`), the variable `{NAME}`, the key `{NAME}` of the configuration file, the default. `CONFIG_FILE` never comes from the file. A unit test of `core` proves the order with the sources as arguments.
- `core` parses the arguments one time, in one function, from options as data: each setting gives its option. A later spec adds its options to that parse, never a second parse.
- The settings contract is in `shared/settings/`, with `readSetting`. A configuration file that is not a valid JSON object is an `unavailable` error with its path.
- The expected error gives each kind its exit code: `rule` (1), `usage` (2) or `unavailable` (3). `core` catches each failure at the top level and is the only code that makes an exit code. An unexpected failure writes `error: Unexpected failure`, exit code 1, and logs its cause. Never a stack trace on the console. A unit test of `core` proves it: no test injects a failure into the `cli` process.
- One log line for each invocation: the command, the exit code and the duration in milliseconds, with no argument value; `ERROR` for exit code 3, `WARN` for 1 and 2, `INFO` for 0.
- Results go to standard output; messages and errors go to standard error.

### e2e

- `core` reads `{PROJECT}_DIRECTORY` (`../{folder}`), `{PROJECT}_PORT` (the default port of the project), `{PROJECT}_START` (the command of the `start` slot, run directly and never through npm) and `E2E_STARTUP_TIMEOUT_MS` (15000); a `cli` has only `CLI_DIRECTORY` and `CLI_START`. An invalid value stops the suite.
- The suite starts each server that does not answer, and stops it after the run, also after a failure. A preflight, not a test, checks `GET /api` and `/` before the first test, and stops the run with the name of a project that does not answer. A `cli` has no preflight.
- A helper in `shared` starts one project, or runs one `cli` invocation, with the environment and arguments of the test. It gives each test a temporary folder, and each setting that is a path points into it: a folder setting (`LOG_DIR`) is a folder there, and a file setting (`DATABASE_URL`, `CONFIG_FILE`) is a file there, never the folder itself (Daylight, from web-I). After the test, it stops each process that it started, waits until each one has ended, and deletes the folders with retries. No test writes a file inside the repository.
- Helpers in `shared` check the error body of the `api` and the `error:` line and exit code of the `cli`.
- No acceptance test in this spec: the suite is ready for the contract tests of `shell`. Checked by `review-implementation`.

## Verification

### Requirements

None: a `chore` changes nothing that a person or a client sees. The unit tests of `core` prove each check, format and order with its list of values; the review checks the rules of this spec; the regression of the release runs all the tests. The contract tests of `shell` prove the wiring.

### Expected URLs and APIs

None.
