# Archetype CLI

A system made from the Archetype CLI bedrock of the [Archetype Builder](https://github.com/AIDDbot/archetype-builder). It has the tooling of each project and no framework: the `scaffold` spec adds the framework and the code (Halloween D42). Each project that is not an `e2e` has the primitives of `src/shared/` in pure TypeScript, with their unit tests: checks, parsers and formats of text, numbers, booleans and dates, and the expected error (Halloween D47).

| Folder | Project type | Technology |
| --- | --- | --- |
| [`projects/cli/`](./projects/cli/) | `cli` | TypeScript on Node.js; no framework yet |
| [`projects/e2e/`](./projects/e2e/) | `e2e` | Vitest with no browser |

Common tooling: npm workspaces and [Vite+](https://viteplus.dev) (format, lint, type check, Vitest, and the `vp staged` pre-commit hook). The debt checks are in `tools/lint/`.

## Identity

Put the identity of your system in the `package.json` of each project that shows it: `displayName`, `description`, `author` (`name`, `url`) and `version`. The root has no identity.

## Run

Requirements: Node.js 26 or later, and Git.

```sh
npm install
npm run check
npm test
```

`npm install` runs `prepare`, which installs the pre-commit hook. `npm test` runs the unit tests of each project but the `e2e`, and `npm run test:e2e` runs the acceptance tests. `npm run check` checks the whole repository with no fix: format, lint and types, and `layers` and `crap` of each project (with the unit tests and their coverage); each step runs also after a red one, and the last line gives each red step; `npm run fix` applies the safe fixes. `npm run upgrade` raises each dependency of the root and of each project to its latest version. In each project: `npm test`, `npm run layers` (import boundaries) and `npm run crap` (complexity and coverage).

## License

[MIT](./LICENSE)
