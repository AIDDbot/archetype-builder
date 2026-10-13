# Archetype Builder

The inputs and the procedure to make a **library** of archetypes for [AIDDbot](https://github.com/AIDDbot/AIDDbot).

An archetype is a project of one type (`api`, `web`, `cli`, `e2e`) for one technology. It has the minimum functionality of every system (the foundation specs), and the tooling and the rules of its technology. A library is one repository of archetypes that pass one acceptance suite together. [Archetype Base](https://github.com/AIDDbot/archetype-base) and [Archetype CLI](https://github.com/AIDDbot/archetype-cli) are libraries.

AIDDbot offers only libraries. When no library fits a system, AIDDbot says so and stops. To add a technology, make a new library here.

## Contents

| Path | What |
| --- | --- |
| [`procedure.md`](./procedure.md) | How to make a library with AIDDbot. |
| [`blueprint/foundation/`](./blueprint/foundation/) | The 7 generic foundation specs, with a variation for each project type. Each library has an instance of each one. |
| [`blueprint/project-types.md`](./blueprint/project-types.md) | The variations of each project type: its specs, its tooling slots and its layers. |
| [`blueprint/foundation-0.3/`](./blueprint/foundation-0.3/) | The 8 foundation specs of Archetype Base 0.3. Reference until Base 0.5. |
| [`blueprint/project.AGENTS.template.md`](./blueprint/project.AGENTS.template.md) | The template of the `AGENTS.md` of one archetype. |
| [`blueprint/ecosystems.md`](./blueprint/ecosystems.md) | Guidance for the tooling of each ecosystem. |
| [`blueprint/oxlint.*.json`](./blueprint/) | Boundary and complexity rules for JS / TS. |
| [`blueprint/theme/`](./blueprint/theme/) | The brand theme for a `web`. |

## Status

For now, only the author of AIDDbot uses this repository. It has no tool yet: the procedure runs with AIDDbot. The brand theme is the brand of the author.

## Versions

The `major.minor` and the codename are the same as the AIDDbot release whose Blueprint this repository obeys. Patch versions are independent. Each version has a tag `v{version}`. Never move a published tag.

## License

MIT
