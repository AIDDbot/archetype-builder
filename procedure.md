# Procedure: build an archetype

An **archetype** is a whole solution: projects that pass one acceptance suite together, with the instances of their foundation specs (`foundation/`) and their schema documents (`model/`) (Halloween D28). Archetype CLI and Archetype Web are archetypes (Archetype Web replaces Archetype Base, Halloween D38). AIDDbot offers only the archetypes of its catalog.

You make an archetype with AIDDbot, as a normal system (Halloween D10). This repository gives the generic inputs in `blueprint/`. AIDDbot gives the process.

You use two repositories (Halloween D20):

- The **work system**: a normal AIDDbot system, in any folder (such as `experiments/{archetype}`). You build and repair the archetype there. Each shipped spec gets a release of the work system; its tags never reach the archetype repository.
- The **archetype repository**: `AIDDbot/archetype-{name}`. It gets only the result, with [`seed.md`](./seed.md), and only releases at the `major.minor` of AIDDbot (Halloween D6).

## 1. Start the work system

The human prepares an empty work system:

- An empty git repository, with AIDDbot installed (`npx aiddbot init`) at the release whose Blueprint the archetype obeys.
- A copy of `blueprint/` in `.product/blueprint/`, without `foundation-0.3/`: the plan of the archetype is product. The agent reads only its own folder, and the run stays fixed when the Builder changes. This procedure stays here: the prompt of the run gives its steps.
- The manifest of the archetype in `.product/system.md`, in English, from `archetypes/{archetype}.system.md`: the purpose, the users, the identity, and each project with its type. AIDDbot writes each record in the language of `system.md`, and an archetype ships in English.
- One commit of all of it on the default branch.

Do not run `/architect-system-foundation`: it offers only the archetypes of the catalog (Halloween D5), and this system makes one.

## 2. Deliver the specs

Run `/build-ordered-specs` with the spec files of `.product/blueprint/foundation/`, in the order of section 1 of `.product/blueprint/project-types.md`. The first one, `scaffold`, makes the projects. An archetype ships with zero debt, because each system that starts from it copies its debt (Halloween D19).

When the last spec ships with zero debt, the work system is complete. To publish it, follow [`seed.md`](./seed.md).
