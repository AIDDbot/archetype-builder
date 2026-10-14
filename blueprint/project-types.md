# Project types

The variations of each project type: its foundation specs, its tooling slots and its layers (Halloween D15). One column for each type.

Three levels, from the most generic to the most concrete. Each level only adds; it never repeats the level before it.

| Level | Specs | Tooling | Rules | Where |
| --- | --- | --- | --- | --- |
| Generic | the 7 capabilities | the slots and their contracts | the Blueprint | AIDDbot and [`foundation/`](./foundation/) |
| By type | the row of each type | which slots apply, and why | layers and folders | this file |
| By technology | the instance in `foundation/` | command and tool | technology rules | each library |

A cell that does not apply is `n/a` with its reason. An empty cell is an error.

## 1 · Foundation specs

Deliver them in this order (Halloween D12, D13). Only a property of the system makes a spec optional, never the project type. Today there is one: the system has users. The Solution of each spec has the details of each type.

| # | Spec (question) | `api` | `web` | `cli` | `e2e` |
| --- | --- | --- | --- | --- | --- |
| 1 | [`configuration`](./foundation/configuration.spec.md) — how does it start? | `PORT`, CORS, `DATABASE_URL`, migrations | `PORT`, `API_BASE_URL` | arguments, environment, JSON file with `config get\|set`, migrations | the settings of each project, start of the suite |
| 2 | [`monitoring`](./foundation/monitoring.spec.md) — how do we observe it? | log file, error body, request identifier, security headers | listening line, console logger, errors of the HTTP client | log file, `error:` line, exit codes 0 / 1 / 2 / 3 | error helpers |
| 3 | [`shell`](./foundation/shell.spec.md) — how do people use it? | API index, unknown path → 404 | layout: frame, menu, theme, home, not-found page | usage: help, unknown command → exit code 2, `--json` | shell page objects, `--json` helper |
| 4 | [`about`](./foundation/about.spec.md) — what is it? | `GET /api/about` | page `/about`, version on the home page | `--version` and `about` | `/about` page object |
| 5 | [`health`](./foundation/health.spec.md) — does it go through all its layers? | tracer bullet, `GET /api/health` | tracer bullet, page and card | tracer bullet, `health` | preflight |
| 6 | [`users`](./foundation/users.spec.md) — who uses it? Optional: the system has users. | register, login, session, account, logout | forms, session, menu by access, page guard | n/a: a local cli has no users (Columbus D67) | API client and page objects of the session |
| 7 | [`presentation`](./foundation/presentation.spec.md) — how does it show and collect data? | list shape and pages, `readFields`, ISO values | card, detail, table, form, states, readable values | text table, `{label}: {value}`, `readOptions` | readers of tables and records, `recordForm` |

A library delivers the instance of each spec with the rows of its types, and removes the rows of the types that it does not have.

## 2 · Tooling slots

The contract of each slot is in [`project.AGENTS.template.md`](./project.AGENTS.template.md), section 3.

| Slot | `api` | `web` | `cli` | `e2e` |
| --- | --- | --- | --- | --- |
| `lint` | yes | yes | yes | yes |
| `lint:files` | yes | yes | yes | yes |
| `format` | yes | yes | yes | yes |
| `upgrade` | yes | yes | yes | yes |
| `test` | unit tests | unit tests | unit tests | the acceptance suite, headless; no unit tests, because each run proves its `core`; the core reads it as the acceptance evidence |
| `test:files` | the unit tests of the given files | the unit tests of the given files | the unit tests of the given files | n/a: the Builder checks the acceptance tests with `aidd run test --spec` |
| `start` | starts the server: reads `PORT`, answers on the health route | starts the server: reads `PORT`, answers on `/` | runs one invocation with the arguments that it gets; the `e2e` uses it as `CLI_START` | opens the interactive UI of the runner, for a human only; an agent never runs it |
| `quality` | yes | yes | yes | yes |
| `harden` | yes | yes | yes | yes |

## 3 · Architecture

A project keeps only the column of its type in section 4 of its `AGENTS.md`.

| Item | `api` | `web` | `cli` | `e2e` |
| --- | --- | --- | --- | --- |
| composition | process entry and manifest | browser entry and manifest | executable entry and manifest | n/a: the test runner is the entry |
| `core` | server, configuration, logger, connections, error handler | shell, layout, router, theme, configuration | argument parser, configuration, logger, output, error handler | life cycle of the suite |
| features | endpoints | pages | commands | tests, one folder for each feature of the system |
| `presentation` | route / controller and its registration | page / component and its registration | command and its registration | n/a: no layers |
| `logic` | service | store / use case | service | n/a: no layers |
| `data` | repository | API client | repository / file system / API client | n/a: no layers |
| `shared` concerns | `http`, `database` | `components` | `output`, `database` | `page-objects/`, `test-data/`, `database`, `projects` |

## 4 · Environment primitive

Each project type has one primitive for its environment, in the shared primitives of its `AGENTS.md` (section 5).

| `api` | `web` | `cli` | `e2e` |
| --- | --- | --- | --- |
| `readSetting(name, fallback, parse)` — the parsed environment variable or its fallback; an invalid value stops the startup | `escapeHtml(text)` — text that is safe in a page; `formatDate(value)`, `formatDuration(seconds)` — values that a person reads, in the language of the browser | `readSetting(name, fallback, parse)` — the parsed setting from its first source, or its fallback; an invalid value stops the invocation with exit code 3 | `uniqueValue(prefix)`, in `test-data/` — a value that no other test run uses |
