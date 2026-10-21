<!--
Archetype-Blueprint: the technical data of one project (Columbus principles 7, 8, 11; D16, D19, D50).
The Blueprint of the root AGENTS.md has the system rules and the code rules, one time for the system. Never copy them here. The architecture of the project type (containers, layers, tests) is in section 4 of this file.
Three levels fill this file: [Blueprint] this file, [Archetype] the AGENTS.md of the archetype repository, [Project] {project}/AGENTS.md. No level changes the structure.
Keep the sections, their order and their headings. Write short lists and tables, not prose. The file has fewer than 100 lines. Remove these comments at the project level.
For implementation examples by ecosystem, see ecosystems.md. They are guidance, not rules.
-->
# {Project_Name} — {project_type}

Obey the Blueprint of the root `AGENTS.md`. This file gives the architecture and the data of this project. Do not explore the code to learn the setup.

## 1 · Purpose and boundary

<!-- [Project] One or two lines. -->

- **Owns**: {what the project owns}
- **Never**: {what the project never does}

## 2 · Technology

<!-- [Archetype] -->

- **Language**: {language and version}
- **Runtime / framework**: {runtime and framework}
- **Main dependencies**: {library — role}. The closed list: no other dependency, unless a spec names it
- **Package manager**: {one package manager only}
- **Pre-commit hook**: `{command}` — formats, lints and type-checks the staged files with safe fixes, and runs the unit tests that they affect

## 3 · Tooling

<!--
[Archetype] Commands and tools. [Project] Records them with `aidd config set`, and leaves out each row that the Common stack of the root AGENTS.md gives. D1, D12, D20, D26.
Each slot is a capability, not a tool. A slot that does not apply is `n/a` with its reason. An empty slot is an error.
Contracts:
- The pre-commit hook of the technology is no slot: at each commit, it formats, lints and type-checks the staged files with safe fixes (the strongest type check of the ecosystem), and runs the unit tests that they affect. A failure stops the commit.
- upgrade: every dependency to its latest release, majors included, and the lockfile. A major that breaks a different tool: keep the last compatible one and write why in the technology rules. Runs at the foundation and on request, never for each delivery.
- test: runs all the tests of the project. In an `api`, a `web` or a `cli`: the unit tests, fast and with no data access. In an `e2e`: all the tests tagged @S{nnnn}-R{nn}, headless, and no unit tests, because each run proves its `core`.
- test:spec: only in an `e2e`: the acceptance tests of one tag. The command ends in the filter flag of the runner, because the core adds only the tag (such as @S0001-). In an `api`, a `web` or a `cli`: n/a.
- start: runs the project without a build. In an `api`: starts the server; reads PORT; answers on the API index `GET /api`. In a `web`: starts the server; reads PORT; answers on `/`. In a `cli`: runs one invocation with the arguments that it gets. In an `e2e`: runs the runner for a human only, in watch mode or with its UI.
- layers: one command: the dependency rules between layers in `.lint/`; never the rules of the hook; never blocks; its findings go to the debt register as medium debt.
- crap: one command: the complexity and size limits of `.lint/` and then, in an `api`, a `web` or a `cli`, the test coverage: 100 for the lines and the functions of each file, except the entry, the adapters and the components (Halloween D40). They are the inputs of CRAP (Change Risk Anti-Patterns) as separate thresholds: never compute the CRAP formula; never the rules of the hook; never blocks; its findings go to the debt register as low debt, one item for each rule.
-->

| Slot | Blocks | Command | Tool |
| --- | --- | --- | --- |
| `upgrade` | No | `{command}` | {tool} |
| `test` | Yes | `{command}` | {tool} |
| `test:spec` | Yes | `{command}` | {tool} |
| `start` | No | `{command}` | {tool} |
| `layers` | No | `{command}` | {tool} |
| `crap` | No | `{command}` | {tool} |

## 4 · Architecture

<!--
[Blueprint] The column of this project type in section 3 of `project-types.md`, with each n/a and its reason. Principle 7, D39; Halloween D15.
[Archetype] Write how the composition gives the services of `core` to the features: by the framework injector, or as arguments of the registration. The contracts are in `shared`; a feature never imports `core`. Section 5 gives where the composition, the manifest and the facade are.
-->

| Item | `{project_type}` |
| --- | --- |
| services of `core` | {framework injector | registration arguments}, contracts in `{shared_folder}/{contracts_location}` |
| composition | {from project-types.md} |
| `core` | {from project-types.md} |
| features | {from project-types.md} |
| `presentation` | {from project-types.md} |
| `logic` | {from project-types.md} |
| `data` | {from project-types.md} |
| `shared` folders | {from project-types.md} |
| `test` / `start` | {from project-types.md, section 2} |

