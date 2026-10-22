# Project types

The variations of each project type: its foundation specs, its tooling slots and its layers (Halloween D15). One column for each type.

Three levels, from the most generic to the most concrete. Each level only adds; it never repeats the level before it.

| Level | Specs | Tooling | Rules | Where |
| --- | --- | --- | --- | --- |
| Generic | the 6 capabilities | the slots and their contracts | the Blueprint | AIDDbot and this file |
| By type | the row of each type | which slots apply, and why | layers and folders | this file |
| By archetype | the instance of each spec in `foundation/{archetype}/` of the Builder | command and tool, in the Bedrock | project rules | each archetype |

A cell that does not apply is `n/a` with its reason. An empty cell is an error.

## 1 · Foundation specs

Deliver them in this order (Halloween D12, D13, D35, D39). Only a property of the system makes a spec optional, never the project type. Today there is one: the system has users. The Solution of each spec has the details of each type.

The core of the archetype is a framework: `scaffold`, `platform` and `presentation` are `chore` specs, with code and unit tests and no acceptance test. The acceptance suite proves only what a person or a client sees: `shell` and the features. `shell` has one contract test that proves the wiring of `platform` in the `api` (Halloween D40).

| # | Spec (question) | `api` | `web` | `cli` | `e2e` |
| --- | --- | --- | --- | --- | --- |
| 0 | `scaffold` — how is each project made? | framework, entry, slots | framework, entry, slots | entry, slots | slots; `test` passes with no test |
| 1 | `platform` — how does it start, and how do we observe it? `chore` | settings, migrations, middleware (CORS, headers, request identifier, body limit), log file, listening line, clean stop | settings, runtime configuration, listening line, console logger, errors of the HTTP client | settings and their sources, log file, exit codes 0 / 1 / 2 / 3 | the settings of each project, start of the suite, preflight, start and error helpers |
| 2 | `shell` — how do people use it? | API index, error answers 400 / 404 / 413 / 500, one contract test of the wiring | layout: frame, menu, theme, home, not-found page, contrast of the themes | usage: help, unknown command → exit code 2, `--json`, `error:` with exit code 3, log line | shell page objects, `--json` helper, contract tests |
| 3 | `presentation` — how does it show and collect data? `chore` | `readFields`, `readPage`, ISO values | card, detail, table, form, states, readable values | text table, `{label}: {value}`, `readOptions` | readers of tables and records, `recordForm`, contrast helper |
| 4 | `about` — what is it? | `GET /api/about` | tracer bullet: page `/about` and card from `GET /api/about`, version on the home page; the first card, record, table and states | `--version` and `about`, the first record | page objects of `/about` and the about card |
| 5 | `users` — who uses it? Optional: the system has users. | register, login, session, account, logout | forms, session, menu by access, page guard | n/a: a local cli has no users (Columbus D67) | API client and page objects of the session |
| 6 | `settings` — what does each person keep? In a `web`, optional with `users`. | `GET` and `PUT /api/users/me/settings` | page `/settings`: theme and date format of the account | `config get\|set`, the first table | page object of `/settings`, the `config` helpers |

An archetype delivers the instance of each spec with the rows of its types, and removes the rows of the types that it does not have.

## 2 · Tooling slots

Each slot is a capability, not a tool, and one line of the Technology of the project `AGENTS.md`. A slot that does not apply is `n/a` with its reason; an empty slot is an error. The contract of each one, for all types:

- `upgrade`: every dependency to its latest release, majors included, and the lockfile. A major that breaks a different tool: keep the last compatible one, with its reason in the project rules. It runs at the foundation and on request, never for each delivery.
- `test`: fast, with no data access, in an `api`, a `web` or a `cli`. `start`: the project with no build.
- `layers` and `crap`: one command each, from `tools/lint/`, never the rules of the hook. They never block: the findings of `layers` are medium debt, those of `crap` low debt, one item for each rule. `crap` gives the inputs of CRAP (Change Risk Anti-Patterns) as separate thresholds, and never computes the formula; its coverage is 100 for the lines and the functions of each file, except the entry, the adapters and the components (Halloween D40).

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

