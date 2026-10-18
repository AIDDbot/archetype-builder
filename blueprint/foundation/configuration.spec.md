<!--
Foundation spec 1 of 6: how does the system start? (Halloween D8, D12, D13, D35; Columbus D17, D18, D39, D44, D48, D51).
Written in ASD-STE100 Simplified Technical English. Technical names are not dictionary words.
Create: aidd spec new feat configuration "Configuration" --domain foundation
Instance: replace each role (`api`, `web`, `cli`, `e2e`) with the project name.
Remove the user stories, rows, requirements and Solution subsections of the roles that the system does not have. Then number the requirements again, with no gaps.
The technology is in the AGENTS.md of each project, never here.
-->
# {id}-configuration — Configuration

## Problem

Each project must start in the same way in each environment, with its settings outside the code.

### User Stories

- As an operator, I want **to set each project with environment variables** so that one build operates in each environment.
- As a developer, I want **an incorrect setting to stop the project when it starts** so that I never examine a system with an incomplete configuration.
- As a user of a `cli`, I want **to keep my settings in a file and change them with a command** so that I do not type them at each invocation.

### Business rules

- Each setting must have a documented default.
- A project must stop cleanly: it must not lose a request in progress or a log line.
- A `cli` must read each setting from the first source that has it: argument, environment, configuration file, default.

### Out of context

- The log, the error format and the exit codes (`monitoring`). The version (`about`).
- The management of secrets.
- A configuration file for the `api` and the `web`: only environment variables and an optional local `.env` file.

## Solution

### api

- Settings: `PORT` (3000), `HOST` (all interfaces), `DATABASE_URL` (`./data/app.sqlite`), `CORS_ORIGIN` (comma list, `*`), and the settings of the logger of `monitoring`: `LOG_DIR` (`./logs`), `LOG_LEVEL` (`debug`, `info`, `warn`, `error`; `info`).
- `core` checks each setting one time, before the port opens, with `readSetting` and `parseInteger`; the error names the variable.
- `core` opens the database and applies the migrations of the features (`0001-{name}`, one transaction each). No feature creates a table.
- Clean stop on a stop signal, checked by `review-implementation`: finish the requests, write the log, close the database.

### web

- Settings: `PORT` (4000), `API_BASE_URL` (`http://localhost:3000`).
- The development server listens on `PORT` with `strictPort` and on all interfaces (`host: true`), as the `api`. With the default `localhost`, Vite can listen on `::1` only, and the suite, which calls `127.0.0.1`, gets no answer.
- `core` serves `GET /runtime-config.json`; the HTTP client is its only reader. No build for each environment.

### cli

- A local cli: no server; each invocation does one command and stops. No database: a spec that stores data adds it.
- Settings: `CONFIG_FILE` (`./config.json`), `LOG_DIR` and `LOG_LEVEL` as the `api`, `API_BASE_URL` (`http://localhost:3000`) for a cli with an `api`. One list of settings in `core` (name, default, check); a feature adds its settings there.
- Sources: the option `--{name}` (such as `--config-file`), the variable `{NAME}`, the key `{NAME}` of the configuration file, the default. `CONFIG_FILE` never comes from the file.
- `core` parses the arguments one time, in one function, from options as data: each setting gives its option. A later spec adds its options to that parse, never a second parse.
- Feature `config`, with the operations `get` and `set`, through the settings contract of `shared`. `set` checks the value before it writes.

### e2e

- `core` reads `{PROJECT}_DIRECTORY` (`../{folder}`, the sibling folder of the project), `{PROJECT}_PORT` (the default port of the project), `{PROJECT}_START` (the command of the `start` slot of the project, run directly and never through npm, such as `node src/app.main.ts`) and `E2E_STARTUP_TIMEOUT_MS` (15000); a `cli` has only `CLI_DIRECTORY` and `CLI_START`. An invalid value stops the suite. Checked by `review-implementation`, never by an acceptance test: no test runs the suite, and the `e2e` has no unit tests.
- The suite starts each server that does not answer, and stops it after the run, also after a failure. Checked by `review-implementation`, not by an acceptance test.
- A preflight, not a test: it checks `GET /api` and `/` before the first test, and stops the run with the name of a project that does not answer. A `cli` has no preflight.
- A helper in `shared` starts one project, or runs one `cli` invocation, with the environment and arguments of the test. It gives each test a temporary folder for each setting that is a path: the database (`api`), the configuration file (`cli`) and the log folder. All the invocations of that test share them, and the helper deletes them after the test. No test writes a file inside the repository. A test that needs a clean one makes a second helper. A test that needs the default value of a path setting runs on a copy of the project in a temporary folder, which the helper makes; the copy also has the root `package.json`, because `shell` and `about` read the identity there.
- A test checks what its spec adds and the order that it needs, never that nothing else exists: later specs add settings, migrations and commands.

