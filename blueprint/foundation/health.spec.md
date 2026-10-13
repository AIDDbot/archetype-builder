<!--
Foundation spec 5 of 7: does the system go through all its layers? (Halloween D12, D13; Columbus D2, D6, D17, D18, D38, D39, D51). It needs `configuration`, `monitoring` and `shell`.
The tracer bullet: one small feature through presentation → logic → data in each project.
Written in ASD-STE100 Simplified Technical English. Technical names are not dictionary words.
Create: aidd spec new feat health "Health status" --domain foundation
Instance: replace each role (`api`, `web`, `cli`, `e2e`) with the project name.
Remove the rows, requirements and Solution subsections of the roles that the system does not have. Then number the requirements again, with no gaps.
-->
# {id}-health — Health status

## Problem

Before the first business feature, each layer of each project must operate with the others, and the projects must connect to each other.

### User Stories

- As an operator, I want **to ask the system if it is alive, how many times it started, and for how long it has run** so that I know its state quickly.

### Business rules

- The health answer must contain only the status, the startup count and the uptime.

### Out of context

- Checks of dependencies other than the database of the project. Readiness probes.
- The list of the runs (`presentation`). Authentication (`users`).

## Solution

### api

- `data` records one run at startup and counts the runs; its table comes in the first migration of the feature.
- No facade. The route is public when the system has `users`.
- A `unit` smoke test checks the `logic` with a fake `data`.

### web

- `logic` keeps the state: loading, loaded or unavailable. `data` calls `GET /api/health`.
- The registration adds the page `/health`, the menu link `Health` and the home card; the card uses the same `logic` and `data`.
- The uptime uses the shared primitive `formatDuration`.

### cli

- A local cli: `data` records one run for each invocation and counts the runs. A cli with an `api`: `data` calls `GET /api/health`.
- A failure of the store or of the `api` goes to `core`; it never gives a successful answer.
- A `unit` smoke test checks the `logic` with a fake `data`.

### e2e

- A preflight, not a test: it checks `GET /api/health` and `/` before the first test, and stops the run with the name of a project that does not answer. A `cli` has no preflight.

### Schema impact

| Schema | Element | Change | Description |
| --- | --- | --- | --- |
| model | Run | new | One startup of the `api`, or one invocation of a local `cli`: `startedAt` (date-time). |
| api.db | `runs.id`, `runs.started_at` | new | One row for each startup. |
| cli store | runs | new | Only a local cli: one record for each invocation. |

## Verification

### Requirements

- **R01**: WHEN a client requests `GET /api/health`, the `api` SHALL answer 200 with `{ "status": "ok", "runs": <integer ≥ 1>, "uptime": <seconds > 0> }`.
- **R02**: WHEN the `api` restarts, the `runs` value SHALL be greater than before the restart.
- **R03**: WHILE the `api` runs, each `uptime` value SHALL be greater than the value before it.
- **R04**: WHEN a user opens `/health`, the `web` SHALL show the status, the runs and the uptime from the `api`, with the uptime as a duration that a person reads (such as `1 h 2 min`). Test: check the shape of the duration, never an exact value.
- **R05**: IF the `api` does not answer, THEN the `/health` page SHALL show `Health unavailable` and keep the menu. Test: block `/api/health` in the browser.
- **R06**: WHILE the `web` shows a page, the menu SHALL contain a link to `/health`.
- **R07**: WHEN a user opens `/`, the home page SHALL show a health card with the status, the runs, the uptime as a duration that a person reads, and a link to `/health`.
- **R08**: IF the `api` does not answer, THEN the health card SHALL show `Health unavailable` and keep its link, the other cards and the menu.
- **R09**: WHEN a user follows the link of the health card, the `web` SHALL show `/health` without a full reload of the document.
- **R10**: WHEN a user opens `/` on a screen 375 CSS pixels wide, the home page SHALL have no horizontal scroll.
- **R11**: WHEN the `cli` runs `health`, it SHALL show the status and the runs, and stop with exit code 0. With `--json`, it SHALL write `{ "status": "ok", "runs": <integer ≥ 1> }`. Test: run it two times on one temporary store; the second run shows more runs.

### Expected URLs and APIs

| Kind | Project | Address | Expected answer | Requirements |
| --- | --- | --- | --- | --- |
| api | api | `GET /api/health` | 200 `{ "status": "ok", "runs": int, "uptime": seconds }`. 500 with the uniform error body if the database fails. | R01, R02, R03 |
| page | web | `/health` | Status, runs and uptime, or `Health unavailable` | R04, R05, R06 |
| page | web | `/` | Health card: status, runs, uptime and a link to `/health`, or `Health unavailable` | R07–R10 |
| command | cli | `health` | Status and runs. Exit code 0. A store that does not open: exit code 3. | R11 |
