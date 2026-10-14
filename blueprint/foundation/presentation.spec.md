<!--
Foundation spec 7 of 7: how does the system show and collect data? (Halloween D12, D13; Columbus D65, D66). It needs `shell`, and it comes after every other foundation spec, because it changes their views and their output.
The primitives of the presentation layer that each feature composes: list, record, form, states and values.
Written in ASD-STE100 Simplified Technical English. Technical names are not dictionary words.
Create: aidd spec new feat presentation "Presentation" --domain foundation
Instance: replace each role (`api`, `web`, `cli`, `e2e`) with the project name.
Remove the rows, requirements and Solution subsections of the roles that the system does not have, and the views of the features that the system does not have (`users`). Then number the requirements again, with no gaps.
-->
# {id}-presentation — Presentation

## Problem

Each feature shows records, lists of records, and forms that collect data. When each feature makes its own markup, format or validation, the views do not look the same, the answers do not have the same shape, and the same debt comes back in each feature.

A record is one thing that the application shows, such as the health of the system or the application itself. A list is many records of one kind, such as the runs of the system or the technology of each project. A form collects the fields of one record, from a page, a request or the options of a command.

### User Stories

- As a user, I want **records, lists and forms that look the same and show the important value first** so that I understand them at a glance.
- As a user, I want **dates, durations and states that a person reads** so that I do not decode raw values.
- As a client developer or a script author, I want **each list in one shape, with its total and its pages, and each value in a standard format** so that I read each list with the same code.
- As an operator, I want **to see the last runs of the system** so that I know when it started.

### Business rules

- A feature must not write its own markup, text format or response shape for a list, a record or a form. It must compose the primitives of this spec.
- A value for a machine (an API answer, `--json`) must be in a standard format. A value for a person must be in a form that a person reads.

### Out of context

- New business data, charts, animations, and changes to the texts of earlier specs, other than the views that this spec names.
- Sort, filter and search of a list. Business specs add them when they need them.
- A new style sheet library or new brand tokens.

## Solution

### All projects

- The five primitives, in `shared`, each with a row in the shared primitives of the `AGENTS.md`:

| Primitive | `api` | `web` | `cli` | `e2e` |
| --- | --- | --- | --- | --- |
| **list** | `readPage` (`limit` 1–100, default 20; `offset` ≥ 0) and `{ items, total }` | record table | text table | table reader |
| **record** | the object; an unknown one is the 404 | record card and record detail | `{label}: {value}` lines | record reader |
| **form** | `readFields`: one `fields` entry for each incorrect field | `createRecordForm`: error next to each field, disabled while it sends | `readOptions`: the error names the option | `recordForm(scope)` |
| **states** | n/a: an answer has no loading state | busy, empty and error, in the place of the data | empty message, error of `monitoring` | n/a: the readers report what they find |
| **values** | ISO 8601 UTC dates, durations in seconds | readable, in the language of the browser | readable; standard with `--json` | n/a: tests check the shape of a value |

- The features of the earlier specs (`health`, `about`, `config`, `users`) use the primitives. Their texts and tests stay as their specs say.

### api

- `health` adds `GET /api/health/runs`, with `readPage`.

### web

- The components own the markup and the formats; a feature gives only a typed description (title, state, facts, columns, rows). A missing value is `—`.
- Semantic HTML on the style sheet of the archetype, one style sheet of the project for the records with theme tokens only, and a card grid with `repeat(auto-fit, minmax(18rem, 1fr))`.
- `/health` adds the table `Recent runs`; the technology of `/about` becomes a record table.
- Unit tests prove the empty table, the alignment of number columns and the missing value.

### cli

- The output contract of `shell` gets a typed view (list or record); `core` writes it as text, or as JSON with `--json`. A command never formats a value or pads a column.
- `health` adds the operation `runs`, with `readOptions`. `config get` becomes a list: its table replaces the text of the `configuration` requirement that shows each setting with its value and source (`Replaces:` that requirement), and its test changes with it. Its JSON shape stays as `shell` says.
- Unit tests prove the empty list (`No {records}.`) and the alignment of a table.

### e2e

- The readers of tables and records, `recordForm(scope)`, and a helper for the contrast ratio (WCAG 2) are in `shared`.

## Verification

### Requirements

