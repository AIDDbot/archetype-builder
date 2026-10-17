# Archetype Web

> Author: Alberto Basalo · Website: https://aiddbot.com · approved: 2026-10-17

## Purpose

A web application with its API, its browser screens and its acceptance suite. It is an archetype: each system that starts from it copies its code, so it ships with zero debt.

## Users and needs

| User | Needs |
| --- | --- |
| Visitor | See the home page, the about page and the version, and register an account. |
| Registered user | Log in, see and change the own account, and log out. |

The system has user accounts with basic authentication.

## Projects

| Project | Type | Folder | Archetype | Responsibility |
| --- | --- | --- | --- | --- |
| back | api | `projects/back/` | Archetype Web/back | Own the data and serve the API. |
| front | web | `projects/front/` | Archetype Web/front | Show the screens and get data only from the API. |
| e2e | e2e | `projects/e2e/` | Archetype Web/e2e | Prove each requirement through the API and the screens. |

## Technical decisions

- TypeScript on Node.js, with the stack of `.product/blueprint/ecosystems.md`.
- `back`: Express, with persistence in SQLite through `node:sqlite`.
- `front`: React on Vite, with react-router and an explicit route list as the manifest; no Next.js. Pico CSS with the brand theme of `.product/blueprint/theme/`.
- `e2e`: Playwright, with Chromium only.
- Identity in the root `package.json`: `displayName` "Archetype Web", `description` "A web application with its API, its browser screens and its acceptance suite", `author` "Alberto Basalo" with `url` "https://x.com/albertobasalo", `homepage` "https://aiddbot.com", `license` "MIT".
- License: MIT, with the copyright of Alberto Basalo, in `LICENSE` at the root.
- Basic authentication: yes, the system has users.

## Scaffold

The `scaffold` spec of `.product/blueprint/foundation/` makes each project.
