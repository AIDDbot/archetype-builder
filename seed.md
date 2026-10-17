# Seed: publish an archetype

The seed copies a complete work system (see [`procedure.md`](./procedure.md)) to its archetype repository `AIDDbot/archetype-{name}`. A maintainer does it, not the work system.

- Copy the whole workspace of the work system: the root files (`package.json`, `package-lock.json`, `vite.config.ts`, `.vite-hooks/`, `.gitattributes`, `.gitignore`, `LICENSE`) and `projects/`. Leave out `.aiddbot/`, `.product/`, `CHANGELOG.md` and the agent folders (`.agents/`, `.claude/`, `.codex/`, `.cursor/`, `.github/`).
- Copy the shipped foundation specs to `foundation/`, with their IDs: only the specs of `blueprint/foundation/`, never the `fix` and `refactor` specs that repaired debt. Copy the schema documents to `model/`.
- Set the version of the root `package.json` to the release version.
- Write the root `AGENTS.md` of the archetype: the Blueprint of the root `AGENTS.md` of the work system, and an archetype gate (see [Archetype CLI](https://github.com/AIDDbot/archetype-cli/blob/main/AGENTS.md)).
- The archetype gate passes.
- Release at the `major.minor` and codename of the AIDDbot release, with tag `v{version}`. Then pin the tag in the catalog of AIDDbot (`architect-system-foundation/assets/archetypes.md`).
