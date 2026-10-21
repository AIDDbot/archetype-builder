<!-- Instance of the foundation spec for Archetype Web. aidd spec new feat about "About" --domain foundation --from .product/foundation/about.spec.md -->
# {id}-about — About

## Problem

A person or a client that uses the system must see what it is, which version runs, who made it, and the technology of each project.

### User Stories

- As a user, I want **to see what the application is and which version runs** so that I know what I use, and I can tell it in a failure report.
- As an owner, I want **my name, a link to my website and a summary of the technology** so that the application shows my work.

### Business rules

- The identity must come from the `package.json` of the project, through the composition of `shell`.
- No project must ask for the identity or the technology at runtime.

### Out of context

- Licenses of the dependencies, release notes, contact forms, update checks.

## Solution

### All projects

- The technology summary is a constant of the `about` feature, made at the foundation from `.product/system.md` and the `AGENTS.md` of each project: project, type, language, framework, main libraries and test tools.

### back

- Feature `about`: route `GET /api/about`, public when the system has `users`. No `logic` or `data`.

### front

- Feature `about`: page `/about`, menu link `About` and home card, access mark `everyone` when the system has `users`.
- The page is a record detail, the technology of each project is a record table, and the card is a record card, all from the primitives of `presentation`. The feature gives only their typed descriptions.
- `data` calls `GET /api/about` through the HTTP client. `logic` keeps the state: loading, loaded or unavailable. The page and the card use the same `logic` and `data`.
- A unit test checks the `logic` with a fake `data`.
- The home header of `shell` shows the version of the identity.
- The website link has `target="_blank"` and `rel="noopener noreferrer"`.

### e2e

- The page objects of `/about` and of the about card use the shell page object.

## Verification

### Requirements

- **R01**: WHEN a client requests `GET /api/about`, the `back` SHALL answer 200 with `{ "name", "description", "version", "author": { "name", "url" }, "projects": [ { "name", "type", "technologies": [ "<technology>" ] } ] }`, with one entry for each project of the system.
- **R02**: WHEN a user opens `/about` from the menu link `About`, the `front` SHALL show a page header with the application name, a section with a heading and the description, the version and the author as label and value pairs, with a link to the website that opens in a new tab with no access to the application, and a table with a caption, one header row and one row for each project, with its name, its type and its main technologies. On a screen 375 CSS pixels wide, the table SHALL scroll in its own area, and the page SHALL have no horizontal scroll. Test: check the roles, never the class names; check `target` and `rel`; do not follow the link.
- **R03**: WHEN a user opens `/`, the home header SHALL show the version, and the about card SHALL show a header with its title as a heading, the application name and its version as label and value pairs, and a footer with a link that shows `/about` without a full reload of the document. On a screen 375 CSS pixels wide, the cards SHALL be in one column with no horizontal scroll. Test: check the roles, never the class names.
- **R04**: WHILE the `/about` page or the about card loads its data, it SHALL be marked as busy for assistive technology and show no fact. IF the `back` does not answer, THEN the page and the card SHALL show `About unavailable` in the place of their facts, and keep their title, the menu, the link of the card and the other cards. Test: delay `/api/about` in the browser, then block it.

### Expected URLs and APIs

| Kind | Project | Address | Expected answer | Requirements |
| --- | --- | --- | --- | --- |
| api | back | `GET /api/about` | 200 identity and the technology of each project | R01 |
| page | front | `/about` | Page header, a section of label and value pairs, a table of the technology of each project, or `About unavailable` | R02, R04 |
| page | front | `/` | The home header has the version. About card: a heading, label and value pairs and a footer link to `/about`, or `About unavailable` | R03, R04 |
