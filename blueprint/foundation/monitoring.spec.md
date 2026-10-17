<!--
Foundation spec 2 of 6: how do we observe the system? (Halloween D7, D12, D13, D35; Columbus D17, D18, D39, D51). It needs `configuration`.
Written in ASD-STE100 Simplified Technical English. Technical names are not dictionary words.
Create: aidd spec new feat monitoring "Monitoring" --domain foundation
Instance: replace each role (`api`, `web`, `cli`, `e2e`) with the project name.
Remove the rows, requirements and Solution subsections of the roles that the system does not have. Then number the requirements again, with no gaps.
-->
# {id}-monitoring — Monitoring

## Problem

When a failure occurs, the operator must see what occurred, and each client must read failures in one shape.

### User Stories

- As an operator, I want **one short log line for each request, each command and each error, in a daily file** so that I can find the cause of a failure.
- As a client developer, I want **each API error in one body shape** so that I handle failures in one location.
- As a script author, I want **each `cli` failure on standard error with an exit code that tells its kind** so that a script can react to it.
- As a developer, I want **each server to show its address when it starts** so that I can open it.

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

- Logger in `core`, contract in `shared`: one line for each event, ` | ` for line breaks, `WARN` and `ERROR` to standard error. It never blocks a request, and writes each queued line before the stop.
- The logger reads `LOG_DIR` and `LOG_LEVEL` only through their definitions in `configuration`, also before the configuration loads, so that a failure at startup has a log line. An invalid `LOG_DIR` writes no file; an invalid `LOG_LEVEL` takes its fallback. Never read them by hand or parse the arguments a second time. New setting: `BODY_LIMIT_KB` (100), a positive integer.
- The `source` column of a log line is the project name, such as `api` or `cli`.
- The expected error of `shared`, a seed of the scaffold, gets a status for each kind and optional `fields`. The error handler of `core` is the only code that makes an error response; it logs any other error at `ERROR` with its cause.
- Keep a received `X-Request-Id` only if it is a short text of letters, digits and `-`.

### web

- The listening line comes only after the server listens.
- Console logger in `core`, contract in `shared`: one line for each user action, with no words of a feature and no form value.
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

- **R01**: WHEN the `api` completes a request, it SHALL add one plain-text line to `{LOG_DIR}/{yyyy-mm-dd}.log` with the columns `time source LEVEL message`, separated by spaces. The `time` SHALL be the local time of day `HH:MM:SS.mmm`. The message SHALL contain the method, path, status and duration in milliseconds, and no request identifier. Test: send a known `X-Request-Id`; the line does not contain it.
- **R02**: WHEN a request completes, the `api` SHALL log it at level `ERROR` if the status is 500 or more, at `WARN` if the status is from 400 to 499, and at `INFO` for other statuses.
- **R03**: WHEN a request body is not valid JSON, the `api` SHALL answer 400 with `{ "error": "<message>" }`.
- **R04**: IF a request body is larger than `BODY_LIMIT_KB` kilobytes, THEN the `api` SHALL answer 413 with `{ "error": "<message>" }`.
- **R05**: WHEN a request has an `X-Request-Id` header, the `api` SHALL answer with the same `X-Request-Id`.
- **R06**: WHEN a request has no `X-Request-Id` header, the `api` SHALL make a new unique identifier and answer with it in `X-Request-Id`.
- **R07**: WHEN the `api` answers a request, the answer SHALL have the headers `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` and `Referrer-Policy: no-referrer`.
- **R08**: WHEN the `api` starts to listen, it SHALL write one console line with a URL that a browser can open: the configured host, or `localhost` when it listens on all interfaces. Test: start on a free port; that URL answers.
- **R09**: WHEN the `web` server starts to listen, it SHALL write one console line with a URL that a browser can open.
- **R10**: IF a server cannot start, THEN it SHALL write no listening line. Test: start with an incorrect `PORT`.
- **R11**: WHEN a `cli` invocation completes, the `cli` SHALL add one line with the columns of R01 to `{LOG_DIR}/{yyyy-mm-dd}.log`. The message SHALL contain the command, the exit code and the duration in milliseconds, and no argument value. Test: give a setting as an argument; the line does not contain its value.
- **R12**: WHEN an invocation completes, the `cli` SHALL log it at level `ERROR` for exit code 3, at `WARN` for exit codes 1 and 2, and at `INFO` for exit code 0.
- **R13**: WHILE `LOG_LEVEL` is set, the `api` and the `cli` SHALL write no line below that level. Test: with `LOG_LEVEL=warn`, a success writes no line.
- **R14**: IF a `cli` command rejects its input by a rule, THEN the `cli` SHALL write `error: <message>` to standard error and stop with exit code 1. Test: `config set LOG_LEVEL loud`.
- **R15**: IF a `cli` invocation has an option that its command does not know, THEN the `cli` SHALL write `error: <message>` with the name of that option to standard error and stop with exit code 2.
- **R16**: IF a setting of the `cli` is not valid, or the `cli` cannot open its configuration file or reach the `api`, THEN the `cli` SHALL write `error: <message>` with the setting or the resource to standard error and stop with exit code 3. Test: give `CONFIG_FILE` a path that is a folder.

### Expected URLs and APIs

| Kind | Project | Address | Expected answer | Requirements |
| --- | --- | --- | --- | --- |
| api | api | `POST /api/{any}` with an incorrect body | 400 `{ "error": "<message>" }`, with `fields` for an input error | R01, R02, R03 |
| api | api | `POST /api/{any}` with a body larger than the limit | 413 `{ "error": "<message>" }` | R04 |
| api | api | any path | `X-Request-Id` and the security headers, also on an error. An unexpected failure: 500 `{ "error": "Internal server error" }` | R05, R06, R07 |
| process | api, web | start | One console line with an openable URL | R08, R09, R10 |
| command | cli | any command | One log line for each invocation | R11, R12, R13 |
| command | cli | `config set LOG_LEVEL {incorrect}` | `error: <message>`. Exit code 1. | R14 |
| command | cli | `config get --no-such-option` | `error: <message>`. Exit code 2. | R15 |
| command | cli | any command with a configuration file that does not open | `error: <message>`. Exit code 3. | R16 |
