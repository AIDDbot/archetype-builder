<!--
Foundation spec 4 of 6: what is the system? (Halloween D12, D13, D35; Columbus D53). It needs `shell`.
In the `web`, it is the tracer bullet: one feature through presentation → logic → data, and from the `web` to the `api`.
Written in ASD-STE100 Simplified Technical English. Technical names are not dictionary words.
Create: aidd spec new feat about "About" --domain foundation
Instance: replace each role (`api`, `web`, `cli`, `e2e`) with the project name.
Remove the user stories, rows, requirements and Solution subsections of the roles that the system does not have. Then number the requirements again, with no gaps.
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

- Feature `about`: page `/about`, menu link `About` and home card, access mark `everyone` when the system has `users`.
- `data` calls `GET /api/about` through the HTTP client. `logic` keeps the state: loading, loaded or unavailable. The page and the card use the same `logic` and `data`.
- A unit test checks the `logic` with a fake `data`.
- The home header of `shell` shows the version from the identity file.
- The website link has `target="_blank"` and `rel="noopener noreferrer"`.

### cli

- `--version` is a global option of `core`. It writes the version as text, also with `--json`.
- Feature `about`: command `about`. No `logic` or `data`.

### e2e

- The page objects of `/about` and of the about card use the shell page object.

## Verification

### Requirements

- **R01**: WHEN a client requests `GET /api/about`, the `api` SHALL answer 200 with `{ "name", "description", "version", "author", "homepage", "projects": [ { "name", "type", "technologies": [ "<technology>" ] } ] }`, with one entry for each project of the system.
- **R02**: WHEN a user opens `/about` from the menu link `About`, the `web` SHALL show the application name, its description, its version, the author with a link to the website that opens in a new tab with no access to the application, and for each project its name, its type and its main technologies. Test: check `target` and `rel`; do not follow the link.
- **R03**: WHEN a user opens `/`, the home header SHALL show the version, and the about card SHALL show the application name, its version and a link that shows `/about` without a full reload of the document.
- **R04**: IF the `api` does not answer, THEN the `/about` page and the about card SHALL show `About unavailable`, and keep the menu, the link of the card and the other cards. Test: block `/api/about` in the browser.
- **R05**: WHEN the `cli` runs with `--version`, it SHALL write only the version and one line break to its standard output, and stop with exit code 0.
- **R06**: WHEN the `cli` runs `about`, it SHALL show the application name, its description, its version, the author, the website, and for each project its name, its type and its main technologies, and stop with exit code 0. With `--json`, it SHALL write the object of R01.

### Expected URLs and APIs

| Kind | Project | Address | Expected answer | Requirements |
| --- | --- | --- | --- | --- |
| api | api | `GET /api/about` | 200 identity and the technology of each project | R01 |
| page | web | `/about` | Name, description, version, author with a link, technology of each project, or `About unavailable` | R02, R04 |
| page | web | `/` | The home header has the version. About card: name, version and a link to `/about`, or `About unavailable` | R03, R04 |
| command | cli | `--version` | Only the version. Exit code 0. | R05 |
| command | cli | `about` | Identity and technology. Exit code 0. With `--json`, the object of R01. | R06 |
