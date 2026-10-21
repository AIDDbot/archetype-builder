<!--
Foundation spec 6 of 6: what does each person keep? (Halloween D39). It needs `platform`, `shell` and `presentation`; in a `web`, it needs `users` too.
In a `cli`, the settings of the local file, with the `config` command. In a `web`, the preferences of each user, in their account: the theme and the date format. It is the first feature that edits a record of its own, with the form of `presentation`.
Written in ASD-STE100 Simplified Technical English. Technical names are not dictionary words.
Create: aidd spec new feat settings "Settings" --domain foundation
Instance: replace each role (`api`, `web`, `cli`, `e2e`) with the project name.
Remove the user stories, rows, requirements and Solution subsections of the roles that the system does not have. A system with a `web` and no users has no preferences to keep: remove the rows of the `api` and the `web`, and remove the spec when no `cli` remains. Then number the requirements again, with no gaps.
-->
# {id}-settings — Settings

## Problem

Each person must keep their choices, and change them with no change of code and no help: the user of a `cli` its settings, the user of a `web` the preferences of their account.

### User Stories

- As a user of a `cli`, I want **to keep my settings in a file, see where each value comes from, and change them with a command** so that I do not type them at each invocation.
- As a user of a `web`, I want **to keep my theme and my date format in my account** so that each device shows the application as I like it.

### Business rules

- A new value must pass the check of its setting or preference before it is kept. A value that does not pass changes nothing.
- A user must see and change only their own preferences.
- A `cli` must read each setting from the first source that has it: argument, environment, configuration file, default (`platform`).

### Out of context

- Other preferences, translation, and the settings of a server: an operator sets them with environment variables (`platform`).
- The preferences of a visitor with no session: the browser keeps the theme (`shell`).

## Solution

### api

- Feature `settings`: `GET` and `PUT /api/users/me/settings`, only with a session, through the `auth` facade. The preferences: `theme` (`system`, `light` or `dark`; default `system`) and `dateFormat` (`locale` or `iso`; default `locale`). `PUT` checks each field with `readFields` of `presentation` and keeps the record only when all fields pass.
- A user with no preferences gets the defaults; the first `PUT` makes the record.

### web

- Feature `settings`: page `/settings`, menu link `Settings`, access mark `session`. The form of `presentation`, with the current values, a save control, the confirmation `Settings saved` and the error of each field next to it.
- After a login and after a save, `core` applies the theme of the account through a session service of `shared/session/`; after a logout, the theme of the browser of `shell`. `core` never imports the feature.
- The values primitive of `presentation` reads the date format from the same service: `locale` is the language of the browser; `iso` is `2026-10-13 08:30`, in local time.

### cli

- Feature `config`, with the operations `get` and `set`, through the settings contract of `platform`, with `readSetting`. `set` checks the value before it writes. An unknown setting is a `usage` error; an invalid value is a `rule` error.
- `config get` is a list view of `presentation` (columns `Setting`, `Value`, `Source`); with a name, only the value. Its JSON: `{ "settings": [ { "name", "value", "source" } ] }`, or one `{ "name", "value", "source" }`.

### e2e

- A page object of `/settings`, with `recordForm(scope)` of `presentation`.
- The tests of the `cli` use the temporary configuration file of the helper of `platform`.

### Schema impact

| Schema | Element | Change | Description |
| --- | --- | --- | --- |
| model | Settings | new | `userId` → User (one record for each user), `theme`, `dateFormat`, `updatedAt`. |
| api.db | `settings.*` | new | The fields of Settings. `settings.userId` is the key. |

## Verification

### Requirements

- **R01**: WHEN a client with a session requests `GET /api/users/me/settings`, the `api` SHALL answer 200 with `{ "theme", "dateFormat" }` of that user, or the defaults `system` and `locale`. IF the request has no valid session, THEN it SHALL answer 401.
- **R02**: WHEN a client with a session sends `PUT /api/users/me/settings` with valid values, the `api` SHALL keep them and answer 200 with the kept record, and the next `GET` SHALL answer them. IF a value is not valid, THEN it SHALL answer 400 with one `fields` entry for each incorrect field, and keep nothing. Test: one invalid value in each field, in one request.
- **R03**: WHEN a user with a session opens `/settings` from the menu link `Settings`, the `web` SHALL show a form with the current theme and date format. WHEN the user saves new values, it SHALL show `Settings saved`, apply the theme at once, and show each date in the new format. IF the `api` rejects the values or does not answer, THEN it SHALL show the error and keep the values of the form. Test: save `dark` and `iso`, then open the account page and read its creation date; block the `PUT` in the browser.
- **R04**: WHEN a user logs in, the `web` SHALL apply the theme of their account, also when the browser keeps a different theme. WHEN the user logs out, it SHALL apply the theme of the browser. Test: a new browser context with the other theme.
- **R05**: WHEN the `cli` runs `config set <name> <value>` with a known setting and a valid value, it SHALL write the value to its configuration file, stop with exit code 0, and the next invocation SHALL use it. IF the setting is unknown, THEN it SHALL stop with exit code 2; IF the value is not valid, THEN with exit code 1. In both cases, it SHALL write a message that contains the name, and not change the file. Test: `config set LOG_LEVEL warn`, `config set NO_SUCH_SETTING x`, `config set LOG_LEVEL loud`.
- **R06**: WHEN the `cli` runs `config get`, it SHALL show a table with the columns `Setting`, `Value` and `Source` (`argument`, `environment`, `file` or `default`), with one row for each setting; with a name, only the value of that setting. Test: check each setting of the foundation, never the whole list or its order, because later specs add settings.
- **R07**: WHEN a setting has a value in more than one source, the `cli` SHALL show and use the first source in this order: argument, environment, configuration file, default. Test: give three values, then remove the argument and then the variable.

### Expected URLs and APIs

| Kind | Project | Address | Expected answer | Requirements |
| --- | --- | --- | --- | --- |
| api | api | `GET /api/users/me/settings` | 200 `{ "theme", "dateFormat" }`. 401 without a valid session. | R01 |
| api | api | `PUT /api/users/me/settings` | 200 the kept record. 400 with `fields`. 401 without a valid session. | R02 |
| page | web | `/settings` | Form with the current values; `Settings saved`, or the error of each field | R03 |
| page | web | any page, after a login or a logout | The theme of the account, or of the browser | R04 |
| command | cli | `config set <name> <value>` | Writes the file. Exit code 0. An unknown name: exit code 2. An invalid value: exit code 1. The file does not change. | R05 |
| command | cli | `config get [<name>]` | Table `Setting`, `Value`, `Source`, or the value of one setting | R06, R07 |
