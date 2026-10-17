# Seed: publish an archetype

The seed copies a complete work system (see [`procedure.md`](./procedure.md)) to its archetype repository `AIDDbot/archetype-{name}`. A maintainer does it, not the work system. The archetype is an AIDDbot system too: its records stay in `.product/`, so the specs and the tags of the tests read as in any system.

- Copy the whole workspace of the work system: the root files (`package.json`, `package-lock.json`, `vite.config.ts`, `.vite-hooks/`, `.gitattributes`, `.gitignore`, `LICENSE`), the shared limits (`complexity.json`, `complexity.tests.json`), and `projects/`. Leave out `.aiddbot/`, `.product/`, `CHANGELOG.md` and the agent folders (`.agents/`, `.claude/`, `.codex/`, `.cursor/`, `.github/`).
- Run `node scripts/seed-product.mjs {work system} {archetype}`. It writes `.product/` of the archetype:
  - `system.md` and `model/` of the work system.
  - Only the foundation specs, the ones with a file in `blueprint/foundation/`, never the `fix` and `refactor` specs that repaired debt. Each one in `specs/{type}/`.
  - The specs numbered in their delivery order with no gaps (`S0001` scaffold, then each `feat`), with each reference and each test tag rewritten.
  - `PRD.md` with the shipped features.
- Set the version of the root `package.json` to the release version.
- Write the root `AGENTS.md` of the archetype: the Blueprint of the root `AGENTS.md` of the work system, and an archetype gate (see [Archetype CLI](https://github.com/AIDDbot/archetype-cli/blob/main/AGENTS.md)).
- The archetype gate passes.
- Release at the `major.minor` and codename of the AIDDbot release, with tag `v{version}`. Then pin the tag in the catalog of AIDDbot (`architect-system-foundation/assets/archetypes.md`).

The archetype has no `.aiddbot/` and no counter file. A system that starts from it gets the specs in `.product/specs/`, and AIDDbot gives its first business spec the ID after the last one.
