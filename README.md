# Archetype Builder

The inputs and the construction guide to make an **archetype** for [AIDDbot](https://github.com/AIDDbot/AIDDbot).

An archetype is a whole solution: projects that work well together and pass one acceptance suite together (Halloween D28). Each project has a type (`api`, `web`, `cli`, `e2e`) and a technology. An archetype has the minimum functionality of every system (the foundation specs), and the tooling and the rules of its technology. [Archetype CLI](https://github.com/AIDDbot/archetype-cli) and Archetype Web (`AIDDbot/archetype-web`, which replaces Archetype Base) are archetypes. The catalog of AIDDbot lists them, each with its pinned version.

AIDDbot offers only the archetypes of its catalog. When no archetype fits a system, AIDDbot says so and stops. The projects of different archetypes do not combine: a new combination or a new technology is a new archetype, made here.

## Contents

An archetype is a Bedrock and its Foundation, built as the Blueprint says (Halloween D45).

| Path | What |
| --- | --- |
| [`construction.md`](./construction.md) | How to build an archetype with AIDDbot, in a work system: the Foundation on the Bedrock. |
| [`handover.md`](./handover.md) | How to publish a complete work system to its archetype repository, and the archetype gate. |
| [`archetypes/`](./archetypes/) | The manifest of each archetype: its `system.md`. |
| [`bedrock/`](./bedrock/) | **Bedrock**: what an archetype chooses and does not build. One for each archetype (`cli`, `web`): the tooling of each project, the debt checks (`tools/lint/`), the identity, the license, the primitives of `shared` in pure TypeScript with their unit tests and, in `web`, the brand theme. No framework (Halloween D42, D47). |
| [`foundation/`](./foundation/) | **Foundation**: what an archetype builds on its Bedrock. One folder for each archetype (`cli`, `web`) with its foundation specs, written for its projects and ready to use (Halloween D52): the core creates each spec from its file. Each archetype ships them in `.product/specs/`. |
| [`foundation-0.3/`](./foundation-0.3/) | The 8 foundation specs of Archetype Base 0.3. Reference until Archetype Web 0.4 ships. |
| [`blueprint/`](./blueprint/) | **Blueprint**: the rules of construction. [`project-types.md`](./blueprint/project-types.md) (the specs, slots and layers of each project type), [`ecosystems.md`](./blueprint/ecosystems.md) (the stack of each ecosystem) and [`project.AGENTS.template.md`](./blueprint/project.AGENTS.template.md) (the `AGENTS.md` of one project). |
| [`scripts/upgrade-bedrock.mjs`](./scripts/upgrade-bedrock.mjs) | Keeps each Bedrock current: raises each dependency to its latest version, and runs `check` and `test`. |
| [`scripts/handover-product.mjs`](./scripts/handover-product.mjs) | Writes `.product/` of an archetype: the foundation specs numbered with no gaps, the test tags, the model and `PRD.md`. |

## Status

For now, only the author of AIDDbot uses this repository. It has no tool yet: the construction runs with AIDDbot. The brand theme of the `web` Bedrock is the brand of the author.

## Versions

The `major.minor` and the codename are the same as the AIDDbot release whose Blueprint this repository obeys. Patch versions are independent. Each version has a tag `v{version}`. Never move a published tag.

## About

- **Author**: [Alberto Basalo](https://albertobasalo.dev)
- **Socials**:
  - [X](https://x.com/albertobasalo)
  - [LinkedIn](https://www.linkedin.com/in/albertobasalo/)
  - [GitHub](https://github.com/albertobasalo)
- **Cursos en Español**: [AI code Academy](https://aicode.academy)
- **AIDDbot.com**: [AIDDbot.com](https://aiddbot.com)
- **The main Repository for AIDDBot**: [AIDDbot](https://github.com/AIDDbot/AIDDbot)

## License

MIT
