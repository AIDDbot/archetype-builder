<!--
Foundation spec 3 of 6: how do people use the system? (Halloween D7, D12, D13; Columbus D17, D18, D37, D38, D39, D51). It needs `configuration` and `monitoring`.
The common frame of each interface: the API index of the `api`, the layout of the `web`, the usage of the `cli`.
Written in ASD-STE100 Simplified Technical English. Technical names are not dictionary words.
Create: aidd spec new feat shell "Shell" --domain foundation
Instance: replace each role (`api`, `web`, `cli`, `e2e`) with the project name.
Remove the user stories, rows, requirements and Solution subsections of the roles that the system does not have. Then number the requirements again, with no gaps.
The technology and the visual base (style sheet, fonts, colors) are in the AGENTS.md of the project, never here.
-->
# {id}-shell — Shell

## Problem

Each interface of the system must have one frame that each feature uses: the same way to find what the interface offers, and the same answer to an address or a command that does not exist. Each later feature must add to the frame without a change to it.

### User Stories

- As a client developer, I want **an index of the API, and the same answer for each unknown path** so that I find each route and handle a mistake in one location.
- As a user of the `web`, I want **a menu, a light or a dark theme, a home page with one card for each part of the application, and a clear page for an unknown address** so that I go to each page quickly and never see an empty screen.
- As a user of the `cli`, I want **help for each command, and help when I type a command that does not exist** so that I learn the commands without the documentation.
- As a script author or an agent, I want **each `cli` result as one JSON object** so that I read it with no text parser.
- As an owner, I want **the name and the description of the application in the `package.json` of each project** so that I change them with no change of code.

### Business rules

- The identity of the application (name, description, author with website, and version) must come from the `package.json` of the project that shows it, and from no other location. Each field is required, with no fallback.
- The shell must know no feature. Each feature must add its own routes, pages, cards or commands through its registration.

### Out of context

- The routes, pages, cards and commands of the features. The version (`about`).
- Translation. A theme other than light and dark. Shell completion for the `cli`.

## Solution

### All projects

- The `Identity` type at the root of `shared` names the fields of `.product/blueprint/ecosystems.md`: `displayName`, `description`, `author` (`name`, `url`) and `version`. It is a type only, with no function. Only the composition imports the `package.json` of the project (`#package`), and gives it to `core` and to the features as an `Identity`. Thus a unit test gives its own identity: no test reads the file or mocks a module.

### api

- `core` mounts the registrations of the manifest under `/api`, and makes the index from them. No feature writes its route in a second list. The registration contract is in `shared/http/`.
- The error handler of `core` answers each unknown path under `/api` with the 404.

### web

- Shell in `core`: header (name, menu, theme control), main area, router, not-found page. The server answers each unknown path with the shell.
- The composition gives the pages and the menu links of the manifest to `core`, and the cards to the `home` registration. `core` never imports a page.
- Each page gets the same required services (HTTP client, logger, navigation) through contracts in `shared/http/`, `shared/logging/` and `shared/components/`, and its path parameters as a typed argument.
- Feature `home`: page `/`, menu link `Home`, header and card grid.
- Theme: an attribute on the root element, from the system preference, then from the browser storage; set before the first paint. Brand theme files copied as they are.

### cli

- Each command registration gives its name, summary, usage, operations and options. An option is typed data (name, value placeholder, summary, default), never a help text that code parses again. The help comes from the registrations, in the order of the manifest, and from the setting definitions of `configuration`: nothing copies them by hand.
- `core` adds the options of each registration to the one parse of `configuration`, never a second parse, then runs one pipeline: parse, run, render, report, each in its own function. It reads `--help`, `--json` and the setting options before the command. An option that the command does not declare, or an argument that it does not take, is a `usage` error. A `usage` error of a command shows its declared usage.
- Output contract in `shared/output/`: a command gives its result as data; `core` writes it as text, or as one JSON object with `--json`. A command never writes to the standard output itself.
- `config get` uses this contract: `{ "settings": [ { "name", "value", "source" } ] }`, or one `{ "name", "value", "source" }`.

