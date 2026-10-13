<!--
Foundation spec 4 of 7: what is the system? (Halloween D12, D13; Columbus D53). It needs `shell`.
Written in ASD-STE100 Simplified Technical English. Technical names are not dictionary words.
Create: aidd spec new feat about "About" --domain foundation
Instance: replace each role (`api`, `web`, `cli`, `e2e`) with the project name.
Remove the rows, requirements and Solution subsections of the roles that the system does not have. Then number the requirements again, with no gaps.
-->
# {id}-about — About

## Problem

A person or a client that uses the system must see what it is, which version runs, who made it, and the technology of each project.

### User Stories

- As a user, I want **to see what the application is and which version runs** so that I know what I use, and I can tell it in a failure report.
- As an owner, I want **my name, a link to my website and a summary of the technology** so that the application shows my work.
- As a script author, I want **only the version, with one option** so that a script can check it.

### Business rules

- The identity must come from the identity file of `shell`.
- No project must ask for the identity or the technology at runtime.

### Out of context

- Licenses of the dependencies, release notes, contact forms, update checks.

## Solution

### All projects

- With no author in the identity: `AIDDbot` and `https://aiddbot.com`.
- The technology summary is a constant of the `about` feature, made at the foundation from `.product/system.md` and the `AGENTS.md` of each project: project, type, language, framework, main libraries and test tools.

### api

- Feature `about`: route `GET /api/about`, public when the system has `users`. No `logic` or `data`.

### web

- Feature `about`: page `/about`, menu link `About`, access mark `everyone` when the system has `users`. No `logic` or `data`.
- The home header of `shell` shows the version from the identity file.
- The website link has `target="_blank"` and `rel="noopener noreferrer"`.

### cli

- `--version` is a global option of `core`. It writes the version as text, also with `--json`.
- Feature `about`: command `about`. No `logic` or `data`.

### e2e

- The page object of `/about` uses the shell page object.

## Verification

### Requirements

- **R01**: WHEN a client requests `GET /api/about`, the `api` SHALL answer 200 with `{ "name", "description", "version", "author", "homepage", "projects": [ { "name", "type", "technologies": [ "<technology>" ] } ] }`, with one entry for each project of the system.
- **R02**: WHILE the `web` shows a page, the menu SHALL contain a link `About` to `/about`.
- **R03**: WHEN a user opens `/about`, the `web` SHALL show the application name, its description and its version.
- **R04**: WHEN a user opens `/about`, the `web` SHALL show the name of the author and a link to the website of the author.
- **R05**: WHEN a user opens `/about`, the `web` SHALL show, for each project of the system, its name, its type and its main technologies.
- **R06**: WHEN a user follows the link to the website of the author, the `web` SHALL open it in a new tab, with no access from that tab to the application. Test: check `target` and `rel`; do not follow the link.
- **R07**: WHEN a user opens `/`, the home header SHALL show the version of the application.
- **R08**: WHEN the `cli` runs with `--version`, it SHALL write only the version and one line break to its standard output, and stop with exit code 0.
- **R09**: WHEN the `cli` runs `about`, it SHALL show the application name, its description, its version, the author, the website, and for each project of the system its name, its type and its main technologies, and stop with exit code 0.
- **R10**: WHEN the `cli` runs `about --json`, it SHALL write the object of R01.

### Expected URLs and APIs

| Kind | Project | Address | Expected answer | Requirements |
| --- | --- | --- | --- | --- |
| api | api | `GET /api/about` | 200 identity and the technology of each project | R01 |
| page | web | `/about` | Name, description, version, author with a link, technology of each project | R02–R06 |
| page | web | `/` | The home header has the version | R07 |
| command | cli | `--version` | Only the version. Exit code 0. | R08 |
| command | cli | `about` | Identity and technology. Exit code 0. With `--json`, the object of R01. | R09, R10 |