### All projects

- An example environment file lists each variable and its default.
- A relative path in a setting starts at the project folder, never at the working directory.
- The check of each setting: a port is an integer from 1 to 65535; a path (`CONFIG_FILE`, `DATABASE_URL`, `LOG_DIR`, `{PROJECT}_DIRECTORY`) or a command (`{PROJECT}_START`) is not empty; a timeout (`E2E_STARTUP_TIMEOUT_MS`) is a positive integer; a URL (`API_BASE_URL`) is an absolute `http` or `https` URL; `LOG_LEVEL` is one of its four values; `CORS_ORIGIN` is `*` or a comma list of origins. A setting that a feature adds has its own check.

### Schema impact

| Schema | Element | Change | Description |
| --- | --- | --- | --- |
| api.db | table of applied versions | new | `version`, `appliedAt`. One row for each applied migration. |

## Verification

### Requirements

- **R01**: WHEN the `api` starts, it SHALL accept HTTP connections on `PORT`, or on port 3000 without it. Test: the default uses the instance that the suite started without `PORT`.
- **R02**: WHEN a request to the `api` has an `Origin` header that `CORS_ORIGIN` contains, the `api` SHALL answer with `Access-Control-Allow-Origin` set to that origin. WHILE `CORS_ORIGIN` is not set, it SHALL answer `Access-Control-Allow-Origin: *`.
- **R03**: WHEN the `web` starts, it SHALL serve its application at `/` on `PORT`, or on port 4000 without it. Test: the default uses the instance that the suite started without `PORT`.
- **R04**: WHEN the `web` starts with `API_BASE_URL` set, `GET /runtime-config.json` SHALL answer 200 with `{ "apiBaseUrl": "<that URL>" }`.
- **R05**: WHEN a server starts with a `PORT` that is not an integer from 1 to 65535, it SHALL stop with a non-zero exit code and a message that contains `PORT`.
- **R06**: WHEN the `api` starts, it SHALL apply each migration that the database does not have, in order, and record the version of each one. IF the database has a version that the `api` does not know, THEN it SHALL stop with a non-zero exit code and a message that contains that version. Test: start two times on one temporary database, and no version has two rows; record an unknown version before a start.
- **R07**: WHEN the `cli` runs `config set <name> <value>` with a known setting and a valid value, it SHALL write the value to its configuration file, stop with exit code 0, and the next invocation SHALL use it. IF the setting is unknown or the value is not valid, THEN it SHALL stop with a non-zero exit code and a message that contains the name, and not change the file.
- **R08**: WHEN the `cli` runs `config get`, it SHALL show each setting with its value and its source (`argument`, `environment`, `file` or `default`), and with a name, only the value of that setting. Test: check each setting of this spec, never the whole list or its order, because later specs add settings.
- **R09**: WHEN a setting has a value in more than one source, the `cli` SHALL use the first source in this order: argument, environment, configuration file, default. Test: give three values, then remove the argument and then the variable.
- **R10**: IF the configuration file is not a valid JSON object, THEN the `cli` SHALL stop with a non-zero exit code and a message that contains the path of the file.

### Expected URLs and APIs

| Kind | Project | Address | Expected answer | Requirements |
| --- | --- | --- | --- | --- |
| api | api | any path on `PORT` | An HTTP response with the CORS header | R01, R02 |
| page | web | `/` on `PORT` | The application document | R03 |
| api | web | `GET /runtime-config.json` | 200 `{ "apiBaseUrl": "..." }`. No error status. | R04 |
| process | api, web | start with an incorrect `PORT` | Stops with a message that contains `PORT` | R05 |
| process | api | start on a database | Applies the missing migrations, or stops on an unknown version | R06 |
| command | cli | `config set <name> <value>` | Writes the file. Exit code 0. An unknown name or an invalid value: the file does not change. | R07 |
| command | cli | `config get [<name>]` | Each setting with its value and source, or the value of one setting | R08, R09 |
| process | cli | any command with an incorrect configuration file | Stops with a message that contains the path | R10 |
