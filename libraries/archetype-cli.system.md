# Archetype CLI

> Author: AIDDbot · Website: https://aiddbot.com · approved: 2026-10-14

## Purpose

A local command-line application and its acceptance suite. It is a library of archetypes: each system that starts from it copies its code, so it ships with zero debt.

## Users and needs

| User | Needs |
| --- | --- |
| Local operator | Run one command at a time, with settings in a file, and read the result as text or as JSON. |

The system has no user accounts.

## Projects

| Project | Type | Folder | Archetype | Responsibility |
| --- | --- | --- | --- | --- |
| cli | cli | `cli/` | Archetype CLI/cli | Run local commands and own the local store. |
| e2e | e2e | `e2e/` | Archetype CLI/e2e | Prove each command through its public interface. |

## Technical decisions

- TypeScript on Node.js, with the stack of `builder/blueprint/ecosystems.md`.
- Identity in the root `package.json`: `displayName` "Archetype CLI", `description` "A local command-line application and its acceptance suite", `author` "AIDDbot", `homepage` "https://aiddbot.com".
- Basic authentication: no, the system has no users.

## Scaffold

The `scaffold` spec of `builder/blueprint/foundation/` makes each project.
