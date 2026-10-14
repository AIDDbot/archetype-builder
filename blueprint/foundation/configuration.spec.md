<!--
Foundation spec 1 of 7: how does the system start? (Halloween D8, D12, D13; Columbus D17, D18, D39, D44, D48, D51).
Written in ASD-STE100 Simplified Technical English. Technical names are not dictionary words.
Create: aidd spec new feat configuration "Configuration" --domain foundation
Instance: replace each role (`api`, `web`, `cli`, `e2e`) with the project name.
Remove the rows, requirements and Solution subsections of the roles that the system does not have. Then number the requirements again, with no gaps.
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

- Settings: `PORT` (3000), `HOST` (all interfaces), `DATABASE_URL` (`./data/app.sqlite`), `CORS_ORIGIN` (comma list, `*`).
- `core` checks each setting one time, before the port opens, with `readSetting` and `parseInteger`; the error names the variable.
- `core` opens the database and applies the migrations of the features (`0001-{name}`, one transaction each). No feature creates a table.
- Clean stop on a stop signal, checked by `review-implementation`: finish the requests, write the log, close the database.

### web

- Settings: `PORT` (4000), `API_BASE_URL` (`http://localhost:3000`).
- `core` serves `GET /runtime-config.json`; the HTTP client is its only reader. No build for each environment.

### cli

- A local cli owns its store: no server; each invocation does one command and stops.
- Settings: `CONFIG_FILE` (`./config.json`), `DATABASE_URL` (`./data/app.sqlite`) for a local store, `API_BASE_URL` (`http://localhost:3000`) for a cli with an `api`. One list of settings in `core` (name, default, check); a feature adds its settings there.
- Sources: the option `--{name}` (such as `--database-url`), the variable `{NAME}`, the key `{NAME}` of the configuration file, the default. `CONFIG_FILE` never comes from the file.
- Feature `config`, with the operations `get` and `set`, through the settings contract of `shared`. `set` checks the value before it writes.
- Migrations as the `api`, before the command.

### e2e

- `core` reads `{PROJECT}_DIRECTORY` (`../{folder}`, the sibling folder of the project), `{PROJECT}_PORT` (the default port of the project), `{PROJECT}_START` (the `start` slot of the project) and `E2E_STARTUP_TIMEOUT_MS` (15000); a `cli` has only `CLI_DIRECTORY` and `CLI_START`. An invalid value stops the suite.
- The suite starts each server that does not answer, and stops it after the run, also after a failure. Checked by `review-implementation`, not by an acceptance test.
- A helper in `shared` starts one project, or runs one `cli` invocation, with the environment and arguments of the test. It gives each test its own temporary database and configuration file, which all the invocations of that test share, and deletes them after the test. A test that needs a clean store makes a second helper.
- A test checks what its spec adds and the order that it needs, never that nothing else exists: later specs add settings, migrations and commands.

### All projects

- An example environment file lists each variable and its default.
- A relative path in a setting starts at the project folder, never at the working directory.
- The check of each setting: a port is an integer from 1 to 65535; a path (`CONFIG_FILE`, `DATABASE_URL`, `{PROJECT}_DIRECTORY`) or a command (`{PROJECT}_START`) is not empty; a timeout (`E2E_STARTUP_TIMEOUT_MS`) is a positive integer; a URL (`API_BASE_URL`) is an absolute `http` or `https` URL; `CORS_ORIGIN` is `*` or a comma list of origins. A setting that a feature adds has its own check.

### Schema impact

| Schema | Element | Change | Description |
| --- | --- | --- | --- |
| api.db, cli store | table of applied versions | new | `version`, `appliedAt`. One row for each applied migration. |

## Verification

### Requirements

- **R01**: WHEN the `api` starts with `PORT` set, it SHALL accept HTTP connections on that port.
- **R02**: WHEN the `api` starts without `PORT`, it SHALL accept HTTP connections on port 3000. Test: use the instance that the suite started without `PORT`.
- **R03**: WHEN a request to the `api` has an `Origin` header that `CORS_ORIGIN` contains, the `api` SHALL answer with `Access-Control-Allow-Origin` set to that origin.
- **R04**: WHILE `CORS_ORIGIN` is not set, the `api` SHALL answer each request with `Access-Control-Allow-Origin: *`.
- **R05**: WHEN the `web` starts with `PORT` set, it SHALL serve its application at `/` on that port.
- **R06**: WHEN the `web` starts without `PORT`, it SHALL serve its application at `/` on port 4000. Test: use the instance that the suite started without `PORT`.
- **R07**: WHEN the `web` starts with `API_BASE_URL` set, `GET /runtime-config.json` SHALL answer 200 with `{ "apiBaseUrl": "<that URL>" }`.
- **R08**: WHEN a server starts with a `PORT` that is not an integer from 1 to 65535, it SHALL stop with a non-zero exit code and a message that contains `PORT`.
- **R09**: WHEN a project with a database (the `api`, or a local `cli`) starts, it SHALL apply each migration that the database does not have, in order, and record the version of each one. Test: start two times on one temporary database; no version has two rows.
- **R10**: IF the database has a schema version that the project does not know, THEN the project SHALL stop with a non-zero exit code and a message that contains that version. Test: record an unknown version before the start.
- **R11**: WHEN the `cli` runs `config set <name> <value>` with a known setting and a valid value, it SHALL write the value to its configuration file and stop with exit code 0. The next invocation SHALL use that value.
- **R12**: IF `config set` gets an unknown setting or a value that is not valid for that setting, THEN the `cli` SHALL stop with a non-zero exit code and a message that contains the name of the setting, and SHALL not change the configuration file.
- **R13**: WHEN the `cli` runs `config get`, it SHALL show each setting with its value and its source: `argument`, `environment`, `file` or `default`.
- **R14**: WHEN the `cli` runs `config get <name>` with a known setting, it SHALL show only the value of that setting.
- **R15**: WHEN a setting has a value in more than one source, the `cli` SHALL use the value of the first source in this order: argument, environment, configuration file, default. Test: give three values, then remove the argument and then the variable.
- **R16**: IF the configuration file is not a valid JSON object, THEN the `cli` SHALL stop with a non-zero exit code and a message that contains the path of the file.

### Expected URLs and APIs

| Kind | Project | Address | Expected answer | Requirements |
| --- | --- | --- | --- | --- |
| api | api | any path on `PORT` | An HTTP response with the CORS header | R01–R04 |
| page | web | `/` on `PORT` | The application document | R05, R06 |
| api | web | `GET /runtime-config.json` | 200 `{ "apiBaseUrl": "..." }`. No error status. | R07 |
| process | api, web | start with an incorrect `PORT` | Stops with a message that contains `PORT` | R08 |
| process | api, cli | start on a database | Applies the missing migrations, or stops on an unknown version | R09, R10 |
| command | cli | `config set <name> <value>` | Writes the file. Exit code 0. An unknown name or an invalid value: the file does not change. | R11, R12 |
| command | cli | `config get [<name>]` | Each setting with its value and source, or the value of one setting | R13–R15 |
| process | cli | any command with an incorrect configuration file | Stops with a message that contains the path | R16 |
