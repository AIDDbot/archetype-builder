<!--
Archetype-Blueprint: the technical data of one project (Columbus principles 7, 8, 11; D16, D19, D50).
The Blueprint (system, containers, layers, tests, code rules and limits) is in the root AGENTS.md, one time for the system. Never copy it here.
Three levels fill this file: [Blueprint] this file, [Archetype] the AGENTS.md of the archetype repository, [Project] {project}/AGENTS.md. No level changes the structure.
Keep the sections, their order and their headings. Write short lists and tables, not prose. Remove these comments at the project level.
For implementation examples by ecosystem, see ecosystems.md. They are guidance, not rules.
-->
# {Project_Name} — {project_type}

Obey the Blueprint of the root `AGENTS.md`. This file gives only the data of this project. Do not explore the code to learn the setup.

## 1 · Purpose and boundary

<!-- [Project] One or two lines. -->

- **Owns**: {what the project owns}
- **Never**: {what the project never does}

## 2 · Technology

<!-- [Archetype] -->

- **Language**: {language and version}
- **Runtime / framework**: {runtime and framework}
- **Main dependencies**: {library — role}
- **Package manager**: {one package manager only}
- **Pre-commit hook**: `{command}` — formats, lints and type-checks the staged files with safe fixes, and runs the unit tests that they affect

## 3 · Tooling

<!--
[Archetype] Commands and tools. [Project] Records them with `aidd config set`, and leaves out each row that the Common stack of the root AGENTS.md gives. D1, D12, D20, D26.
Each slot is a capability, not a tool. A slot that does not apply is `n/a` with its reason. An empty slot is an error.
Contracts:
- The pre-commit hook of the technology is no slot: at each commit, it formats, lints and type-checks the staged files with safe fixes (the strongest type check of the ecosystem), and runs the unit tests that they affect. A failure stops the commit.
- upgrade: every dependency to its latest release, majors included, and the lockfile. A major that breaks a different tool: keep the last compatible one and write why in the technology rules. Runs at the foundation and on request, never for each delivery.
- test: runs all the tests of the project. In an `api`, a `web` or a `cli`: the unit tests, fast and with no data access; the foundation adds a smoke test of the health logic. In an `e2e`: all the tests tagged @S{nnnn}-R{nn}, headless, and no unit tests, because each run proves its `core`.
- test:spec: only in an `e2e`: the acceptance tests of one tag. The command ends in the filter flag of the runner, because the core adds only the tag (such as @S0001-). In an `api`, a `web` or a `cli`: n/a.
- start: runs the project without a build. In an `api` or a `web`: starts the server; reads PORT; answers on the health route. In a `cli`: runs one invocation with the arguments that it gets. In an `e2e`: runs the runner for a human only, in watch mode or with its UI.
- debt:medium: a list of checks, one command each, so that each runs also after a failure: the dependency rules between layers; never the rules of the hook; never blocks; its findings go to the debt register as medium debt.
- debt:low: a list of checks, one command each: the complexity and size limits of the Blueprint and, in an `api`, a `web` or a `cli`, the test coverage of `core` and `shared`; never the rules of the hook; never blocks; its findings go to the debt register as low debt, one item for each rule.
-->

| Slot | Blocks | Command | Tool |
| --- | --- | --- | --- |
| `upgrade` | No | `{command}` | {tool} |
| `test` | Yes | `{command}` | {tool} |
| `test:spec` | Yes | `{command}` | {tool} |
| `start` | No | `{command}` | {tool} |
| `debt:medium` | No | `{command}` | {tool} |
| `debt:low` | No | `{command}` | {tool} |

## 4 · Architecture

<!--
[Blueprint] The column of this project type in section 3 of `project-types.md`, with each n/a and its reason. Principle 7, D39; Halloween D15.
[Archetype] Write how the composition gives the services of `core` to the features: by the framework injector, or as arguments of the registration. The contracts are in `shared`; a feature never imports `core`. Section 5 gives where the composition, the manifest and the facade are.
-->

**Services of `core`**: {framework injector | registration arguments}, contracts in `{shared_folder}/{contracts_location}`

| Item | `{project_type}` |
| --- | --- |
| composition | {from project-types.md} |
| `core` | {from project-types.md} |
| features | {from project-types.md} |
| `presentation` | {from project-types.md} |
| `logic` | {from project-types.md} |
| `data` | {from project-types.md} |
| `shared` concerns | {from project-types.md} |
| `test` / `start` | {from project-types.md, section 2} |

