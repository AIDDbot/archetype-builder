<!--
Foundation spec 2 of 6: how do we observe the system? (Halloween D7, D12, D13, D35; Columbus D17, D18, D39, D51). It needs `configuration`.
Written in ASD-STE100 Simplified Technical English. Technical names are not dictionary words.
Create: aidd spec new feat monitoring "Monitoring" --domain foundation
Instance: replace each role (`api`, `web`, `cli`, `e2e`) with the project name.
Remove the user stories, rows, requirements and Solution subsections of the roles that the system does not have. Then number the requirements again, with no gaps.
-->
# {id}-monitoring — Monitoring

## Problem

When a failure occurs, the operator must see what occurred, and each client must read failures in one shape.

### User Stories

- As an operator, I want **one short log line for each request, each command and each error, in a daily file** so that I can find the cause of a failure.
- As a client developer, I want **each API error in one body shape** so that I handle failures in one location.
- As a script author, I want **each `cli` failure on standard error with an exit code that tells its kind** so that a script can react to it.
- As a developer, I want **each server (`api`, `web`) to show its address when it starts** so that I can open it.

### Business rules

- A log line must be plain text that a person can read, never JSON.
- An error must not show internal details.
- A log line or a console line must never contain a password, a token or a form value.
- The exit code of a `cli` must be 0 for a success, 1 for a rule that rejects the input, 2 for an incorrect usage, and 3 for a missing configuration or resource.

### Out of context

- The answer to an unknown path or command, and the `--json` output (`shell`).
- Metrics, tracing, log shipping, rate limits. Log rotation, other than one file for each day.

## Solution

### api

- Logger in `core`, contract in `shared/logging/`: one line for each event, ` | ` for line breaks, `WARN` and `ERROR` to standard error. It never blocks a request, and writes each queued line before the stop. A unit test of `core` proves the stop, with the life cycle as an argument: the acceptance suite sends no signal of the operating system.
- The logger reads `LOG_DIR` and `LOG_LEVEL` only through their definitions in `configuration`, also before the configuration loads, so that a failure at startup has a log line. An invalid `LOG_DIR` writes no file; an invalid `LOG_LEVEL` takes its fallback. Never read them by hand or parse the arguments a second time. New setting: `BODY_LIMIT_KB` (100), a positive integer.
- The `source` column of a log line is the project name, such as `api` or `cli`.
- The expected error of `shared`, a seed of the scaffold, gets a status for each kind and optional `fields`. The error handler of `core` is the only code that makes an error response; it logs any other error at `ERROR` with its cause.
- Keep a received `X-Request-Id` only if it has 1 to 128 characters, and each character is a letter, a digit or `-`.
- The `api` has no route before `shell`: the success answer that R01 and R03 test is the CORS preflight of `configuration` (204). Add no route for a test.

### web

- The listening line comes only after the server listens.
- Console logger in `core`, contract in `shared/logging/`: one line for each user action, with no words of a feature and no form value.
- The HTTP client of `core` changes each error answer into the expected error, with its `fields`.

### cli

- Logger as the `api`, with no `BODY_LIMIT_KB`.
- The expected error of `shared`, a seed of the scaffold, gives each kind its exit code: `rule` (1), `usage` (2) or `unavailable` (3). In `config set`, an unknown setting is `usage` and an invalid value is `rule`; an invalid setting or a configuration file that does not open is `unavailable`.
- `core` catches each failure at the top level and is the only code that makes an exit code. An unexpected failure writes `error: Unexpected failure`, exit code 1, and logs its cause. Never a stack trace on the console. No public command can cause an unexpected failure: a unit test of `core` proves it, never an acceptance test, and no test injects a failure into the `cli` process.
- Results go to standard output; messages and errors go to standard error.

### e2e

- Helpers in `shared` check the error body of the `api` and the `error:` line and exit code of the `cli`. All tests use them.

## Verification

### Requirements

- **R01**: WHEN the `api` completes a request, it SHALL add one plain-text line to `{LOG_DIR}/{yyyy-mm-dd}.log` with the columns `time source LEVEL message`: the local time `HH:MM:SS.mmm`, and the method, path, status and duration in milliseconds, with no request identifier. The level SHALL be `ERROR` for a status of 500 or more, `WARN` from 400 to 499, and `INFO` otherwise. WHILE `LOG_LEVEL` is set, it SHALL write no line below that level. Test: send a known `X-Request-Id`, and the line does not contain it; with `LOG_LEVEL=warn`, a success writes no line. The success is a CORS preflight (204).
- **R02**: IF a request body is not valid JSON or is larger than `BODY_LIMIT_KB` kilobytes, THEN the `api` SHALL answer 400 or 413 with `{ "error": "<message>" }`.
- **R03**: WHEN the `api` answers a request, the answer SHALL have the received `X-Request-Id`, or a new unique one, and the headers `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` and `Referrer-Policy: no-referrer`.
- **R04**: WHEN a server starts to listen, it SHALL write one console line with a URL that a browser can open: the configured host, or `localhost` when it listens on all interfaces. IF it cannot start, THEN it SHALL write no listening line. Test: start on a free port, and that URL answers; start with an incorrect `PORT`.
- **R05**: WHEN a `cli` invocation completes, the `cli` SHALL add one line with the columns of R01 to `{LOG_DIR}/{yyyy-mm-dd}.log`: the command, the exit code and the duration in milliseconds, with no argument value. The level SHALL be `ERROR` for exit code 3, `WARN` for 1 and 2, and `INFO` for 0, and `LOG_LEVEL` SHALL filter it as in R01. Test: give a setting as an argument, and the line does not contain its value.
- **R06**: IF a `cli` invocation fails, THEN the `cli` SHALL write `error: <message>` to standard error and stop with the exit code of its kind: 1 for a rule that rejects the input, 2 for an option that its command does not know (with its name), and 3 for an invalid setting, a configuration file that does not open or an `api` that does not answer (with the setting or the resource). Test: `config set LOG_LEVEL loud`; `config get --no-such-option`; `CONFIG_FILE` set to a folder.

### Expected URLs and APIs

| Kind | Project | Address | Expected answer | Requirements |
| --- | --- | --- | --- | --- |
| api | api | `POST /api/{any}` with an incorrect body | 400 `{ "error": "<message>" }`, with `fields` for an input error; 413 for a body larger than the limit | R01, R02 |
| api | api | any path, and the CORS preflight | `X-Request-Id` and the security headers, also on an error. An unexpected failure: 500 `{ "error": "Internal server error" }` | R03 |
| process | api, web | start | One console line with an openable URL | R04 |
| command | cli | any command | One log line for each invocation | R05 |
| command | cli | `config set LOG_LEVEL {incorrect}`, `config get --no-such-option`, a configuration file that does not open | `error: <message>`. Exit code 1, 2 or 3. | R06 |
