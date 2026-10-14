# Procedure: make a library of archetypes

A **library** is one repository of archetypes that pass one acceptance suite together, with the instances of their foundation specs (`foundation/`) and their schema documents (`model/`). Archetype Base and Archetype CLI are libraries. AIDDbot offers only libraries.

You make a library with AIDDbot, as a normal system (Halloween D10). This repository gives the generic inputs in `blueprint/`. AIDDbot gives the process.

You use two repositories (Halloween D20):

- The **work system**: a normal AIDDbot system, in any folder (such as `experiments/{library}`). You build and repair the archetypes there. Each shipped spec gets a release of the work system; its tags never reach the library.
- The **library**: the repository `AIDDbot/archetype-{name}`. It gets only the result (the seed), and only releases at the `major.minor` of AIDDbot (Halloween D6).

## 1. Start the work system

- Make an empty git repository for the work system.
- Install AIDDbot (`npx aiddbot init`) at the release whose Blueprint the library obeys.
- Copy this procedure and `blueprint/` to `builder/` in the work system, and commit them. The agent reads only its own folder, and the run stays fixed when the Builder changes.
- Write `.product/system.md` in English: the purpose, the users, and each project with its type (`api`, `web`, `cli`, `e2e`). AIDDbot writes each record in the language of `system.md`, and a library ships in English. Use the format of the AIDDbot proposal (`architect-system-foundation/assets/system.template.md`).
- Write the identity in the root `package.json`: `displayName`, `description`, `author` and `homepage`. `shell` and `about` read it.
- Run `/outline-system`. With no project yet, it writes the root `AGENTS.md` with the Blueprint of the release, and the conceptual model in `.product/model/`. `define-spec` needs them.
- Commit on the default branch. Each spec starts from there.
- Do not run `/architect-system-foundation`: it offers only libraries (Halloween D5), and this system makes one.

## 2. Deliver the specs

Deliver them one at a time, in this order. The first one, `scaffold`, makes the projects: it is a `chore`, with no requirements. The others are the foundation specs of [`blueprint/project-types.md`](./blueprint/project-types.md), section 1. A library ships with zero debt, because each system that starts from it copies its debt (Halloween D19). For each spec:

1. Run `/build-requested-spec` with the request "Deliver the spec from `builder/blueprint/foundation/{spec}.spec.md`". The spec file is the contract: `define-spec` writes the spec from it, with the rows of the projects of the library only.
2. Run `/craft-lasting-quality` one time. It scans at its start, only when no `medium` debt is open, and repairs the debt by priority, at most five specs (Halloween D25). When no `high` or `medium` debt remains, it hardens one time: the warnings of `lint` become `low` debt (Halloween D26).
3. Check that `node .agents/aidd/aidd.mjs debt list` shows no open item. If debt remains, stop and report it. Never start the next spec on open debt.

`craft` never scans at its end. Thus, after the last spec, run `/craft-lasting-quality` again until its scan and its hardening record nothing and `debt list` shows no open item.

| # | Spec | Condition |
| --- | --- | --- |
| 0 | `scaffold` | always |
| 1 | `configuration` | always |
| 2 | `monitoring` | always |
| 3 | `shell` | always |
| 4 | `about` | always |
| 5 | `health` | always |
| 6 | `users` | the system has users |
| 7 | `presentation` | always |

## 3. Seed the library

- Copy each project folder of the work system to the library, with no `.aiddbot/`, `.product/` or agent folders.
- Copy the shipped spec instances to `foundation/` and the schema documents to `model/`.
- Write the root `AGENTS.md` of the library: the Blueprint of the root `AGENTS.md` of the work system, and a library gate (see [Archetype Base](https://github.com/AIDDbot/archetype-base/blob/main/AGENTS.md)).
- The library gate passes.
- Release at the `major.minor` and codename of the AIDDbot release, with tag `v{version}`. Then pin the tag in the AIDDbot catalog (`architect-system-foundation/assets/archetypes.md`).
