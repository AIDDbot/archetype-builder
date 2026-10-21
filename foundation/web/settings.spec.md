<!-- Instance of the foundation spec for Archetype Web. aidd spec new feat settings "Settings" --domain foundation --from .product/foundation/settings.spec.md -->
# {id}-settings — Settings

## Problem

Each person must keep the preferences of their account, and change them with no change of code and no help.

### User Stories

- As a user of the `front`, I want **to keep my theme and my date format in my account** so that each device shows the application as I like it.

### Business rules

- A new value must pass the check of its setting or preference before it is kept. A value that does not pass changes nothing.
- A user must see and change only their own preferences.

### Out of context

- Other preferences, translation, and the settings of a server: an operator sets them with environment variables (`platform`).
- The preferences of a visitor with no session: the browser keeps the theme (`shell`).

## Solution

### back

- Feature `settings`: `GET` and `PUT /api/users/me/settings`, only with a session, through the `auth` facade. The preferences: `theme` (`system`, `light` or `dark`; default `system`) and `dateFormat` (`locale` or `iso`; default `locale`). `PUT` checks each field with `readFields` of `presentation` and keeps the record only when all fields pass.
- A user with no preferences gets the defaults; the first `PUT` makes the record.

### front

- Feature `settings`: page `/settings`, menu link `Settings`, access mark `session`. The form of `presentation`, with the current values, a save control, the confirmation `Settings saved` and the error of each field next to it.
- After a login and after a save, `core` applies the theme of the account through a session service of `shared/session/`; after a logout, the theme of the browser of `shell`. `core` never imports the feature.
- The values primitive of `presentation` reads the date format from the same service: `locale` is the language of the browser; `iso` is `2026-10-13 08:30`, in local time.

### e2e

- A page object of `/settings`, with `recordForm(scope)` of `presentation`.

### Schema impact

| Schema | Element | Change | Description |
| --- | --- | --- | --- |
| model | Settings | new | `userId` → User (one record for each user), `theme`, `dateFormat`, `updatedAt`. |
| api.db | `settings.*` | new | The fields of Settings. `settings.userId` is the key. |

## Verification

### Requirements

- **R01**: WHEN a client with a session requests `GET /api/users/me/settings`, the `back` SHALL answer 200 with `{ "theme", "dateFormat" }` of that user, or the defaults `system` and `locale`. IF the request has no valid session, THEN it SHALL answer 401.
- **R02**: WHEN a client with a session sends `PUT /api/users/me/settings` with valid values, the `back` SHALL keep them and answer 200 with the kept record, and the next `GET` SHALL answer them. IF a value is not valid, THEN it SHALL answer 400 with one `fields` entry for each incorrect field, and keep nothing. Test: one invalid value in each field, in one request.
- **R03**: WHEN a user with a session opens `/settings` from the menu link `Settings`, the `front` SHALL show a form with the current theme and date format. WHEN the user saves new values, it SHALL show `Settings saved`, apply the theme at once, and show each date in the new format. IF the `back` rejects the values or does not answer, THEN it SHALL show the error and keep the values of the form. Test: save `dark` and `iso`, then open the account page and read its creation date; block the `PUT` in the browser.
- **R04**: WHEN a user logs in, the `front` SHALL apply the theme of their account, also when the browser keeps a different theme. WHEN the user logs out, it SHALL apply the theme of the browser. Test: a new browser context with the other theme.

### Expected URLs and APIs

| Kind | Project | Address | Expected answer | Requirements |
| --- | --- | --- | --- | --- |
| api | back | `GET /api/users/me/settings` | 200 `{ "theme", "dateFormat" }`. 401 without a valid session. | R01 |
| api | back | `PUT /api/users/me/settings` | 200 the kept record. 400 with `fields`. 401 without a valid session. | R02 |
| page | front | `/settings` | Form with the current values; `Settings saved`, or the error of each field | R03 |
| page | front | any page, after a login or a logout | The theme of the account, or of the browser | R04 |
