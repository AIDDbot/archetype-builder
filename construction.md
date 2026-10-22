# Construction: build an archetype

An **archetype** is a whole solution: projects that pass one acceptance suite together, with their shipped foundation specs and their schema documents in `.product/`, as in any AIDDbot system (Halloween D28). Archetype CLI and Archetype Web are archetypes (Archetype Web replaces Archetype Base, Halloween D38). AIDDbot offers only the archetypes of its catalog.

You make an archetype with AIDDbot, as a normal system (Halloween D10). This repository gives the inputs: the Bedrock (`bedrock/`), the Foundation (`foundation/{archetype}/`) and the Blueprint (`blueprint/`) (Halloween D45). AIDDbot gives the process.

You use two repositories (Halloween D20):

- The **work system**: a normal AIDDbot system, in any folder (such as `experiments/{archetype}`). You build and repair the archetype there. Each shipped spec gets a release of the work system; its tags never reach the archetype repository.
- The **archetype repository**: `AIDDbot/archetype-{name}`. It gets only the result, with [`handover.md`](./handover.md), and only releases at the `major.minor` of AIDDbot (Halloween D6).

## 1. Start the work system

The human prepares an empty work system:

- An empty git repository, with AIDDbot installed (`npx aiddbot init`) at the release whose Blueprint the archetype obeys.
- A copy of `bedrock/{archetype}/` at the root, as it is, after `aiddbot init`: the tooling, the debt checks, the identity and the license of the archetype. Then `npm install`: its `prepare` installs the pre-commit hook.
- A copy of `foundation/{archetype}/` in `.product/foundation/`: the foundation specs of the archetype, written once in the Builder (Halloween D52), and of `blueprint/` in `.product/blueprint/`: the plan of the archetype is product. The agent reads only its own folder, and the run stays fixed when the Builder changes. This construction guide stays here: the prompt of the run gives its steps.
- The manifest of the archetype in `.product/system.md`, in English, from `archetypes/{archetype}.system.md`: the purpose, the users, the identity, and each project with its type. An archetype ships its documents and its code in English (the Assistant section of the root `AGENTS.md`, Halloween D59).
- One commit of all of it on the default branch.

Do not run `/architect-system-foundation`: it offers only the archetypes of the catalog (Halloween D5), and this system makes one.

## 2. Deliver the specs

Run `/build-archetype-foundation` with the spec files of `.product/foundation/`, in the order of section 1 of `.product/blueprint/project-types.md`. The core creates each spec from its file (`aidd spec new … --from`, the first line of the file): no model writes or adapts it. The first one, `scaffold`, adds the framework of each project to the Bedrock. An archetype ships with zero debt, because each system that starts from it copies its debt (Halloween D19).

When the last spec ships with zero debt, the work system is complete. To publish it, follow [`handover.md`](./handover.md).
