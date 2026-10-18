<!--
Foundation spec 6 of 6: how does the system show and collect data? (Halloween D12, D13, D35; Columbus D65, D66). It needs `shell`, and it comes after every other foundation spec, because it changes their views and their output.
The primitives of the presentation layer that each feature composes: list, record, form, states and values.
Written in ASD-STE100 Simplified Technical English. Technical names are not dictionary words.
Create: aidd spec new feat presentation "Presentation" --domain foundation
Instance: replace each role (`api`, `web`, `cli`, `e2e`) with the project name.
Remove the user stories, rows, requirements and Solution subsections of the roles that the system does not have, and the views of the features that the system does not have (`users`). Then number the requirements again, with no gaps.
-->
# {id}-presentation — Presentation

## Problem

Each feature shows records, lists of records, and forms that collect data. When each feature makes its own markup, format or validation, the views do not look the same, the answers do not have the same shape, and the same debt comes back in each feature.

A record is one thing that the application shows, such as the application itself or the account of a user. A list is many records of one kind, such as the settings of a `cli` or the technology of each project. A form collects the fields of one record, from a page, a request or the options of a command.

### User Stories

- As a user, I want **records, lists and forms that look the same and show the important value first** so that I understand them at a glance.
- As a user, I want **dates, durations and states that a person reads** so that I do not decode raw values.
- As a client developer or a script author, I want **each value in a standard format** so that I read each answer with the same code.

### Business rules

- A feature must not write its own markup, text format or response shape for a list, a record or a form. It must compose the primitives of this spec.
- A value for a machine (an API answer, `--json`) must be in a standard format. A value for a person must be in a form that a person reads.

### Out of context

- New business data, charts, animations, and changes to the texts of earlier specs, other than the views that this spec names.
- Pages, sort, filter and search of a list, and lists in the `api`. Business specs add them when they need them, with the list primitive.
- A new style sheet library or new brand tokens.

## Solution

### All projects

- The five primitives, in `shared`, each with a row in the shared primitives of the `AGENTS.md`:

| Primitive | `api` | `web` | `cli` | `e2e` |
| --- | --- | --- | --- | --- |
| **list** | n/a in the foundation: no endpoint answers a list. A business list uses `readPage` (`limit` 1–100, default 20; `offset` ≥ 0) and `{ items, total }` | record table | text table | table reader |
| **record** | the object; an unknown one is the 404 | record card and record detail | `{label}: {value}` lines | record reader |
| **form** | `readFields`: one `fields` entry for each incorrect field | `createRecordForm`: error next to each field, disabled while it sends | n/a in the foundation: no command has options of its own. A business command uses `readOptions`: the error names the option | `recordForm(scope)` |
| **states** | n/a: an answer has no loading state | busy, empty and error, in the place of the data | empty message, error of `monitoring` | n/a: the readers report what they find |
| **values** | ISO 8601 UTC dates, durations in seconds | readable, in the language of the browser | readable; standard with `--json` | n/a: tests check the shape of a value |

- The features of the earlier specs (`about`, `config`, `users`) use the primitives. Their texts and tests stay as their specs say.

### api

- With `users`, the account and the forms of `auth` use the primitives. Without `users`, only the date format applies.

### web

- The components own the markup and the formats; a feature gives only a typed description (title, state, facts, columns, rows). A missing value is `—`.
- Semantic HTML on the style sheet of the archetype, one style sheet of the project for the records with theme tokens only, and a card grid with `repeat(auto-fit, minmax(18rem, 1fr))`.
- The technology of `/about` becomes a record table.
- Unit tests prove the empty table, the alignment of number columns and the missing value.

### cli

- The output contract of `shell` gets a typed view (list or record); `core` writes it as text, or as JSON with `--json`. A command never formats a value or pads a column.
- `config get` becomes a list: its table replaces the text of the `configuration` requirement that shows each setting with its value and source (`Replaces:` that requirement), and its test changes with it. Its JSON shape stays as `shell` says.
- Unit tests prove the empty list (`No {records}.`) and the alignment of a table.

### e2e

- The readers of tables and records, `recordForm(scope)`, and a helper for the contrast ratio (WCAG 2) are in `shared`.

## Verification

### Requirements

- **R01**: WHEN the `api` answers a date, it SHALL use the ISO 8601 format in UTC, such as `2026-10-13T08:30:00.000Z`. Test: the creation date of the account of `users`.
- **R02**: WHEN a user opens `/`, each card SHALL show a header with its title as a heading, its facts as label and value pairs, and a footer with its main link or action. Test: check the roles, never the class names.
- **R03**: WHEN a user opens a detail page (`/about`, `/users/{id}`), the `web` SHALL show a page header with the title of the record, and the facts of the record as label and value pairs, in one or more sections with a heading.
- **R04**: WHILE a card or a detail page loads its data, it SHALL be marked as busy for assistive technology and show no fact. IF it cannot load its data, THEN it SHALL show the error message of its spec in the place of its facts, and keep its title and its footer link. Test: delay the API answer in the browser.
- **R05**: WHEN a fact is a date, a duration or a number, the `web` SHALL show it in a form that a person reads, in the language of the browser. Test: check the shape, never an exact value.
- **R06**: WHEN a user opens `/` on a screen 375 CSS pixels wide, the cards SHALL be in one column with no horizontal scroll. WHEN the screen is 1024 CSS pixels wide, the cards SHALL be in two or more columns.
- **R07**: WHILE the light theme or the dark theme is active, the text of each label and each value SHALL have a contrast ratio of 4.5:1 or more with its background. Test: the computed text color and the first background that is not transparent, in each theme.
- **R08**: WHEN a view shows a list of records of one kind, the `web` SHALL show a table with a caption, one header row with a column header for each field, and one row for each record. On a screen 375 CSS pixels wide, the table SHALL scroll in its own area, and the page SHALL have no horizontal scroll.
- **R09**: WHEN the `cli` shows one record (`about`), it SHALL write one line for each fact, as `{label}: {value}`, with each value in the same column.
- **R10**: WHEN the `cli` runs `config get`, it SHALL show the settings as a table with the columns `Setting`, `Value` and `Source`.

### Expected URLs and APIs

| Kind | Project | Address | Expected answer | Requirements |
| --- | --- | --- | --- | --- |
| api | api | a date in an answer | ISO 8601 in UTC | R01 |
| page | web | `/` | Card grid. Each card: header with a heading, label and value pairs, footer link. | R02, R04–R07 |
| page | web | `/about` | Page header, a section for the application, a table of the technology of each project | R03–R05, R07, R08 |
| page | web | `/users/{id}` | Page header with the name of the user, facts | R03–R05, R07 |
| command | cli | `about` | One `{label}: {value}` line for each fact | R09 |
| command | cli | `config get` | Table `Setting`, `Value`, `Source` | R10 |
