# Seed: publish a library

The seed copies a complete work system (see [`procedure.md`](./procedure.md)) to the library repository `AIDDbot/archetype-{name}`. A maintainer does it, not the work system.

- Copy each project folder of the work system to the library, with no `.aiddbot/`, `.product/` or agent folders.
- Copy the shipped spec instances to `foundation/` and the schema documents to `model/`.
- Write the root `AGENTS.md` of the library: the Blueprint of the root `AGENTS.md` of the work system, and a library gate (see [Archetype Base](https://github.com/AIDDbot/archetype-base/blob/main/AGENTS.md)).
- The library gate passes.
- Release at the `major.minor` and codename of the AIDDbot release, with tag `v{version}`. Then pin the tag in the AIDDbot catalog (`architect-system-foundation/assets/archetypes.md`).
