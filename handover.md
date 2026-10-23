# Handover: publish an archetype

The handover copies a complete work system (see [`construction.md`](./construction.md)) to its archetype repository `AIDDbot/archetype-{name}`. A maintainer does it, not the work system. The archetype is an AIDDbot system too: its records stay in `.product/`, so the specs and the tags of the tests read as in any system.

- Copy the whole workspace of the work system: the root files (`package.json`, `package-lock.json`, `vite.config.ts`, `.vite-hooks/`, `.gitattributes`, `.gitignore`, `LICENSE`), the development tools (`tools/`, with the debt checks in `tools/lint/`), and `projects/`. Leave out `.aiddbot/`, `.product/`, `CHANGELOG.md` and the agent folders (`.agents/`, `.claude/`, `.codex/`, `.cursor/`, `.github/`).
- Run `node scripts/handover-product.mjs {work system} {archetype}`. It writes `.product/` of the archetype:
  - `system.md` and `model/` of the work system.
  - Only the foundation specs, the ones with a file in `.product/foundation/` of the work system, never the `fix` and `refactor` specs that repaired debt. Each one in `specs/{type}/`.
  - The specs numbered in their delivery order with no gaps (`S0001` scaffold, then each `feat`), with each reference and each test tag rewritten.
  - `PRD.md` with the shipped features.
- Set the version and the codename of the root `package.json` to the version and the codename of the release.
- Write the root `AGENTS.md` of the archetype with no trace of AIDDbot, because a person can use the archetype without it, and the scaffold of AIDDbot never copies this file: the system writes its own. Keep the sections of the root template (Assistant, System, Commands, Git):
  - Assistant: the lines of the harness, the language and the closed questions, with no identity of an assistant.
  - System: the problem, the solution, the verification and the projects of the work system.
  - Commands: the npm scripts of the root (`npm test`, `npm run test:e2e`, `npm run check`, `npm run fix`, `npm start`) and the pre-commit hook.
  - Git: preserve work, no secrets, no destructive commands; conventional commits on a branch, never on `main`.
- Write the `README.md` of the archetype for a person, with no table of projects. Keep these sections in this order, the same in each archetype:
  - The title and a short welcome: what the system has on its first day, and that it has no business feature. Then a link to `.product/PRD.md` for the features, and a link to `.product/system.md` for the projects, the technology and the technical decisions.
  - Start, Check and Update: the npm scripts of the root.
  - Your system: where the identity goes, and the ID of the first business spec.
  - Changes: the line "Changes pass the archetype gate of the [Archetype Builder](https://github.com/AIDDbot/archetype-builder) (`handover.md`)."
  - About and License: the same blocks as the `README.md` of the Builder.
- The archetype gate passes.
- Release at the `major.minor` and codename of the AIDDbot release, with tag `v{version}`. Then pin the tag in the catalog of AIDDbot (`architect-system-foundation/assets/archetypes.md`).

The archetype has no `.aiddbot/` and no counter file. A system that starts from it gets the specs in `.product/specs/`, and AIDDbot gives its first business spec the ID after the last one.

## Archetype gate

An archetype enters or changes in its repository only when all of these are true:

- `npm test` at the root (the unit tests and the full acceptance run), and `layers` and `crap` in each project, pass. The pre-commit hook passes.
- No test writes a file inside the repository: `git status` is clean after the full run.
- Each requirement in `.product/specs/` has a test with its tag, and each tag names a requirement in `.product/specs/`. The spec IDs have no gaps.
- The schema documents in `.product/model/` match the code. AIDDbot copies them into each system and never derives them again.
- No open technical debt and no exception in `tools/lint/`: debt in an archetype goes into each system that starts from it.
- Each `AGENTS.md` is in form: `node .agents/aidd/aidd.mjs agents check` gives no problem (at most 128 lines, the sections of its template in order, no empty section, no comment).
- A boundary canary fails `layers`: a `core` file that imports a feature. Undo the canary.

A new archetype of a type (for example a `cli` in a different language) passes the same `e2e` suite. Change the suite only when the foundation specs change: first change the spec in `.product/specs/`, then the tests, then the code.