### e2e

- Page objects in `shared/page-objects/` for the shell, the not-found page and the home page.
- A helper in `shared` runs one `cli` invocation with `--json` and returns the parsed object and the exit code.
- The tests check that the identity is there, never its values: the owner changes them. The application name and the description are text that is not empty, and the version is a semantic version. No test reads a `package.json` of another project.
- A test checks what its spec adds and the order that it needs, never that nothing else exists: later specs add settings, migrations and commands.

## Verification

### Requirements

- **R01**: WHEN a client requests `GET /api`, the `api` SHALL answer 200 with `{ "routes": [ { "method": "<method>", "path": "<path>" } ] }`, with one entry for each route of the registrations.
- **R02**: WHEN a request goes to an API path that does not exist, the `api` SHALL answer 404 with `{ "error": "Not found" }`.
- **R03**: WHEN a user opens `/`, the `web` SHALL show the shell header with the application name, the menu, and the home page: a header with the application name and description, and a grid for the cards of the features. The title of each document SHALL be the application name.
- **R04**: WHILE the `web` shows a page, the menu SHALL contain a link to `/` and mark the link of that page as the current page. WHEN a user follows a menu link, the `web` SHALL change the page without a full reload of the document. Test: put a mark on the document before the link; the mark is still there.
- **R05**: WHEN a user opens an unknown path directly, the `web` SHALL show a not-found page with the requested path and a link to `/`.
- **R06**: WHEN a user opens the `web` with no selected theme, the theme SHALL agree with the color preference of the system. WHEN the user selects the theme control, the `web` SHALL change between the light and the dark theme, and keep that theme after a reload. Test: set the preference of the browser, in a new context for each one.
- **R07**: WHEN the `web` shows a page, after the first load or a navigation, or the user changes the theme, it SHALL write one console line with the path of that page or the selected theme.
- **R08**: WHEN a user opens a page on a screen 375 CSS pixels wide, the menu SHALL wrap its links, also when the features add links, and the page SHALL have no horizontal scroll. Test: add links to the menu in the page.
- **R09**: WHEN the `cli` runs with `--help`, with `help`, or with no command, it SHALL show the application name, the usage line, and each command with its one-line summary; with `help <command>` or `<command> --help`, the usage of that command with each operation and option and its summary. It SHALL stop with exit code 0.
- **R10**: WHEN the `cli` runs a command that does not exist, it SHALL write `error: Unknown command: <name>` and the help of R09 to standard error, write nothing to standard output, and stop with exit code 2.
- **R11**: WHEN the `cli` runs a command with `--json`, it SHALL write one JSON object, and nothing else, to its standard output: for `help --json`, `{ "name": "<name>", "commands": [ { "name", "summary", "usage" } ] }`. IF the command fails, THEN it SHALL write `{ "error": "<message>" }` to standard output, nothing to standard error, and stop with the exit code of that failure. Test: each command of the foundation.
- **R12**: IF a command gets an option that it does not declare or an argument that it does not take, THEN the `cli` SHALL write `error: <message>` and the usage of that command to standard error, and stop with exit code 2. Test: one extra argument and one unknown option of a foundation command.

### Expected URLs and APIs

| Kind | Project | Address | Expected answer | Requirements |
| --- | --- | --- | --- | --- |
| api | api | `GET /api` | 200 `{ "routes": [ { "method", "path" } ] }` | R01 |
| api | api | `GET /api/{unknown}` | 404 `{ "error": "Not found" }` | R02 |
| page | web | `/` | Shell header with the name, menu, theme control; home header and card grid | R03, R04, R06–R08 |
| page | web | `/{unknown}` | Not-found page with the path and a link to `/` | R05 |
| command | cli | `--help`, `help`, no command, `help <command>`, `<command> --help` | Name, usage line, commands with summaries, or the usage of one command. Exit code 0. | R09 |
| command | cli | `{unknown}` | `error: Unknown command: {unknown}` and the help. Exit code 2. | R10 |
| command | cli | `<command> --json` | One JSON object; on a failure, `{ "error": "<message>" }` with its exit code | R11 |