## 5 · Folder structure

<!-- [Archetype] Map each concept to a real path, and to the framework mechanism for it (`—` for plain code). [Project] Adds features when specs ship. D27. -->

| Concept | Path | Framework mechanism |
| --- | --- | --- |
| composition | `{source_root}/{main_file}`, `{source_root}/{compose_file}`, `{manifest_file}` | {mechanism} |
| `core` | `{source_root}/{core_folder}/{core_file_pattern}`, such as `app.config.ts` | {mechanism} |
| features | `{source_root}/{features_folder}/` | {mechanism} |
| facade | `{feature}/{facade_file}` | {mechanism} |
| `presentation` / `logic` / `data` / types | `{presentation_files}` / `{logic_files}` / `{data_files}` / `{type_files}` | {mechanism} |
| `shared` | `{source_root}/{shared_folder}/`, `{shared_folder}/{concern_folder}/` | {mechanism} |
| unit tests | `{unit_test_location}` | {mechanism} |

```text
{source_root}/
├── {main_file}           # entry: starts the composition
├── {compose_file}        # composition: starts core, registers the features
├── {core_folder}/        # platform, called one time at startup
├── {features_folder}/    # one flat folder for each feature, and the manifest
│   └── health/
└── {shared_folder}/      # primitives and service contracts at the root, folders by technical concern
```

### Shared primitives

<!-- [Blueprint] Seed: the scaffold makes these primitives, with their unit tests, before the first spec (Halloween cli-6). One topic for each file, one function for each contract, named by what it returns or checks; a failed check raises the expected error of `monitoring`. [Archetype] Paths and idiomatic names. [Project] `ship-spec` adds each new primitive that two or more features use. A helper of one feature (such as its page object or its test data) follows the naming convention below and gets no row. A helper of the life cycle of `core` gets no row. D29. -->

The index of `shared`. Read it before you write a check or a conversion. Helpers of one feature follow `{shared_folder}/{feature_helper_pattern}` and have no row.

| Primitive | Contract | Path |
| --- | --- | --- |
| `isRecord(value)` | True for a key-value object. Other type guards use it. | `{shared_folder}/{checks_file}` |
| `isText(value)` | True for a text with a character that is not a space. | `{shared_folder}/{checks_file}` |
| `isOneOf(value, options)` | True for one of a closed list of values; narrows the type. | `{shared_folder}/{checks_file}` |
| `findByName(items, name)` | The item with that `name`, or nothing. | `{shared_folder}/{checks_file}` |
| `requireByName(items, { name, kind })` | The item with that `name`, or an expected error that names the kind and the name. | `{shared_folder}/{checks_file}` |
| `requireText(value, field)` | Text without end spaces, or an expected error with the field. | `{shared_folder}/{text_file}` |
| `parseInteger(value, { field, min, max })` | Integer from `min` to `max`, or an expected error with the field and the range. | `{shared_folder}/{numbers_file}` |
| `formatDate(date)` | `YYYY-MM-DD` in local time. | `{shared_folder}/{dates_file}` |
| `formatTime(date)` | `HH:MM:SS.mmm` in local time. | `{shared_folder}/{dates_file}` |
| `formatDateTime(date)` | `YYYY-MM-DD HH:MM:SS` in local time, for a person. | `{shared_folder}/{dates_file}` |
| `ExpectedError(kind, message)` | The expected error, with its kind: `rule`, `usage` or `unavailable`. Each failed check raises it; `monitoring` gives each kind its exit code or status. | `{shared_folder}/{errors_file}` |
| `attempt(action, message)` | The result of `action`, or the expected error `unavailable` with `message` when an external resource fails. Only `data` and `core` use it. | `{shared_folder}/{errors_file}` |
| {environment primitive} | {contract} | {path} |

<!-- [Project] Write the environment primitive of this project type in the row above, from section 4 of `project-types.md`. -->

## 6 · Coding rules

<!-- The code rules and limits are in the Blueprint of the root AGENTS.md. -->

### Technology rules

<!-- [Archetype] Rules of the stack that the Blueprint does not cover. [Project] Leave out each rule that the Common stack of the root AGENTS.md gives. A framework mechanism (injection, routing, state, file names, generators) is used as is, with its reason; the direction of dependencies never changes. Write here each limit that the archetype changes. D27. -->

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
