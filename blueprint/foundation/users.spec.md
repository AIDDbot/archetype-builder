<!--
Foundation spec 5 of 6: who uses the system? Optional (Halloween D12, D13; Columbus D3, D6, D13, D17, D18, D39, D45, D47, D51). It needs `configuration`, `monitoring` and `shell`.
Include it only if the system has users (actors, model.schema.md). Ask only if this is not clear. It is the only optional foundation spec: a property of the system decides it, never a project type.
Written in ASD-STE100 Simplified Technical English. Technical names are not dictionary words.
Create: aidd spec new feat users "Users" --domain foundation
Instance: replace each role (`api`, `web`, `e2e`) with the project name.
Remove the rows, requirements and Solution subsections of the roles that the system does not have. Then number the requirements again, with no gaps.
-->
# {id}-users — Users

## Problem

A system with users must know who sends each request, before a feature needs this data. The method must be small and safe. A user must see their account and end their session, and must never see the account of a different user. Each page and menu link must tell who can use it.

### User Stories

- As a visitor, I want **to register with my email, name and password** so that I get an account.
- As a user, I want **to log in and stay logged in after a reload** so that I can use the protected features.
- As a visitor, I want **to log in and go back to the page that I asked for** so that I do not look for it again.
- As a user, I want **to see my account** so that I know which data the application keeps about me.
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

### api

- Feature `auth`: register, login, me and logout. `Email` is a value object in `shared` (lower case), used at the edge and inside.
- Passwords: a slow, salted algorithm that OWASP recommends, with explicit cost parameters stored with each hash. An unknown email still does one verification.
- Sessions: a random opaque token; the database stores only its hash. `SESSION_TTL_HOURS` (1–720, default 24) is a new setting.
- Session guard in `core`, with a resolver from the `auth` registration. Each registration is protected unless it is marked public; `core` mounts the public ones first. No separate list of paths.
- Feature `users`: `GET /api/users/:id`, only for the current user, through the `auth` facade.

### web

- `logic` of `auth` keeps the session; the token stays in the browser storage, and the HTTP client sends it.
- One access mark on each page and menu link. `core` builds the menu and guards the pages from the marks and the session state, through the `auth` registration; it never imports `auth`.
- After a login, `core` goes back to `returnTo` only for a registered page on the same origin; otherwise `/`.
- Feature `users`: page `/users/:id`, mark `session`, no menu link.
- A change of the session state updates the menu and the cards, never the current page.

### cli

- n/a: a local `cli` has no users (Columbus D67). A `cli` that uses the session of an `api` is outside the foundation.

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

