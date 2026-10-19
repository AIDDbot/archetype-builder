# Project types

The variations of each project type: its foundation specs, its tooling slots and its layers (Halloween D15). One column for each type.

Three levels, from the most generic to the most concrete. Each level only adds; it never repeats the level before it.

| Level | Specs | Tooling | Rules | Where |
| --- | --- | --- | --- | --- |
| Generic | the 6 capabilities | the slots and their contracts | the Blueprint | AIDDbot and [`foundation/`](./foundation/) |
| By type | the row of each type | which slots apply, and why | layers and folders | this file |
| By technology | the instance in `foundation/` | command and tool | technology rules | each archetype |

A cell that does not apply is `n/a` with its reason. An empty cell is an error.

## 1 · Foundation specs

Deliver them in this order (Halloween D12, D13, D35). Only a property of the system makes a spec optional, never the project type. Today there is one: the system has users. The Solution of each spec has the details of each type.

The first one, `scaffold`, is a `chore`: it makes each project with its shape and its tooling slots, with no functional code.

| # | Spec (question) | `api` | `web` | `cli` | `e2e` |
| --- | --- | --- | --- | --- | --- |
| 0 | [`scaffold`](./foundation/scaffold.spec.md) — how is each project made? | generator, shape, slots | generator, shape, slots, theme | generator, shape, slots | generator, shape, slots; `test` passes with no test |
| 1 | [`configuration`](./foundation/configuration.spec.md) — how does it start? | `PORT`, CORS, `DATABASE_URL`, migrations | `PORT`, `API_BASE_URL` | arguments, environment, JSON file with `config get\|set` | the settings of each project, start of the suite, preflight |
| 2 | [`monitoring`](./foundation/monitoring.spec.md) — how do we observe it? | log file, error body, request identifier, security headers | listening line, console logger, errors of the HTTP client | log file, `error:` line, exit codes 0 / 1 / 2 / 3 | error helpers |
| 3 | [`shell`](./foundation/shell.spec.md) — how do people use it? | API index, unknown path → 404 | layout: frame, menu, theme, home, not-found page | usage: help, unknown command → exit code 2, `--json` | shell page objects, `--json` helper |
| 4 | [`about`](./foundation/about.spec.md) — what is it? | `GET /api/about` | tracer bullet: page `/about` and card from `GET /api/about`, version on the home page | `--version` and `about` | page objects of `/about` and the about card |
| 5 | [`users`](./foundation/users.spec.md) — who uses it? Optional: the system has users. | register, login, session, account, logout | forms, session, menu by access, page guard | n/a: a local cli has no users (Columbus D67) | API client and page objects of the session |
| 6 | [`presentation`](./foundation/presentation.spec.md) — how does it show and collect data? | `readFields`, ISO values | card, detail, table, form, states, readable values | text table, `{label}: {value}` | readers of tables and records, `recordForm` |

An archetype delivers the instance of each spec with the rows of its types, and removes the rows of the types that it does not have.

## 2 · Tooling slots

The contract of each slot is in [`project.AGENTS.template.md`](./project.AGENTS.template.md), section 3.

| Slot | `api` | `web` | `cli` | `e2e` |
| --- | --- | --- | --- | --- |
| `upgrade` | the root script, by `npm --prefix ../.. run upgrade` | the same | the same | the same |
| `test` | all the unit tests | all the unit tests | all the unit tests | the full acceptance suite, headless; no unit tests, because each run proves its `core`; the core reads it as the acceptance evidence |
| `test:spec` | n/a: no acceptance tests | n/a: no acceptance tests | n/a: no acceptance tests | the acceptance tests of one tag: the command ends in the filter flag of the runner, and the core adds the tag |
| `start` | starts the server: reads `PORT`, answers on the API index `GET /api` | starts the server: reads `PORT`, answers on `/` | runs one invocation with the arguments that it gets; the `e2e` uses it as `CLI_START` | runs the runner for a human only (watch mode or its UI); an agent never runs it |
| `layers` | dependencies between layers | dependencies between layers | dependencies between layers | dependencies between its containers |
| `crap` | complexity, limits of code, test coverage | complexity, limits of code, test coverage | complexity, limits of code, test coverage | complexity, limits of tests |

Lint, format and the affected unit tests are no slots: the pre-commit hook of the technology runs them at each commit, for all projects (quality gates, step 3).

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
| `shared` folders | `values/`, `database/`, `logging/`, `http/`, `session/` | `values/`, `http/`, `logging/`, `components/`, `session/` | `values/`, `settings/`, `logging/`, `output/` | `page-objects/`, `test-data/`, `database/`, `projects/` |

The `shared` folders are a closed list, by technical concern. The root of `shared` keeps only the expected error (`errors`) and the identity function (`identity`). The scaffold makes `values/` with the seed primitives; each other folder comes with the first spec that puts a file in it, never empty: `configuration` → `database/` (`api`), `http/` (`web`), `settings/` (`cli`); `monitoring` → `logging/`; `shell` → `http/` (`api`), `components/` (`web`), `output/` (`cli`); `users` → `session/`. A file goes to the folder of its concern. A new folder only when no folder of the list fits: write it in section 5 of the `AGENTS.md` of the project. The same rule divides a full folder of `core`.

## 4 · Environment primitive

Each project type has one primitive for its environment, in the shared primitives of its `AGENTS.md` (section 5).

| `api` | `web` | `cli` | `e2e` |
| --- | --- | --- | --- |
| `readSetting({ name, fallback, parse })` — the parsed environment variable or its fallback; an invalid value stops the startup | `formatDate(value)`, `formatDuration(seconds)` — values that a person reads, in the language of the browser; the framework escapes the text of a page | `readSetting({ name, fallback, parse })` — the parsed setting from its first source, or its fallback; an invalid value stops the invocation with exit code 3 | `uniqueValue(prefix)`, in `test-data/` — a value that no other test run uses |