### Containers and layers

<!-- [Blueprint] In an `api`, a `web` or a `cli`: copy this block as written. In an `e2e`: remove it and keep the block Suite. -->

| Container | Is | Never |
| --- | --- | --- |
| `core` | The platform that the entry calls one time at startup: composition, server or shell, router, connections, error handler, global styles. Each file in the folder of its concern, from the closed list of `core` folders of `project-types.md` (section 3); no file at the root of `core`. | Business rules. Imports of a feature. Folders `utils`, `helpers`, `common`, `misc`. |
| `shared` | Generic elements with no domain, and the contracts of the services that features need (such as the logger, the HTTP client or the error type). At the root, only the expected error and the identity type; each other file in the folder of its concern, from the closed list of `shared` folders of `project-types.md` (section 3). | Domain words. Imports of `core` or of a feature. Folders `utils`, `helpers`, `common`, `misc`. |
| feature | One flat folder for one unit of business value. The role in each file name tells its layer. | Subfolders. Imports of `core`. Imports of a different feature, except its facade. |
| composition | The entry `main`, the only file at the root of the source: it gives the manifest (one explicit list of the features by name) and the identity to `start` of `core/lifecycle/`, with no other statement. `core/lifecycle/` registers each feature of the manifest and gives the features the services of `core` through the contracts of `shared`. `core` gets the features as data, never imports one. | Automatic discovery: folder scans, global decorators, file-based routers. Logic in `main`. |

- composition → `presentation` → `logic` → `data`. A different feature → `facade` → `logic`. A layer never skips the next one: only the registration creates `data` and gives it to `logic`. Types are not a layer: each layer can use types, `shared` and the facades of other features.
- `presentation`: input, output and the registration of the feature (route, page, command). No business rules. Only the composition imports it.
- `facade`: the public functions and types for other features. Only other features import it. A feature that gives nothing has no facade.
- `logic`: rules and decisions. It does not know how data is stored.
- `data`: all that the project reads or writes outside itself (database, remote API, files).
- A feature that the manifest loads on demand has no other import. Tests start the application through the composition, without a port.
- Unit tests prove `logic`, at least one for each business rule, with a fake `data`. They also prove `shared`, `core` and each other file with code: only the entry, the adapters of `core` and the components have no unit test (Halloween D40). They are fast and independent, and touch no disk, database, network or process: they get each one as an argument, with a fake, never by replacing a module (`vi.mock`); the acceptance tests prove `data` and the adapters of `core`. Each one sits beside its module, with the same name. The pre-commit hook runs the ones that a commit affects. A business rule without a unit test is debt.

### Suite

<!-- [Blueprint] In an `e2e`: copy this block as written. In other projects: remove it. -->

- `e2e` has no layers, no manifest, no composition and no unit tests. The runner is the entry, and each run proves its `core`: the life cycle of the suite (setup, teardown, startup check of the projects).
- An acceptance test proves one requirement. Its name contains the identifier of that requirement.
- An e2e test uses only the API, the screens and the commands. It starts each project only with its start command, and never injects code into its process. It never uses `core` or a different feature. No test opens the database: a unit test of `core` proves the migrations with a fake database. Each test makes its own data with unique values. One browser engine (Chromium), unless the system asks for more.

## 5 · Folder structure

<!-- [Archetype] Map each concept to a real path, and to the framework mechanism for it (`—` for plain code). [Project] Adds features when specs ship. D27. -->

| Concept | Path | Framework mechanism |
| --- | --- | --- |
| composition | `{source_root}/{main_file}`, `{manifest_file}`, `{core_folder}/lifecycle/{compose_file}` | {mechanism} |
| `core` | `{source_root}/{core_folder}/{concern_folder}/{core_file_pattern}`, such as `settings/app.settings.ts` | {mechanism} |
| features | `{source_root}/{features_folder}/` | {mechanism} |
| facade | `{feature}/{facade_file}` | {mechanism} |
| `presentation` / `logic` / `data` / types | `{presentation_files}` / `{logic_files}` / `{data_files}` / `{type_files}` | {mechanism} |
| `shared` | `{source_root}/{shared_folder}/`, `{shared_folder}/{concern_folder}/` | {mechanism} |
| imports out of a folder | `{shared_import}` for `shared`, `{core_import}` for `core` (only `core` and the composition), `{facade_import}` for a facade; never a parent folder | {mechanism} |
| unit tests | `{unit_test_location}` | {mechanism} |