- **R01**: WHEN a client requests `GET /api/health/runs`, the `api` SHALL answer 200 with `{ "items": [ { "startedAt": "<date-time>" } ], "total": <integer> }`, with the newest run first and not more than 20 items.
- **R02**: WHEN the request has `limit` and `offset`, the `api` SHALL answer not more than `limit` items, from the position `offset`, with the same `total`. Test: restart some times; two pages with `limit=1` have different items and the same total.
- **R03**: IF `limit` is not an integer from 1 to 100, or `offset` is not an integer of 0 or more, THEN the `api` SHALL answer 400 with one `fields` entry for each incorrect parameter.
- **R04**: WHEN the `api` answers a date, it SHALL use the ISO 8601 format in UTC, such as `2026-10-13T08:30:00.000Z`.
- **R05**: WHEN a user opens `/`, each card SHALL show a header with its title as a heading, its facts as label and value pairs, and a footer with its main link or action. Test: check the roles, never the class names.
- **R06**: WHEN a user opens a detail page (`/health`, `/about`, `/users/{id}`), the `web` SHALL show a page header with the title of the record, and the facts of the record as label and value pairs, in one or more sections with a heading.
- **R07**: WHILE a card or a detail page loads its data, it SHALL be marked as busy for assistive technology, and SHALL not show a fact. Test: delay the API answer in the browser.
- **R08**: IF a card or a detail page cannot load its data, THEN it SHALL show the error message of its spec in the place of its facts, and SHALL keep its title and its footer link.
- **R09**: WHERE a record has a state (such as the status of `health`), the view SHALL show the state as a badge with text, and SHALL not use only color to tell it.
- **R10**: WHEN a fact is a date, a duration or a number, the `web` SHALL show it in a form that a person reads, in the language of the browser. Test: check the shape, never an exact value.
- **R11**: WHEN a user opens `/` on a screen 375 CSS pixels wide, the cards SHALL be in one column with no horizontal scroll. WHEN the screen is 1024 CSS pixels wide, the cards SHALL be in two or more columns.
- **R12**: WHILE the light theme or the dark theme is active, the text of each label and each value SHALL have a contrast ratio of 4.5:1 or more with its background. Test: the computed text color and the first background that is not transparent, in each theme.
- **R13**: WHEN a view shows a list of records of one kind, the `web` SHALL show a table with a caption, one header row with a column header for each field, and one row for each record.
- **R14**: WHEN a user opens `/health`, the `web` SHALL show the table `Recent runs` with the start date of the last 20 runs, the newest first.
- **R15**: WHEN a user opens a page with a table on a screen 375 CSS pixels wide, the page SHALL have no horizontal scroll. The table SHALL scroll in its own area.
- **R16**: WHEN the `cli` runs `health runs`, it SHALL show a table with a header row and one row for each of the last 20 runs, the newest first, with the start date in local time as `YYYY-MM-DD HH:MM:SS`, and stop with exit code 0. Test: run `health` some times on one temporary store first.
- **R17**: WHEN `health runs` has `--limit <n>` and `--offset <n>`, the `cli` SHALL show not more than `n` runs, from that position.
- **R18**: IF `--limit` is not an integer from 1 to 100, or `--offset` is not an integer of 0 or more, THEN the `cli` SHALL write `error: <message>` with the name of that option and stop with exit code 2.
- **R19**: WHEN the `cli` runs `health runs --json`, it SHALL write `{ "items": [ { "startedAt": "<date-time>" } ], "total": <integer> }`, with the dates in the format of R04.
- **R20**: WHEN the `cli` shows one record (`health`, `about`), it SHALL write one line for each fact, as `{label}: {value}`, with each value in the same column.
- **R21**: WHEN the `cli` runs `config get`, it SHALL show the settings as a table with the columns `Setting`, `Value` and `Source`.

### Expected URLs and APIs

| Kind | Project | Address | Expected answer | Requirements |
| --- | --- | --- | --- | --- |
| api | api | `GET /api/health/runs?limit&offset` | 200 `{ "items", "total" }`. 400 with `fields` for an incorrect parameter. Public when the system has `users`. | R01–R04 |
| page | web | `/` | Card grid. Each card: header with a heading, label and value pairs, footer link. | R05, R07–R12 |
| page | web | `/health` | Page header, state badge, facts, table `Recent runs` | R06–R10, R12–R15 |
| page | web | `/about` | Page header, a section for the application, a table of the technology of each project | R06, R12, R13, R15 |
| page | web | `/users/{id}` | Page header with the name of the user, facts | R06–R08, R10, R12 |
| command | cli | `health runs [--limit <n>] [--offset <n>]` | Table of runs. Exit code 0. An incorrect option: exit code 2. With `--json`, `{ "items", "total" }`. | R16–R19 |
| command | cli | `health`, `about` | One `{label}: {value}` line for each fact | R20 |
| command | cli | `config get` | Table `Setting`, `Value`, `Source` | R21 |
