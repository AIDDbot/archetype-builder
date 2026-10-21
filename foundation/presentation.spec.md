<!--
Foundation spec 3 of 6: how does the system show and collect data? (Halloween D12, D13, D35, D39; Columbus D65, D66). It needs `shell`, and it comes before each feature, so that each feature composes its primitives from the start.
The primitives of the presentation layer that each feature composes: list, record, form, states and values.
Written in ASD-STE100 Simplified Technical English. Technical names are not dictionary words.
Create: aidd spec new chore presentation "Presentation" --domain foundation
Instance: replace each role (`api`, `web`, `cli`, `e2e`) with the project name.
Remove the rows and Solution subsections of the roles that the system does not have.
A `chore` has no requirements and no acceptance test: no feature shows a record, a list or a form yet. Each feature that uses a primitive first has its visible requirement (Halloween D39): `about` (card, grid, record, table, states, values, the `{label}: {value}` lines), `users` (form, dates of the `api`), `settings` (form, the table of `config get`).
-->
# {id}-presentation — Presentation

## Problem

Each feature shows records, lists of records, and forms that collect data. When each feature makes its own markup, format or validation, the views do not look the same, the answers do not have the same shape, and the same debt comes back in each feature.

A record is one thing that the application shows, such as the application itself or the account of a user. A list is many records of one kind, such as the settings of a `cli` or the technology of each project. A form collects the fields of one record, from a page, a request or the options of a command.

### User Stories

- As a developer, I want **one primitive for each list, record, form, state and value** so that each feature composes them and writes no markup, format or validation of its own.

### Business rules

- A feature must not write its own markup, text format or response shape for a list, a record or a form. It must compose the primitives of this spec.
- A value for a machine (an API answer, `--json`) must be in a standard format. A value for a person must be in a form that a person reads.
- A decision of a primitive (a format, an order, a state, the fields of a record) is in a `.ts` file of `shared`, with its unit test. A component (`.tsx`) of `shared/components/` has no logic: it shows the data that a `.ts` function prepared. The review checks it.

### Out of context

- Each view of a feature: the feature adds it with its requirements.
- Pages, sort, filter and search of a list, and lists in the `api`. Business specs add them when they need them, with the list primitive.
- Charts, animations, a new style sheet library or new brand tokens.

## Solution

### All projects

- The five primitives, in the `shared` folder of their concern (`http/` in an `api`, `components/` in a `web`, `output/` in a `cli`, `page-objects/` in an `e2e`; values in `values/`), each with a row in the shared primitives of the `AGENTS.md`:

| Primitive | `api` | `web` | `cli` | `e2e` |
| --- | --- | --- | --- | --- |
| **list** | `readPage` (`limit` 1–100, default 20; `offset` ≥ 0) and `{ items, total }`, for a business list | record table: a caption, one header row, one row for each record, in a `<div class="overflow-auto">` of the theme, so it scrolls in its own area on a narrow screen | text table, with each column aligned | table reader |
| **record** | the object; an unknown one is the 404 | record card (header with a heading, facts as label and value pairs, footer link) and record detail (page header, sections with a heading) | `{label}: {value}` lines, with each value in the same column | record reader |
| **form** | `readFields`: one `fields` entry for each incorrect field | `createRecordForm`: error next to each field, disabled while it sends | `readOptions`: the error names the option | `recordForm(scope)` |
| **states** | n/a: an answer has no loading state | busy (marked for assistive technology, no fact), empty and error, in the place of the data | empty message (`No {records}.`), the error of `shell` | n/a: the readers report what they find |
| **values** | ISO 8601 UTC dates, durations in seconds | readable, in the language of the browser or in the date format of `settings`; a missing value is `—` | readable; standard with `--json` | n/a: tests check the shape of a value |

- Unit tests prove each decision with its list of values: each value format, the missing value, the empty list, the alignment of the columns, the order of the facts, each state.

### api

- `readFields` and `readPage` in `shared/http/`, and the date format in `shared/values/`. The features of later specs use them.

### web

- The components own the markup; a feature gives only a typed description (title, state, facts, columns, rows), which a `.ts` function of `shared` makes.
- Semantic HTML on the style sheet of the archetype, one style sheet of the project for the records with theme tokens only, and a card grid with `repeat(auto-fit, minmax(18rem, 1fr))`: one column at 375 CSS pixels, two or more at 1024.
- The theme (`custom.css`) gives the narrow screen: the menu wraps, a table in `overflow-auto` scrolls in its own area, and a long value wraps. The style sheet of the project never writes these rules again.

### cli

- The output contract of `shell` gets a typed view (list or record); `core` writes it as text, or as JSON with `--json`. A command never formats a value or pads a column.

### e2e

- The readers of tables and records, `recordForm(scope)`, and a helper for the contrast ratio (WCAG 2) are in `shared`, for the tests of the features.

## Verification

### Requirements

None: a `chore` changes nothing that a person or a client sees, because no feature uses the primitives yet. The unit tests prove each decision; the review checks the rules of this spec; each feature proves the view that it shows.

### Expected URLs and APIs

None.