```text
{source_root}/
├── {main_file}           # entry, alone: gives the manifest and the identity to start of core
├── {core_folder}/        # platform, called one time at startup; the closed list of folders by technical concern
│   └── lifecycle/        # composition, start, stop
├── {features_folder}/    # one flat folder for each feature, and the manifest
│   └── about/
└── {shared_folder}/      # errors and identity at the root; the closed list of folders by technical concern
```

### Shared primitives

<!-- [Blueprint] The Bedrock has these primitives, with their unit tests, in each project that is not an `e2e` (Daylight). Each one passes the debt checks: read it as the reference of the code rules. One topic for each file (`{topic}.{role}.ts`), one function for each contract, named by what it returns or checks; a failed check raises the expected error. [Project] `ship-spec` adds each new primitive that two or more features use. A helper of one feature (such as its page object or its test data) follows the naming convention below and gets no row. A helper of the life cycle of `core` gets no row. An `e2e` keeps only the row of `values.check.ts`, the checks that it uses to read JSON. D29. -->

The index of `shared`. Read it before you write a check, a conversion or a format: never write a second version of one. Helpers of one feature follow `{shared_folder}/{feature_helper_pattern}` and have no row.

| Primitives | Contract | Path |
| --- | --- | --- |
| `isMissing`, `isEmpty`, `isRecord`, `isText`, `isOneOf` | Type guards: `null` or `undefined`; missing, blank, or an empty list or record; a key-value object; a text that is not blank; one of a closed list. | `{shared_folder}/values/values.check.ts` |
| `findByName`, `requireByName` | The item with that `name`: or nothing, or an expected error with the kind and the name. | `{shared_folder}/values/lists/lists.find.ts` |
| `requireText`, `optionalText`, `requireLength` | Text without end spaces: required, or nothing when blank, or with `{ field, min, max }` characters. | `{shared_folder}/values/text/text.parse.ts` |
| `truncateText`, `padText` | The text cut with `…` inside a width; in a column `{ width, align }`. | `{shared_folder}/values/text/text.format.ts` |
| `parseInteger`, `parseNumber`, `parseBoolean`, `parseDate` | A value from a text or its type, in `{ field, min, max }`; a boolean from `true`, `false`, `1`, `0`; a date from ISO. | `{shared_folder}/values/{numbers,booleans,dates}/{numbers,booleans,dates}.parse.ts` |
| `formatDate`, `formatTime`, `formatDateTime` | `YYYY-MM-DD`, `HH:MM:SS.mmm`, `YYYY-MM-DD HH:MM:SS`, in local time. | `{shared_folder}/values/dates/dates.format.ts` |
| `ExpectedError`, `ruleError`, `attempt` | The expected error (`rule`, `usage`, `unavailable`) that each failed check raises; a `rule` error of one field; the result of an action, or `unavailable` when an external resource fails (only `data` and `core`). | `{shared_folder}/expected.error.ts` |
| `Identity` | The type of the identity in the `package.json` of the project. | `{shared_folder}/identity.type.ts` |
| `Database`, `openMemoryDatabase` | Only an `api`: the contract of the database, and a database in memory for the unit tests of `data`, with real SQL. | `{shared_folder}/database/database.{contract,open}.ts` |
| {environment primitive} | {contract} | {path} |

<!-- [Project] Write the environment primitive of this project type in the row above, from section 4 of `project-types.md`. -->

## 6 · Coding rules

<!-- The code rules and the limits are in the Blueprint of the root AGENTS.md. -->

### Technology rules

<!-- [Blueprint] Copy the code rules of the stack from `ecosystems.md` (section Code rules of each project) as written: each one prevents a finding of `layers` or `crap`. [Archetype] Rules of the stack that the Blueprint does not cover. [Project] Leave out each rule that the Common stack of the root AGENTS.md gives. A framework mechanism (injection, routing, state, file names, generators) is used as is, with its reason; the direction of dependencies never changes. Write here each limit that the archetype changes. D27. -->

- {rule — reason}

### Project rules

<!-- [Project] `ship-spec` adds lessons from shipped specs. Empty at the start. -->

| Rule | Scope | Origin |
| --- | --- | --- |

## 7 · Connections

<!-- [Project] What the project needs and what it gives. -->

- **Needs**: {sibling projects or external systems}
- **Gives to**: {sibling projects or external systems}
- **Port**: `PORT` = {default}
- **Environment variables**: `{NAME}` — {purpose}
