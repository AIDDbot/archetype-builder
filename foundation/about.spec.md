<!--
Foundation spec 4 of 6: what is the system? (Halloween D12, D13, D35, D39; Columbus D53). It needs `shell` and `presentation`.
In the `web`, it is the tracer bullet: one feature through presentation → logic → data, and from the `web` to the `api`. It is the first feature that shows the primitives of `presentation` (card, grid, record, table, states), so it has their visible requirements (Halloween D39).
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

- The identity must come from the `package.json` of the project, through the composition of `shell`.
- No project must ask for the identity or the technology at runtime.

### Out of context

- Licenses of the dependencies, release notes, contact forms, update checks.

## Solution

### All projects

- The technology summary is a constant of the `about` feature, made at the foundation from `.product/system.md` and the `AGENTS.md` of each project: project, type, language, framework, main libraries and test tools.

### api

- Feature `about`: route `GET /api/about`, public when the system has `users`. No `logic` or `data`.

### web

- Feature `about`: page `/about`, menu link `About` and home card, access mark `everyone` when the system has `users`.
- The page is a record detail, the technology of each project is a record table, and the card is a record card, all from the primitives of `presentation`. The feature gives only their typed descriptions.
- `data` calls `GET /api/about` through the HTTP client. `logic` keeps the state: loading, loaded or unavailable. The page and the card use the same `logic` and `data`.
- A unit test checks the `logic` with a fake `data`.
- The home header of `shell` shows the version of the identity.
- The website link has `target="_blank"` and `rel="noopener noreferrer"`.

### cli

- `--version` is a global option of `core`. It writes the version as text, also with `--json`.
- Feature `about`: command `about`, a record view of `presentation`. No `logic` or `data`.

### e2e

- The page objects of `/about` and of the about card use the shell page object.

## Verification

### Requirements

- **R01**: WHEN a client requests `GET /api/about`, the `api` SHALL answer 200 with `{ "name", "description", "version", "author": { "name", "url" }, "projects": [ { "name", "type", "technologies": [ "<technology>" ] } ] }`, with one entry for each project of the system.
- **R02**: WHEN a user opens `/about` from the menu link `About`, the `web` SHALL show a page header with the application name, a section with a heading and the description, the version and the author as label and value pairs, with a link to the website that opens in a new tab with no access to the application, and a table with a caption, one header row and one row for each project, with its name, its type and its main technologies. On a screen 375 CSS pixels wide, the table SHALL scroll in its own area, and the page SHALL have no horizontal scroll. Test: check the roles, never the class names; check `target` and `rel`; do not follow the link.
- **R03**: WHEN a user opens `/`, the home header SHALL show the version, and the about card SHALL show a header with its title as a heading, the application name and its version as label and value pairs, and a footer with a link that shows `/about` without a full reload of the document. On a screen 375 CSS pixels wide, the cards SHALL be in one column with no horizontal scroll. Test: check the roles, never the class names.
- **R04**: WHILE the `/about` page or the about card loads its data, it SHALL be marked as busy for assistive technology and show no fact. IF the `api` does not answer, THEN the page and the card SHALL show `About unavailable` in the place of their facts, and keep their title, the menu, the link of the card and the other cards. Test: delay `/api/about` in the browser, then block it.
- **R05**: WHEN the `cli` runs with `--version`, it SHALL write only the version and one line break to its standard output, and stop with exit code 0.
- **R06**: WHEN the `cli` runs `about`, it SHALL write one line for each fact, as `{label}: {value}`, with each value in the same column: the application name, its description, its version, the author with the website, and for each project its name, its type and its main technologies. It SHALL stop with exit code 0. With `--json`, it SHALL write the object of R01. Test: read each fact with the record reader, and check its label, its value and its column.

### Expected URLs and APIs

| Kind | Project | Address | Expected answer | Requirements |
| --- | --- | --- | --- | --- |
| api | api | `GET /api/about` | 200 identity and the technology of each project | R01 |
| page | web | `/about` | Page header, a section of label and value pairs, a table of the technology of each project, or `About unavailable` | R02, R04 |
| page | web | `/` | The home header has the version. About card: a heading, label and value pairs and a footer link to `/about`, or `About unavailable` | R03, R04 |
| command | cli | `--version` | Only the version. Exit code 0. | R05 |
| command | cli | `about` | One `{label}: {value}` line for each fact. Exit code 0. With `--json`, the object of R01. | R06 |
