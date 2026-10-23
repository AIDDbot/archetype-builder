<!-- Instance of the foundation spec for Archetype Web. aidd spec new feat shell "Shell" --domain foundation --from .product/foundation/shell.spec.md -->
# {id}-shell — Shell

## Problem

Each interface of the system must have one frame that each feature uses: the same way to find what the interface offers, the same answer to an address that does not exist, and each failure in one shape. Each later feature must add to the frame without a change to it.

### User Stories

- As a client developer, I want **an index of the API, and each error in one body shape** so that I find each route and handle each failure in one location.
- As a user of the `front`, I want **a menu, a light or a dark theme, a home page with one card for each part of the application, and a clear page for an unknown address** so that I go to each page quickly and never see an empty screen.
- As an owner, I want **the name and the description of the application in the `package.json` of each project** so that I change them with no change of code.

### Business rules

- The identity of the application (name, description, author with website, and version) must come from the `package.json` of the project that shows it, and from no other location. Each field is required, with no fallback.
- The shell must know no feature. Each feature must add its own routes, pages and cards through its registration.

### Out of context

- The routes, pages and cards of the features. The version (`about`). The components of records, lists and forms (`presentation`).
- Each check, format and order of `platform`: its unit tests prove them with their lists of values. This spec proves only that they are connected.
- Translation. A theme other than light and dark.

## Solution

### All projects

- The `Identity` type at the root of `shared` names the fields of `.product/blueprint/ecosystems.md`: `displayName`, `description`, `author` (`name`, `url`) and `version`. It is a type only, with no function. Only the entry `main` imports the `package.json` of the project (`#package`), and gives it to `core` and to the features as an `Identity`. Thus a unit test gives its own identity: no test reads the file or mocks a module.

### back

- `core` mounts the registrations of the manifest under `/api`, and makes the index from them. No feature writes its route in a second list. The registration contract is in `shared/http/`, with a fake of the request and the response for the unit tests of each route: no test writes its own.
- The error answers of the error handler of `platform`: 400 for a body that is not valid JSON or an input error (with `fields`), 404 `{ "error": "Not found" }` for each unknown path under `/api`, 413 for a body larger than the limit, 500 `{ "error": "Internal server error" }` for an unexpected failure. Each one is `{ "error": "<message>" }`.

### front

- Shell in `core`: header (name, menu, theme control), main area, router, not-found page. The server answers each unknown path with the shell.
- The composition gives the pages and the menu links of the manifest to `core`, and the cards to the `home` registration. `core` never imports a page.
- Each page gets the same required services (HTTP client, logger, navigation) through contracts in `shared/http/`, `shared/logging/` and `shared/components/`, and its path parameters as a typed argument.
- Feature `home`: page `/`, menu link `Home`, header and card grid.
- Theme: an attribute on the root element, from the system preference, then from the browser storage; set before the first paint. Brand theme files copied as they are. `settings` adds the theme of the account.

### e2e

- Page objects in `shared/page-objects/` for the shell, the not-found page and the home page.
- The tests check that the identity is there, never its values: the owner changes them. The application name and the description are text that is not empty, and the version is a semantic version. No test reads a `package.json` of another project.
- The contract test (R03) uses the servers of the suite and one value each. No test starts a server of its own: the unit tests of `core` prove the settings, the listening line and the stop.
- A test checks what its spec adds and the order that it needs, never that nothing else exists: later specs add routes, pages and cards.

## Verification

### Requirements

- **R01**: WHEN a client requests `GET /api`, the `back` SHALL answer 200 with `{ "routes": [ { "method": "<method>", "path": "<path>" } ] }`, with one entry for each route of the registrations.
- **R02**: IF a request goes to an API path that does not exist, or its body is not valid JSON or is larger than the body limit, THEN the `back` SHALL answer 404 `{ "error": "Not found" }`, 400 or 413 with `{ "error": "<message>" }`. Test: one request of each.
- **R03**: WHEN the `back` answers a request, the answer SHALL have the received valid `X-Request-Id`, the headers `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` and `Referrer-Policy: no-referrer`, and the `back` SHALL add one line to the log of the day with the method, the full path and the status, with no request identifier. Test: one `GET /api` with a known `X-Request-Id`. A CORS failure stops the `front`, so the tests of the features find it.
- **R04**: WHEN a user opens `/`, the `front` SHALL show the shell header with the application name, the menu, and the home page: a header with the application name and description, and a grid for the cards of the features. The title of each document SHALL be the application name.
- **R05**: WHILE the `front` shows a page, the menu SHALL contain a link to `/` and mark the link of that page as the current page. WHEN a user follows a menu link, the `front` SHALL change the page without a full reload of the document. On a screen 375 CSS pixels wide, the menu SHALL wrap its links, also when the features add links, and the page SHALL have no horizontal scroll. Test: put a mark on the document before the link, and the mark is still there; add links to the menu in the page.
- **R06**: WHEN a user opens an unknown path directly, the `front` SHALL show a not-found page with the requested path and a link to `/`.
- **R07**: WHEN a user opens the `front` with no selected theme, the theme SHALL agree with the color preference of the system. WHEN the user selects the theme control, the `front` SHALL change between the light and the dark theme, and keep that theme after a reload, unless the account of a session has a theme (`settings`). In each theme, the text of the shell header, the menu and the home header SHALL have a contrast ratio of 4.5:1 or more with its background. Test: set the preference of the browser, in a new context for each one; the computed text color and the first background that is not transparent.

### Expected URLs and APIs

| Kind | Project | Address | Expected answer | Requirements |
| --- | --- | --- | --- | --- |
| api | back | `GET /api` | 200 `{ "routes": [ { "method", "path" } ] }`, with the headers, the request identifier and a log line | R01, R03 |
| api | back | `GET /api/{unknown}`, `POST /api/{any}` with an incorrect body | 404, 400 or 413 `{ "error": "<message>" }` | R02 |
| page | front | `/` | Shell header with the name, menu, theme control; home header and card grid | R04, R05, R07 |
| page | front | `/{unknown}` | Not-found page with the path and a link to `/` | R06 |
