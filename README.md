# Archetype Builder

The inputs and the procedure to make an **archetype** for [AIDDbot](https://github.com/AIDDbot/AIDDbot).

An archetype is a whole solution: projects that work well together and pass one acceptance suite together (Halloween D28). Each project has a type (`api`, `web`, `cli`, `e2e`) and a technology. An archetype has the minimum functionality of every system (the foundation specs), and the tooling and the rules of its technology. [Archetype Base](https://github.com/AIDDbot/archetype-base) and [Archetype CLI](https://github.com/AIDDbot/archetype-cli) are archetypes. The catalog of AIDDbot lists them, each with its pinned version.

AIDDbot offers only the archetypes of its catalog. When no archetype fits a system, AIDDbot says so and stops. The projects of different archetypes do not combine: a new combination or a new technology is a new archetype, made here.

## Contents

| Path | What |
| --- | --- |
| [`procedure.md`](./procedure.md) | How to build an archetype with AIDDbot, in a work system. |
| [`seed.md`](./seed.md) | How to publish a complete work system to its archetype repository. |
| [`archetypes/`](./archetypes/) | The manifest of each archetype: its `system.md`. |
| [`blueprint/foundation/`](./blueprint/foundation/) | The generic foundation specs, with a variation for each project type. Each archetype has an instance of each one. |
| [`blueprint/project-types.md`](./blueprint/project-types.md) | The variations of each project type: its specs, its tooling slots and its layers. |
| [`blueprint/foundation-0.3/`](./blueprint/foundation-0.3/) | The 8 foundation specs of Archetype Base 0.3. Reference until Base 0.5. |
| [`blueprint/project.AGENTS.template.md`](./blueprint/project.AGENTS.template.md) | The template of the `AGENTS.md` of one project. |
| [`blueprint/ecosystems.md`](./blueprint/ecosystems.md) | Guidance for the tooling of each ecosystem. |
| [`blueprint/lint/`](./blueprint/lint/) | Dependency and complexity rules for JS / TS, by debt level. |
| [`blueprint/theme/`](./blueprint/theme/) | The brand theme for a `web`. |

## Status

For now, only the author of AIDDbot uses this repository. It has no tool yet: the procedure runs with AIDDbot. The brand theme is the brand of the author.

## Versions

The `major.minor` and the codename are the same as the AIDDbot release whose Blueprint this repository obeys. Patch versions are independent. Each version has a tag `v{version}`. Never move a published tag.

## License

MIT