A project keeps only the column of its type, in the Folders of its `AGENTS.md`.

| Item | `api` | `web` | `cli` | `e2e` |
| --- | --- | --- | --- | --- |
| composition | `main`, the only file at the root of `src`: it gives the manifest and the identity to `start` of `core/lifecycle/` | the same | the same | n/a: the test runner is the entry |
| `core` folders | `lifecycle/` (composition, start, stop), `settings/`, `logging/`, `http/` (server, router, middleware, error handler), `database/` (connection, migrations) | `lifecycle/` (composition, router, start), `settings/`, `logging/`, `http/` (client, runtime configuration), `shell/` (layout, menu, navigation, not-found page), `theme/`, `session/` (the token in the browser storage) | `lifecycle/` (composition, pipeline, exit codes), `settings/`, `logging/`, `arguments/` (parser), `output/` (text and JSON writers) | `lifecycle/` (setup, teardown, preflight), `settings/` |
| features | endpoints | pages | commands | tests, one folder for each feature of the system |
| `presentation` | route / controller and its registration | page / component and its registration | command and its registration | n/a: no layers |
| `logic` | service | store / use case | service | n/a: no layers |
| `data` | repository | API client | repository / file system / API client | n/a: no layers |
| `shared` folders | `values/`, `database/`, `logging/`, `http/`, `session/` | `values/`, `state/`, `http/`, `logging/`, `components/`, `session/` | `values/`, `settings/`, `logging/`, `output/` | `values/` (the checks of the Bedrock), `page-objects/`, `test-data/`, `projects/` |

The `core` folders are a closed list too, by technical concern: no file at the root of `core`. Each one comes with the first spec that puts a file in it: the Bedrock → `theme/` (`web`); `scaffold` → `lifecycle/`; `platform` → `settings/`, `logging/`, `http/`, `database/` (`api`), `arguments/` (`cli`); `shell` → `shell/` (`web`), `output/` (`cli`); `users` → `session/` (`web`, from web-1). A folder over 16 entries divides by concern; a new folder is written in the Folders of the `AGENTS.md` of the project (Halloween D41).

The `shared` folders are a closed list, by technical concern. The root of `shared` keeps only the expected error (`expected.error`) and the identity type (`identity.type`). The Bedrock has them, and `values/` with its primitives (Daylight): the checks (`values.check`) at its root, and one folder for each type of value (`text/`, `numbers/`, `booleans/`, `dates/`, `durations/`, `email/`, `lists/`, and `readable/` in a `web`; `numbers/` in an `e2e`), so that a new type of value, such as `Url`, gets its own folder (from web-1, web-2); each other folder comes with the first spec that puts a file in it, never empty: the Bedrock → `database/` (`api`), `state/` (`web`, the store of `createStore`); `platform` → `http/` (`web`), `settings/` (`cli`), `logging/`; `shell` → `http/` (`api`), `components/` (`web`), `output/` (`cli`); `users` → `session/`. A file goes to the folder of its concern. A new folder only when no folder of the list fits: write it in the Folders of the `AGENTS.md` of the project.

## 4 · Environment primitive

Each project type has one primitive for its environment, in `shared`: the index of `shared` lists it.

| `api` | `web` | `cli` | `e2e` |
| --- | --- | --- | --- |
| `readSetting({ name, fallback, parse })` — the parsed environment variable or its fallback; an invalid value stops the startup | `readableDate(value, format)`, `readableDuration(seconds, format)` — values that a person reads, in the language of the browser; the framework escapes the text of a page | `readSetting({ name, fallback, parse })` — the parsed setting from its first source, or its fallback; an invalid value stops the invocation with exit code 3 | `uniqueValue(prefix)`, in `test-data/` — a value that no other test run uses |
