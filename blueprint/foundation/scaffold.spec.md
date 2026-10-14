<!--
Foundation spec 0 of 7: how is each project made? (Halloween cli-6). It comes before `configuration`.
Written in ASD-STE100 Simplified Technical English. Technical names are not dictionary words.
Create: aidd spec new chore scaffold "Scaffold" --domain foundation
Instance: one Solution subsection for each project of `.product/system.md`, with its type and its folder.
A `chore` has no requirements: nothing that an observer sees changes. The regression of the release and the boundary proof are its verification.
-->
# {id}-scaffold — Scaffold

## Problem

Each project of the system must exist, with the shape of the Blueprint and all its tooling slots, before the first foundation spec adds a behavior.

### User Stories

- As a developer, I want **each project in the shape of its `AGENTS.md`, with no sample code** so that each later spec adds code in a known place.
- As a developer, I want **each tooling slot to operate and to be registered** so that each step of a delivery checks only its own surface.

### Business rules

- A project has no functional code: no setting, no command, no route, no page, and no acceptance test.
- Do one project before you start the next. Commit each step alone, so that each step can be reviewed and reverted.

### Out of context

- Each behavior of the foundation specs, from `configuration` on.
- The root `AGENTS.md` and the schema documents: `ship-spec` runs `outline-system` for the new projects.

## Solution

### Each project

| Step | Commit | Result |
| --- | --- | --- |
| 1 | `chore({project}): generate` | The output of the official generator of the framework, not changed. |
| 2 | `refactor({project}): shape to blueprint` | The project has the shape of its `AGENTS.md`. |
| 3 | `chore({project}): register tooling` | All tooling slots operate and are registered. |

**Step 1: generate**

- Fill `builder/blueprint/project.AGENTS.template.md` for the technology, with the column of its type from `builder/blueprint/project-types.md`. Use `builder/blueprint/ecosystems.md` as guidance, not as rules.
- Run the official generator with no functional code. Use the scaffold commands of `ecosystems.md` as they are.

**Step 2: shape to blueprint**

- `{folder}/AGENTS.md` is the filled template. Put a `CLAUDE.md` next to it that contains only `@AGENTS.md`.
- Reorganize the generator output into the architecture of that `AGENTS.md`: the composition and its manifest, `core`, features, and `shared` with the contracts of the `core` services.
  - Keep the mechanisms of the framework (injector, router, store, file names) and map them to the concepts.
  - Move folders by technical layer (such as `components/`, `views/`, `stores/`) into `shared` as primitives, or into features.
- Remove each sample of the generator (demo pages, images, icons).
- Keep only the package manager of that `AGENTS.md`. Remove the files of all other package managers.

**Step 3: register tooling**

- Run the `upgrade` command one time, because models remember old releases.
  - If a new major breaks a different tool of the stack, keep the last compatible major. Write the pin and its reason in the technology rules of that `AGENTS.md`.
  - Never pin a major that `ecosystems.md` requires. Replace the tool that breaks.
- Each project has the configuration file of its `format` tool, also when the defaults are enough. It leaves Markdown out.
- The ignore file never hides source. Anchor runtime data patterns to the project root.
- Each tooling slot of that `AGENTS.md` operates. If a mandatory slot is missing (`lint`, `test`, `start`), install the usual tool of the stack.
- For JS / TS, start from `builder/blueprint/oxlint.boundaries.json` (or `oxlint.boundaries.e2e.json` for `e2e`) and `builder/blueprint/oxlint.complexity.json`.
- For a `web`, copy `builder/blueprint/theme/` as it is.
- Register the type and the slots with `node .agents/aidd/aidd.mjs config set projects.{project} '{"type":"{type}",...}'`.
- Prove the boundary check: add an import that the architecture forbids, make sure that `lint --changed` fails, then remove the import.

### e2e

- `test` passes with no acceptance test, so that the scaffold ships before the first spec.

## Verification

### Requirements

None: a `chore` changes nothing that an observer sees. The regression of the release (`format`, `lint` and `test` of all projects) and the boundary proof of step 3 are its verification.

### Expected URLs and APIs

None.
