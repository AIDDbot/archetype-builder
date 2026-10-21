<!-- Instance of the foundation spec for Archetype Web. aidd spec new feat users "Users" --domain foundation --from .product/foundation/users.spec.md -->
# {id}-users — Users

## Problem

A system with users must know who sends each request, before a feature needs this data. The method must be small and safe. A user must see their account and end their session, and must never see the account of a different user. Each page and menu link must tell who can use it.

### User Stories

- As a visitor, I want **to register, log in, and go back to the page that I asked for** so that I use the protected features without a search.
- As a user, I want **to stay logged in after a reload and to see my account** so that I know which data the application keeps about me.
- As a user, I want **to log out** so that nobody else can use my session on this device.

### Business rules

- A password must never be stored or returned in a form that a person can read.
- Each API route must have a valid session, unless a spec marks it as public (such as the API index, about, register and login).
- Each user must have the role `user`. A client must not select a different role.
- Each page and each menu link must have one access mark: `everyone`, `anonymous` or `session`.

### Out of context

- Password reset, email verification, a change to the account data, account deletion.
- Other roles, pages of other users, external identity providers, rate limits.

## Solution

### back

- Feature `auth`: register, login, me and logout. `Email` is a value object in `shared/values/email/` (lower case), used at the edge and inside. The contracts of the session and the passwords are in `shared/session/`.
- Passwords: a slow, salted algorithm that OWASP recommends, with explicit cost parameters stored with each hash. An unknown email still does one verification.
- Sessions: a random opaque token; the database stores only its hash. `SESSION_TTL_HOURS` (1–720, default 24) is a new setting.
- Session guard in `core`, with a resolver from the `auth` registration. Each registration is protected unless it is marked public; `core` mounts the public ones first. No separate list of paths.
- Feature `users`: `GET /api/users/:id`, only for the current user, through the `auth` facade.

### front

- `logic` of `auth` keeps the session, with its contract in `shared/session/`; the token stays in the browser storage, through an adapter in `core/session/`, and the HTTP client sends it.
- One access mark on each page and menu link. `core` builds the menu and guards the pages from the marks and the session state, through the `auth` registration; it never imports `auth`.
- After a login, `core` goes back to `returnTo` only for a registered page on the same origin; otherwise `/`.
- Feature `users`: page `/users/:id`, mark `session`, no menu link: a record detail of `presentation`.
- The register and login forms use the form of `presentation`; the auth card is a record card.
- A change of the session state updates the menu and the cards, never the current page.

### e2e

- An API client for register, login and logout, and page objects for register, login and the account. Unique test emails in each run.

### Schema impact

| Schema | Element | Change | Description |
| --- | --- | --- | --- |
| model | User | new | `id`, `email` (unique, lower case), `name`, `role` (`user`), `passwordHash`, `createdAt`. |
| model | Session | new | `tokenHash`, `userId` → User, `createdAt`, `expiresAt`. |
| api.db | `users.*`, `sessions.*` | new | The fields of User and Session. `users.email` is unique. |

## Verification

### Requirements

- **R01**: WHEN a visitor registers with a new email, a name and a password, the `back` SHALL answer 201 with the public user `{ id, email, name, role: "user", createdAt }`, with `createdAt` in ISO 8601 in UTC, such as `2026-10-13T08:30:00.000Z`. IF a field is missing or is not a non-empty string, THEN it SHALL answer 400 with one `fields` entry for each incorrect field and make no user. IF the email is already registered, in any case, THEN it SHALL answer 409 and keep the first account. Test: a login with rejected values fails; after the 409, the first password still logs in.
- **R02**: WHEN a user logs in with valid credentials, the `back` SHALL answer 200 with `{ token, user }`, with a non-empty opaque `token`. IF the password is incorrect or the email is unknown, THEN it SHALL answer 401 with the same body `{ "error": "Invalid credentials" }`.
- **R03**: WHEN a request has `Authorization: Bearer <token>` of a valid session, `GET /api/auth/me` SHALL answer 200 with the public user. IF a request to a protected route has no token or an invalid token, THEN the `back` SHALL answer 401 with the uniform error body.
- **R04**: WHEN a user with a session opens `/users/{id}` with their own identifier, the `front` SHALL show a page header with their name, and their email and their creation date as label and value pairs, with the date in a form that a person reads (such as `5 Oct 2026, 16:40`), from `GET /api/users/:id` (200 `{ name, email, createdAt }`). IF the identifier is a different one, existing or not, THEN the `back` SHALL answer 404 with `{ "error": "Not found" }`, and the page SHALL show `Account not found` and keep the menu.
- **R05**: WHEN a user selects `Logout`, the `back` SHALL answer 204 with no body and make that token invalid, and keep the other sessions of the user. WHEN it answers 204 or 401, the `front` SHALL remove the token and the user, show `/` and show the menu for no session. IF it does not answer or answers 500, THEN the `front` SHALL show an error and keep the session. Test: log in two times, log out with the first token, `GET /api/auth/me` with each.
- **R06**: WHEN a visitor sends the register form or the login form, the `front` SHALL send one request for the operation of the page that it shows, and write one console line with the name of the operation, with no form value, password or token. It SHALL confirm the registration, or show the name of the user in the menu after a login. IF the `back` rejects it, THEN it SHALL show the error, each `fields` message next to its field, and let the visitor try again. Test: two `click()` calls in one page script, and count the requests; move between `/register` and `/login` with no reload; a name with only spaces.
- **R07**: WHILE a user is logged in, the `front` SHALL keep the session after a reload, the menu SHALL show the name of the user as a link to their account and a `Logout` control, and the home auth card SHALL show `Hello, {name}` as a link to their account, with no links for `anonymous`. WHILE no user is logged in, the menu and the auth card SHALL show the links for `everyone` and `anonymous`, such as `Login` and `Register`, and no account link or `Logout`.
- **R08**: WHEN a visitor with no session opens a page with the mark `session`, the `front` SHALL show `/login`, keep the requested path, query and fragment, and after the login show the requested page without a full reload of the document. IF the kept target is not a page of the application on the same origin, THEN it SHALL show `/` after the login. Test: open `/users/{id}?a=1#b`; `returnTo` values `https://example.com/`, `//example.com` and `/no-such-page`.

### Expected URLs and APIs

| Kind | Project | Address | Expected answer | Requirements |
| --- | --- | --- | --- | --- |
| api | back | `POST /api/auth/register` | 201 public user. 400 invalid input with `fields`. 409 email already registered. | R01 |
| api | back | `POST /api/auth/login` | 200 `{ token, user }`. 400 invalid input. 401 invalid credentials. | R02 |
| api | back | `GET /api/auth/me` | 200 public user. 401 without a valid session. | R03 |
| api | back | `GET /api/users/:id` | 200 `{ name, email, createdAt }` for the own user. 404 for a different identifier. 401 without a valid session. | R03, R04 |
| api | back | `POST /api/auth/logout` | 204 with no body. 401 without a valid session. | R03, R05 |
| page | front | `/register`, `/login` | Forms; no role field; the return to a guarded page | R06, R08 |
| page | front | `/users/{id}` | Name, email and creation date, or `Account not found` | R04 |
| page | front | `/`, any page | Auth card; menu by access mark, and logout | R05, R07 |
