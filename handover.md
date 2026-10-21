# Handover: publish an archetype

The handover copies a complete work system (see [`construction.md`](./construction.md)) to its archetype repository `AIDDbot/archetype-{name}`. A maintainer does it, not the work system. The archetype is an AIDDbot system too: its records stay in `.product/`, so the specs and the tags of the tests read as in any system.

- Copy the whole workspace of the work system: the root files (`package.json`, `package-lock.json`, `vite.config.ts`, `.vite-hooks/`, `.gitattributes`, `.gitignore`, `LICENSE`), the debt checks (`.lint/`), and `projects/`. Leave out `.aiddbot/`, `.product/`, `CHANGELOG.md` and the agent folders (`.agents/`, `.claude/`, `.codex/`, `.cursor/`, `.github/`).
- Run `node scripts/handover-product.mjs {work system} {archetype}`. It writes `.product/` of the archetype:
  - `system.md` and `model/` of the work system.
  - Only the foundation specs, the ones with a file in `.product/foundation/` of the work system, never the `fix` and `refactor` specs that repaired debt. Each one in `specs/{type}/`.
  - The specs numbered in their delivery order with no gaps (`S0001` scaffold, then each `feat`), with each reference and each test tag rewritten.
  - `PRD.md` with the shipped features.
- Set the version of the root `package.json` to the release version.
- Write the root `AGENTS.md` of the archetype: the Blueprint of the root `AGENTS.md` of the work system, and the line "Changes pass the archetype gate of the Builder (`handover.md`)."
- The archetype gate passes.
- Release at the `major.minor` and codename of the AIDDbot release, with tag `v{version}`. Then pin the tag in the catalog of AIDDbot (`architect-system-foundation/assets/archetypes.md`).

The archetype has no `.aiddbot/` and no counter file. A system that starts from it gets the specs in `.product/specs/`, and AIDDbot gives its first business spec the ID after the last one.

## Archetype gate

An archetype enters or changes in its repository only when all of these are true:

- `npm test` at the root (the unit tests and the full acceptance run), and `layers` and `crap` in each project, pass. The pre-commit hook passes.
- No test writes a file inside the repository: `git status` is clean after the full run.
- Each requirement in `.product/specs/` has a test with its tag, and each tag names a requirement in `.product/specs/`. The spec IDs have no gaps.
- The schema documents in `.product/model/` match the code. AIDDbot copies them into each system and never derives them again.
- No open technical debt and no exception in `.lint/`: debt in an archetype goes into each system that starts from it.
- Each `AGENTS.md` has fewer than 100 lines.
- A boundary canary fails `layers`: a `core` file that imports a feature. Undo the canary.

A new archetype of a type (for example a `cli` in a different language) passes the same `e2e` suite. Change the suite only when the foundation specs change: first change the spec in `.product/specs/`, then the tests, then the code.