- **R01**: WHEN a visitor registers with a new email, a name and a password, the `api` SHALL answer 201 with the public user `{ id, email, name, role: "user", createdAt }`.
- **R02**: IF the email, name or password is missing or is not a non-empty string, THEN the `api` SHALL answer 400 with one `fields` entry for each incorrect field, and make no user. Test: a login with the rejected values also fails.
- **R03**: IF the email is already registered, in upper case or lower case, THEN the `api` SHALL answer 409 and keep the first account without changes. Test: after the 409, the first password still logs in.
- **R04**: WHEN a user logs in with valid credentials, the `api` SHALL answer 200 with `{ token, user }`. The `token` is a non-empty opaque string.
- **R05**: IF the password is incorrect or the email is unknown, THEN the `api` SHALL answer 401 with the same body `{ "error": "Invalid credentials" }`.
- **R06**: WHEN a request has `Authorization: Bearer <token>` of a valid session, `GET /api/auth/me` SHALL answer 200 with the public user.
- **R07**: IF a request to a protected route has no token or an invalid token, THEN the `api` SHALL answer 401 with the uniform error body.
- **R08**: WHEN a valid session requests `GET /api/users/:id` with the identifier of its own user, the `api` SHALL answer 200 with `{ name, email, createdAt }`.
- **R09**: IF a valid session requests `GET /api/users/:id` with a different identifier, THEN the `api` SHALL answer 404 with `{ "error": "Not found" }`, for an identifier that exists and for one that does not exist.
- **R10**: WHEN a valid session sends `POST /api/auth/logout`, the `api` SHALL answer 204 with no body and make that token invalid. The other sessions of the user SHALL stay valid. Test: log in two times, log out with the first token, `GET /api/auth/me` with each.
- **R11**: WHEN a visitor sends the register form, the `web` SHALL confirm the registration. IF the email is already registered, THEN it SHALL show the error and let the visitor try again.
- **R12**: WHEN a user sends valid credentials on the login page, the `web` SHALL show the name of the user in the menu. IF the credentials are incorrect, THEN it SHALL show the error and let the user try again.
- **R13**: WHILE a user is logged in, the `web` SHALL keep the session after a reload of the page.
- **R14**: WHEN a user sends a form two times quickly, the `web` SHALL send one request. Test: two `click()` calls in one page script, because a tool click waits for the enabled button; count the requests.
- **R15**: WHEN a user moves between `/register` and `/login` without a reload of the page, the form SHALL send the operation of the page that it shows.
- **R16**: IF the `api` answers the register form with `fields`, THEN the `web` SHALL show each message next to its field. Test: send a name that has only spaces.
- **R17**: WHEN a user sends the register form or the login form and the browser accepts its fields, the `web` SHALL write one console line with the name of the operation, before the answer comes. The line SHALL not contain a form value, a password or a token.
- **R18**: WHILE a user is logged in, the home page SHALL show an auth card with `Hello, {name}` as a link to their account, and SHALL not show the links to `/login` and `/register`. WHILE no user is logged in, the auth card SHALL show links to `/login` and `/register`.
- **R19**: WHEN a user with a session opens `/users/{id}` with their own identifier, the `web` SHALL show their name, their email and their creation date as a date that a person reads (such as `5 Oct 2026, 16:40`).
- **R20**: IF the account API answers 404, THEN the account page SHALL show `Account not found` and keep the menu.
- **R21**: WHILE no user is logged in, the menu SHALL show the links for `everyone` and for `anonymous`, such as `Login` and `Register`, and SHALL not show the account link or `Logout`.
- **R22**: WHILE a user is logged in, the menu SHALL show the name of the user as a link to their account and a `Logout` control, and SHALL not show the links for `anonymous`.
- **R23**: WHEN a visitor with no session opens a page with the mark `session`, the `web` SHALL show `/login`, keep the requested path, query and fragment, and not show the requested page. Test: open `/users/{id}?a=1#b`.
- **R24**: WHEN the login succeeds after R23, the `web` SHALL show the requested page without a full reload of the document.
- **R25**: IF the kept target is not a page of the application on the same origin, THEN the `web` SHALL show `/` after the login. Test: `returnTo` values `https://example.com/`, `//example.com` and `/no-such-page`.
- **R26**: WHEN a user selects `Logout` and the `api` answers 204 or 401, the `web` SHALL remove the token and the user, show `/` and show the menu for no session.
- **R27**: IF the logout fails because the `api` does not answer or answers 500, THEN the `web` SHALL show an error, keep the session, and let the user try again.

### Expected URLs and APIs

| Kind | Project | Address | Expected answer | Requirements |
| --- | --- | --- | --- | --- |
| api | api | `POST /api/auth/register` | 201 public user. 400 invalid input with `fields`. 409 email already registered. | R01, R02, R03 |
| api | api | `POST /api/auth/login` | 200 `{ token, user }`. 400 invalid input. 401 invalid credentials. | R04, R05 |
| api | api | `GET /api/auth/me` | 200 public user. 401 without a valid session. | R06, R07 |
| api | api | `GET /api/users/:id` | 200 `{ name, email, createdAt }` for the own user. 404 for a different identifier. 401 without a valid session. | R07, R08, R09 |
| api | api | `POST /api/auth/logout` | 204 with no body. 401 without a valid session. | R07, R10 |
| page | web | `/register` | Form with email, name and password. No role field. | R11, R14–R17 |
| page | web | `/login` | Form with email and password; the return to a guarded page | R12–R15, R17, R23–R25 |
| page | web | `/users/{id}` | Name, email and creation date, or `Account not found` | R19, R20 |
| page | web | `/` | Auth card | R18 |
| page | web | any page | Menu by access mark, and logout | R21, R22, R26, R27 |
