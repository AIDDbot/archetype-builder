# Procedure: make a library of archetypes

A **library** is one repository of archetypes that pass one acceptance suite together, with the instances of their foundation specs (`foundation/`) and their schema documents (`model/`). Archetype Base and Archetype CLI are libraries. AIDDbot offers only libraries.

You make a library with AIDDbot, as a normal system (Halloween D10). This repository gives the generic inputs in `blueprint/`. AIDDbot gives the process.

You use two repositories (Halloween D20):

- The **work system**: a normal AIDDbot system, in any folder (such as `experiments/{library}`). You build and repair the archetypes there. Each shipped spec gets a release of the work system; its tags never reach the library.
- The **library**: the repository `AIDDbot/archetype-{name}`. It gets only the result (the seed), and only releases at the `major.minor` of AIDDbot (Halloween D6).

## 1. Start the work system

- Make an empty git repository for the work system.
- Install AIDDbot (`npx aiddbot init`) at the release whose Blueprint the library obeys.
- Write `.product/system.md`: the purpose, the users, and each project with its type (`api`, `web`, `cli`, `e2e`). Use the format of the AIDDbot proposal (`architect-system-foundation/assets/system.template.md`).
- Write the identity in the root `package.json`: `displayName`, `description`, `author` and `homepage`. `shell` and `about` read it.
- Do not run `/architect-system-foundation`: it offers only libraries (Halloween D5), and this system makes one.

## 2. Scaffold each project

Do one project before you start the next. Commit each step alone, so that each step can be reviewed and reverted.

| Step | Commit | Result |
| --- | --- | --- |
| 1 | `chore(scaffold): generate {project}` | The output of the official generator of the framework, not changed. |
| 2 | `refactor({project}): shape to blueprint` | The project has the shape of its `AGENTS.md`. |
| 3 | `chore({project}): register tooling` | All tooling slots operate and are registered. |

### Step 1: generate

- Fill [`blueprint/project.AGENTS.template.md`](./blueprint/project.AGENTS.template.md) for the technology, with the column of its type from [`blueprint/project-types.md`](./blueprint/project-types.md). Use [`blueprint/ecosystems.md`](./blueprint/ecosystems.md) as guidance, not as rules.
- Run the official generator (`npm create`, `ng new`, `cargo new`) with no functional code.

### Step 2: shape to blueprint

- `{folder}/AGENTS.md` is the filled template. Put a `CLAUDE.md` next to it that contains only `@AGENTS.md`.
- Reorganize the generator output into the architecture of that `AGENTS.md`: the composition and its manifest, `core`, features, and `shared` with the contracts of the `core` services.
  - Keep the mechanisms of the framework (injector, router, store, file names) and map them to the concepts.
  - Move folders by technical layer (such as `components/`, `views/`, `stores/`) into `shared` as primitives, or into features.
- Remove each sample of the generator (demo pages, images, icons).
- Keep only the package manager of that `AGENTS.md`. Remove the files of all other package managers.

### Step 3: register tooling

- Run the `upgrade` command one time, because models remember old releases.
  - If a new major breaks a different tool of the stack, keep the last compatible major. Write the pin and its reason in the technology rules of that `AGENTS.md`.
  - Never pin a major that `ecosystems.md` requires. Replace the tool that breaks.
- Each project has the configuration file of its `format` tool, also when the defaults are enough. It leaves Markdown out.
- The ignore file never hides source. Anchor runtime data patterns to the project root.
- Each tooling slot of that `AGENTS.md` operates. If a mandatory slot is missing (`lint`, `test`, and `start` for runnable projects), install the usual tool of the stack.
- For JS / TS, start from [`blueprint/oxlint.boundaries.json`](./blueprint/oxlint.boundaries.json) (or [`oxlint.boundaries.e2e.json`](./blueprint/oxlint.boundaries.e2e.json) for `e2e`) and [`blueprint/oxlint.complexity.json`](./blueprint/oxlint.complexity.json).
- For a `web`, copy [`blueprint/theme/`](./blueprint/theme/) as it is.
- Register the type and the slots with `node .agents/aidd/aidd.mjs config set projects.{project} '{"type":"{type}",...}'`.
- `lint` and `test` pass before the commit; in an `e2e` project, only the unit tests of its `core`, because no project to test exists yet.
- Prove the boundary check: add an import that the architecture forbids, make sure that `lint` fails, then remove the import.

## 3. Outline the system

After the last project, run `/outline-system`. It writes the root `AGENTS.md` with the Blueprint of the release, and the schema documents in `.product/model/`. `define-spec` needs them.

## 4. Deliver the foundation specs

Deliver them one at a time, in the order of [`blueprint/project-types.md`](./blueprint/project-types.md), section 1. A library ships with zero debt, because each system that starts from it copies its debt (Halloween D19). For each spec:

1. Run `/build-requested-spec` with the request "Deliver the spec from `blueprint/foundation/{spec}.spec.md`". The spec file is the contract: `define-spec` writes the spec from it, with the rows of the types of the library only.
2. Run `/craft-lasting-quality` one time. It repairs the debt by priority, at most five specs.
3. Check that `node .agents/aidd/aidd.mjs debt list` shows no open item. If debt remains, stop and report it. Never start the next spec on open debt.

| # | Spec | Condition |
| --- | --- | --- |
| 1 | `configuration` | always |
| 2 | `monitoring` | always |
| 3 | `shell` | always |
| 4 | `about` | always |
| 5 | `health` | always |
| 6 | `users` | the system has users |
| 7 | `presentation` | always |

## 5. Seed the library

- Copy each project folder of the work system to the library, with no `.aiddbot/`, `.product/` or agent folders.
- Copy the shipped spec instances to `foundation/` and the schema documents to `model/`.
- Write the root `AGENTS.md` of the library: the Blueprint of the root `AGENTS.md` of the work system, and a library gate (see [Archetype Base](https://github.com/AIDDbot/archetype-base/blob/main/AGENTS.md)).
- The library gate passes.
- Release at the `major.minor` and codename of the AIDDbot release, with tag `v{version}`. Then pin the tag in the AIDDbot catalog (`architect-system-foundation/assets/archetypes.md`).
