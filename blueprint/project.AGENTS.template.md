<!--
Archetype-Blueprint: the data of one project (Halloween D59). A map, not a manual: the code rules of `implement-project` (`.agents/skills/implement-project/references/code-rules.md`) give the rules one time for the system. Never copy them here.
Three levels fill this file: [Blueprint] this file, [Archetype] the AGENTS.md of the archetype repository, [Project] {project}/AGENTS.md. No level changes the sections or their order.
Write short lists and tables, not prose. Remove each comment and each empty section. `aidd release` refuses a file over 128 lines, with a comment, or with an empty section.
For implementation examples by ecosystem, see ecosystems.md. They are guidance, not rules.
-->
# {Project_Name} — {project_type}

## Purpose

<!-- [Project] One or two lines. -->

- **Owns**: {what the project owns}
- **Never**: {what the project never does}

## Technology

<!-- [Archetype] The slots: the commands that `aidd config set` records, one line; a slot that does not apply is `n/a` with its reason. -->

- **Stack**: {language and version}; {runtime and framework}; {package manager}.
- **Dependencies**: {library — role}. The closed list: no other dependency, unless a spec names it.
- **Slots**: `test` `{command}`; `test:spec` `{command | n/a: reason}`; `start` `{command}`; `layers` `{command}`; `crap` `{command}`; `upgrade` `{command}`.

## Folders

<!-- [Blueprint] The column of this project type in section 3 of `project-types.md`. [Archetype] The real paths and the mechanism of the framework (`—` for plain code). In an `e2e`: the rows of the suite only. -->

| Concept | Path | Mechanism |
| --- | --- | --- |
| composition | `{source_root}/{main_file}`, `{manifest_file}`, `{core_folder}/lifecycle/{compose_file}` | {mechanism} |
| `core` | `{core_folder}/{concern}/{topic}.{role}.ts`; the folders: {closed list from project-types.md} | {mechanism} |
| features | `{features_folder}/{feature}/`, {what a feature gives: endpoints, pages, commands} | {mechanism} |
| facade | `{feature}/{facade_file}` | {mechanism} |
| `presentation` / `logic` / `data` / types | `{presentation_files}` / `{logic_files}` / `{data_files}` / `{type_files}` | {mechanism} |
| `shared` | `{shared_folder}/{concern}/`; the folders: {closed list from project-types.md}; the index: `{shared_folder}/README.md` | {mechanism} |
| services of `core` | {framework injector | registration arguments}, contracts in `{shared_folder}/{contracts_location}` | {mechanism} |
| imports out of a folder | `{shared_import}` for `shared`, `{core_import}` for `core` (only `core` and the composition), `{facade_import}` for a facade; never a parent folder | {mechanism} |
| unit tests | `{unit_test_location}` | {mechanism} |

## Platform

<!-- [Project] The contract of the project, then one line for each folder of `core` that exists: what it owns. A change replaces the line of its folder; never add a line for a feature: its spec and the PRD give it. -->

- **Needs**: {sibling projects or external systems}. **Gives to**: {sibling projects or external systems}.
- **Port**: `PORT` = {default}. **Variables**: `{NAME}` = {default} — {purpose}.
- `{core_folder}/{concern}/`: {what it owns, in one line}

## Project rules

<!-- [Blueprint] The technology rules of the stack, from `ecosystems.md`. [Archetype] Each rule of the stack that the root does not give, and each limit that the archetype changes, with its reason. [Project] `ship-spec` adds a lesson of a shipped spec that no check enforces. Remove the section when it is empty. -->

- {rule — reason}
