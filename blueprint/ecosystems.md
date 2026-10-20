# Usual implementations by ecosystem

Guidance to fill the Tooling section of [`project.AGENTS.template.md`](./project.AGENTS.template.md). It never obliges: the archetype chooses the best tool for its stack, and any tool that meets the slot contract is valid.

## JS / TS on Node: the required stack

JS / TS on Node is the exception: AIDDbot sets its stack. Other platforms, such as Bun, are not in the stack yet (Halloween D16). Reference: the Vite+ trial of Halloween steps 2 and 3 (`.product/halloween/quality-gates.prompt.md` of AIDDbot).

**TypeScript and tools**

- Use Vite+ (`vite-plus`, command `vp`) for each project: Oxfmt formats, Oxlint lints and checks the types, Vitest runs the tests, and `vp staged` is the pre-commit hook. Never add a different formatter, linter, test runner or hook tool.
- Use TypeScript 7. Never pin an older major. If a tool does not support TypeScript 7, replace the tool. Do not keep the old TypeScript.
- Do not add a tool that needs the JavaScript API of TypeScript (for example, dependency-cruiser or `@typescript-eslint/parser`).

**System workspace**

A repository has one pre-commit hook, so the root of the system is one Vite+ workspace (quality gates, step 3):

- Each project is a flat folder with its name in `projects/`: `projects/back/`, `projects/front/`, `projects/cli/`, `projects/e2e/`. It is a project, never an app: do not use the `apps/` and `packages/` folders of the Vite+ templates. Thus the root keeps only the records of AIDDbot, the hook and the workspace.
- The root `package.json` has `"workspaces": ["projects/*"]`, `license`, `vite-plus` in `devDependencies`, `"prepare": "vp config"` (it installs the hook) and `"test": "vp run -r test"`.
- `.vite-hooks/pre-commit` contains `vp staged`. `vp config` installs the dispatcher, but not this file: write it.
- The root has no `tsconfig.json`. Each project has its own `tsconfig.json`, with `"erasableSyntaxOnly": true`, `"allowImportingTsExtensions": true` and `"types": ["node"]`: Node.js runs the TypeScript files as they are, so a syntax that it cannot erase (such as a parameter property `constructor(public readonly kind)`) fails at run time, not at the type check.
- Each project has its `package.json` with its scripts, its `vite.config.ts` with its Vitest project (`name`, `include`) and its coverage, and a `.gitignore` that anchors its runtime data: the default paths of its settings, such as `/data/`, `/logs/` or `/config.json`.
- A file never imports from a parent folder (`../`). The `imports` of the `package.json` of each project give the three ways out of a folder: `"#shared/*": "./src/shared/*"`, `"#core/*": "./src/core/*"` and `"#api/*": "./src/features/*/*.api.ts"` (in an `e2e`, only `"#shared/*": "./shared/*"`). A file imports `#shared/dates.format.ts`, `#core/configuration.ts` from a folder of `core` or from the composition, `#api/{feature}` for the facade of a different feature, and `./` in its own folder. Node.js, Vite and TypeScript resolve them with no other configuration. `#api` reaches only the facade: thus a feature has no way into the files of a different feature. `layers` forbids `#core` in `shared` and in the features: they get the services of `core` from the composition, through the contracts of `shared`.
- The root `.gitignore` comes from the AIDDbot overlay, with the secrets and `/.aiddbot/logs/`. Add lines to it; never write it again. It does not anchor `node_modules/`, `.vite/` and `coverage/`: Vitest makes them in each project.
- The root `.gitattributes` keeps LF on each platform, as Oxfmt writes it: `* text=auto eol=lf`, then `*.bat`, `*.cmd` and `*.ps1` with `text eol=crlf`, and `*.png`, `*.jpg` and `*.woff2` as `binary`. Write it first, before the first commit: on Windows, an agent writes CRLF, and a hook with CRLF does not run.

The root `vite.config.ts`:

```ts
import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
    "*.ts": "vp test related --run --passWithNoTests",
  },
  fmt: { ignorePatterns: ["**/*.md", ".agents/**", ".aiddbot/**", ".lint/**"] },
  lint: {
    ignorePatterns: [".agents/**", ".aiddbot/**", ".lint/**"],
    plugins: ["typescript", "unicorn", "oxc", "import", "node", "promise", "vitest"],
    categories: { correctness: "error", suspicious: "error" },
    options: { typeAware: true, typeCheck: true },
    rules: { "typescript/no-non-null-assertion": "error" },
  },
  test: { projects: ["projects/*"] },
});
```

**Pre-commit hook**

- The hook formats, lints and checks the types of the staged files with the safe fixes, and runs the unit tests that import them. It adds the fixes to the commit. A failure stops the commit.
- `vp check` checks the types only with `typeAware` and `typeCheck`. Without them, a type error passes.
- Formatting leaves Markdown out (`ignorePatterns`). A commit of specs or docs only runs no test.
- Format and lint leave out `.agents/` and `.aiddbot/` (`ignorePatterns`): AIDDbot owns them, and a commit of `aiddbot update` must pass the hook with no change to them. They leave out `.lint/` too: it is a copy of `.product/blueprint/lint/` as it is, and a format would make it differ.
- `test.projects` names the folder of each Vitest project, so that `vp test related` uses the configuration of each project.
- The hook lints by packages, never rule by rule: the categories `correctness` and `suspicious`, with the plugins of the stack (add `react` and `jsx-a11y` in a `web` with React). Never turn on a rule or turn off a rule of a package one by one. A finding of a package is repaired in the code.
- The one rule turned on: a value that can be missing is checked, never asserted with `!` (`typescript/no-non-null-assertion`). It is in the category `restriction`, which is not a package: its rules contradict each other.
- A false alarm of a package, in a `web` with React: `react/react-in-jsx-scope`. React 17 and later transforms JSX with no `React` in scope. Turn it off in the `rules` of the root `vite.config.ts`, next to the rule turned on; never in a file of its own.

**Unit tests**

- Vitest, through `vp test`. A test imports from `vite-plus/test`. The `vite.config.ts` of the project includes `src/**/*.test.ts`.
- A unit test proves logic only: fast, no disk, database, network or process. It gets each one as an argument (such as `files: { read, write }`), with a fake (`vi.fn`), never `vi.mock` or `vi.doMock` (`layers` checks it with `vitest/no-restricted-vi-methods`). The acceptance tests prove `data` and the adapters of `core`.
- Only an adapter of `core` (`src/core/**/{concern}.adapter.ts`) imports a module of the platform with effects: disk, database, network, process. It gives the real implementation of a contract of `shared` (`export const textFiles: TextFiles = { read: (path) => readFile(path, "utf8"), … }`), with no logic and no branch: `crap` gives each function of an adapter a complexity of 1. Each other file gets it as an argument, as a default value or from the composition. Coverage leaves the adapters out: no unit test can prove them without the platform. Thus a decision (a fallback, an order of steps, a message from an error) goes to a function of `core` that gets the adapter as an argument, and that function has its tests.
- The identity is data, never an effect. It is the standard fields of the `package.json` of each project that shows it (`api`, `web`, `cli`): `displayName`, `description`, `author` (`name`, `url`, and an optional `email` that no project shows) and `version`. Each field is required, with no fallback. The root has none: the owner changes the identity in the `package.json` of each project. That `package.json` has `"#package": "./package.json"` in its `imports`. The composition imports it, `import identity from "#package" with { type: "json" }`, and gives it to `core` and to the features as the `Identity` type of `shared`: TypeScript rejects a `package.json` with no field of it. Node.js, Vite and TypeScript resolve it, and a `web` gets it in its bundle: no adapter, no disk, no request. `aidd release` writes each `version` (`release.versionFiles`).
- Each module has its test file next to it, with the same name (`numbers.parse.ts` and `numbers.parse.test.ts`), the seed primitives too: never one test file for several modules. Thus the hook runs only the tests of the changed files, and a missing test shows in the folder.

**Debt checks**

- All the debt checks are in `.lint/` at the root, named by what they check. Copy them as they are: [`boundaries.json`](./lint/boundaries.json) and [`boundaries.e2e.json`](./lint/boundaries.e2e.json) for `layers`, [`complexity.json`](./lint/complexity.json) (the limits of code, with an override for `*.test.ts`) and [`complexity.e2e.json`](./lint/complexity.e2e.json) (the limits of tests for all files) for `crap`, and [`conditions.mjs`](./lint/conditions.mjs) and [`types.mjs`](./lint/types.mjs), the rules of our own, which both `complexity` files load. Each project has a `boundaries.json` and a `complexity.json` at its root, with only `$schema` and `extends` (`["../../.lint/boundaries.json"]`; `boundaries.e2e.json` and `complexity.e2e.json` in an `e2e`): Oxlint reads the path of `extends` from the file, never from the working directory, and the scripts of each project type stay the same. No project has a `lint/` folder. A change for one project is an override by path in the file of `.lint/`.
- Run `npm run fix` at the root before `layers` and `crap`. The hook formats each commit, and `layers` counts duplicated blocks on the lines as they are: a check before the format misses a block that the format makes, and that block comes back as debt after the ship.
- The patterns use braces for each set of names and extensions (`*.{page,component,card}.{ts,tsx}`), in `files` and in each `group`.
- Each rule is an `error`, so that a check fails with its findings. The configurations turn off the categories of the hook: a debt check never reports what the hook reports.
- Oxlint reads the `files` of an override relative to the configuration file. Start each path with `**/` (`**/src/core/**/*.ts`): a path such as `src/core/*.ts` matches nothing from `.lint/`, and the check passes with no warning.
- A later override replaces the rule; it does not merge it, and Oxlint has no rule of zones (`import/no-restricted-paths`). Thus the boundaries between folders are a different rule, for all files: `import/no-relative-parent-imports` forbids `../`, and the aliases of `imports` are the only ways out. `no-restricted-imports` keeps only what a folder cannot say: the direction of the layers in a feature, the manifest, main, `#api` in `core` and `shared`, and React. Each file matches one override of it.
- Coverage: add `@vitest/coverage-v8` to the root `devDependencies`, next to `vite-plus` and at its Vitest version. In the `vite.config.ts` of the project, `coverage.include` is `src/**/*.ts` (else a file that no test loads does not count), `coverage.exclude` is the tests and `src/core/**/*.adapter.ts`, and `coverage.thresholds` gives exactly 80, never more, for `statements`, `branches`, `functions` and `lines` to `src/core/**` and `src/shared/**`, with `perFile: true` (else a file with no test passes inside the mean of its folder).
- A false alarm of a rule is turned off in its file of `.lint/`, by path, never with a comment in each place.
- Do not write an own boundary checker: the overrides check the imports, and the `layers` run of the core reports a subfolder in a feature.
- A condition is a name (`conditions/named`, a `jsPlugins` rule of Oxlint in `.lint/conditions.mjs`; no rule of a package checks it). The test of an `if`, a `while` or a ternary is a name, or its negation with `!`: a variable (`hasUnknown`), a member (`!migration.version`) or a call of a named predicate (`isEmpty(migration)`), with one logical operator at most between names. A comparison or a callback goes into a `const` with a name before it: `const hasUnknown = unknownVersion !== undefined; if (hasUnknown) …`. The iterable of a `for…of` has no callback: `const pending = migrations.filter(…); for (const migration of pending) …`. TypeScript narrows the types through the `const`.
- A parameter has a named type (`types/named`, a `jsPlugins` rule of Oxlint in `.lint/types.mjs`). An object type is never written in a signature: `function listen(options: ListenOptions)`, with `type ListenOptions = { … }` in the contract of `shared` or above the function. The props of a component too: `type AboutPageProps = { … }`. A type that a function returns has a name too, never `ReturnType<typeof …>` in a parameter.
- An exported function declares its return type (`typescript/explicit-module-boundary-types`, in `crap`): `export function openDatabase(path: string): Database`. A function that returns an object with methods returns the named type of its contract, so the reader sees what it gives without the implementation. A component (`.tsx`) returns JSX and has no annotation.
- Add a rule of our own only when no rule of a package checks the same.

**Acceptance tests**

- An acceptance test proves what a person or a client sees, one time for each behavior, through the public interface (Halloween D39). A list of values (limits, invalid inputs, formats) is a unit test of the function that checks it; the acceptance test takes one value of the list. A `chore` has no acceptance test.
- A test uses the servers that the suite started, with unique data for each test, so that the tests run in parallel with the workers of the runner: never `workers: 1`. Only a test of a start (a setting, the listening line) starts a server of its own.
- The `e2e` project is a sibling folder. It starts each project with the command of its `start` slot, run directly and never through npm (`node src/app.main.ts`): npm adds about half a second to each start, and a suite starts a `cli` tens of times. A value with npm ends in `--`. It never imports the code of a project: the `**/src/**` group of `.lint/boundaries.e2e.json` checks it.
- The settings of each project (its folder, its start command) and its client are in `shared/projects/`. A test gets them from there, never from `core`: `core` is only the life cycle of the suite.
- A test keeps the tag of each requirement that it proves. A later spec adds its tag next to the others; it never replaces the tag of another spec.
- A system with no `web`: Vitest. The `vite.config.ts` of the `e2e` includes `**/*.test.ts`. The requirement tag goes in the title of the test (`"@S0001-R01 …"`): Vitest has no tags.
- A project that the suite starts can start children of its own (`vp dev` starts Vite). Stop it with `tree-kill` on the identifier of the started process: it stops the whole tree on each platform. `child.kill` alone leaves the server listening on Windows. Then wait for the `close` event of the child, not `exit`, and delete its temporary folders with `rm(folder, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })`: Windows keeps the SQLite file locked for a moment after the process ends (`EBUSY`).
- No script of an operating system in the suite (PowerShell, shell scripts) and no branch for a platform: `layers` rejects `process.platform`. A requirement that needs a signal of the operating system, such as a clean stop that writes the queued log lines, is proved by a unit test of `core` with the life cycle as an argument.
- A system with a `web`: Playwright, with one browser engine (Chromium). Turn off `no-empty-pattern` for the Playwright fixtures and tests with no fixture (`({}, use)`, `({}, testInfo)`). Never add a false dependency to avoid the rule.

**Arguments of a `cli`**

- `core` reads the arguments with `node:util` `parseArgs` (`strict: true`, `allowPositionals: true`), from the options that each registration gives as data. It never writes an own parser: a hand-written parser goes over the complexity limits again and again (cli-9).
- An error of `parseArgs` (`code` `ERR_PARSE_ARGS_*`) is the `usage` error of `platform`. Any other error is a defect of the definitions, and passes as it is.

**Persistence**

- Use `node:sqlite` (`DatabaseSync`) for the database of an `api`, and for the local store of a `cli` when a spec adds one: the foundation of a `cli` has no store (Halloween D35). It is part of Node.js: no dependency to add or upgrade.
- `DATABASE_URL` is the path of the database file. Its default is `./data/app.sqlite`, relative to the project folder.
- Write it in the main dependencies and in the technology rules of the project `AGENTS.md`: the specs never name it.

**Script names**

- The slot names are the script names: `test`, `test:spec`, `start`, `layers`, `crap`, and `upgrade` at the root. Use the standard npm names, which run without `run`: `test` and `start`. The scripts of a project are its slots and no more: `start`, `test`, `layers` and `crap`, and `test:spec` in an `e2e`. The root has `prepare`, `test`, `upgrade`, and two scripts for a human: `"check": "vp check && vp test run"` (the hook on the whole repository, with no fix) and `"fix": "vp check --fix"`.
- Lint, format and the affected unit tests are no slots: the hook runs them, and `check` and `fix` run them by hand.
- `test` runs all the tests of the project: `vp test run`. In an `e2e` project, `vp test run --passWithNoTests` (or `playwright test --pass-with-no-tests`), so that the scaffold passes before the first spec.
- In an `e2e` project, `start` is for a human only: with Vitest, the watch mode `vp test --passWithNoTests`, with no UI package; with Playwright, `playwright test --ui`.
- `test:spec` exists only in an `e2e` project. It ends in the filter flag of the runner, because the core adds only the tag (`@S0001-`): `vp test run --passWithNoTests -t` (or `playwright test --pass-with-no-tests --grep`).
- `layers` is `vp lint -c boundaries.json`. `crap` is one script: `vp lint -c complexity.json && vp test run --coverage`, always in that order, so that a repair first simplifies and then proves; in an `e2e`, only `vp lint -c complexity.json`. Both read the local file of the project, which extends `.lint/`. Each project registers `npm run layers` and `npm run crap`.
- The dependencies are in the root `package.json`, so one `upgrade` script at the root raises them all: `npx npm-check-updates@latest -u && npm install`. npm-check-updates runs with `npx` only when the slot runs: it is no dependency. Each project registers the slot as the command `npm --prefix ../.. run upgrade`, with no script of its own. Vite+ has no upgrade command yet.
- `upgrade` raises `vite-plus` and `@vitest/coverage-v8` together: their Vitest must be the same.

**Scaffold commands**

These commands were tested without a terminal (the input is closed). Run them from the repository root. Each one writes only its folder and asks nothing:

| Project | Command | Notes |
| --- | --- | --- |
| system root | `npm init -y --init-type=module && npm install -D vite-plus` | Then write the workspace files above, and run `npm install`: its `prepare` installs the hook. |
| `api` | `mkdir -p projects/back && (cd projects/back && npm init -y --init-type=module)` | Writes only `package.json`. Not tested yet in a Vite+ workspace. |
| `cli` | `mkdir -p projects/cli && (cd projects/cli && npm init -y --init-type=module)` | Writes only `package.json`. Add `bin`. |
| `web` | `npm create vite@latest projects/front -- --template react-ts --no-interactive --no-immediate` | Installs nothing. Remove what Vite+ replaces: the ESLint packages and `eslint.config.js`, `typescript`, and the `lint` script; keep `react`, `react-dom`, `@vitejs/plugin-react` and the React types. Then run `npm install` at the root. Not tested yet in a Vite+ workspace. |
| `e2e` | `mkdir -p projects/e2e && (cd projects/e2e && npm init -y --init-type=module)` | With a `web`: `npm init playwright@latest projects/e2e -- --quiet --browser=chromium --lang=TypeScript --no-examples --no-browsers`, then `npx playwright install chromium` in the folder. |

Use these commands as they are. Test a different generator in a temporary folder before you write it in the proposal.

| Ecosystem | Hook: lint, format, affected unit tests | Types | Unit tests (inside `test`) | Boundaries (`layers`) | Complexity and coverage (`crap`) |
| --- | --- | --- | --- | --- | --- |
| JS / TS on Node | `vp staged`: `vp check --fix`, `vp test related` | Oxlint `typeCheck` (TypeScript 7); no `tsc` | Vitest (`vp test`) | Oxlint `import/no-relative-parent-imports` with the `imports` aliases, and `no-restricted-imports` with `overrides` per file role | Oxlint with a configuration of complexity and size rules only |
| Go | `go vet`, golangci-lint, `gofmt -w`, `go test` of the changed packages | compiler | `go test` | `internal/` + depguard | gocyclo, gocognit |
| Rust | `cargo clippy`, `cargo fmt`, `cargo test` | compiler | `cargo test` | module visibility | `clippy::cognitive_complexity` |
| PHP | PHP_CodeSniffer, `php-cs-fixer fix` | PHPStan, Psalm | PHPUnit, Pest | Deptrac | PHPMD |
| Python | Ruff, `ruff format`, pytest-testmon | mypy, pyright | pytest | import-linter | radon, Ruff `C901` |
| Java / Kotlin | Checkstyle, detekt, google-java-format, ktlint | compiler | JUnit | ArchUnit | PMD, detekt complexity |

### JS / TS file names

Use the pattern `{business}.{role}.ts`. The role tells the layer. The boundary reference uses these names.

| Concept | File |
| --- | --- |
| composition | `src/app.main.ts` (entry), `src/app.compose.ts` (`createApp()`) and `src/features/features.manifest.ts`; no other file at the root of `src`: an adapter of the platform (crypto, clock, files) is `core` |
| `core` | `src/core/app.{service}.ts`, for example `app.config.ts`, `app.logger.ts`, `app.server.ts`; the middleware of an `api` in `src/core/{concern}.middleware.ts`; the adapters of the platform in `src/core/{concern}.adapter.ts` (`files.adapter.ts`, `database.adapter.ts`); a full `core` groups them in folders by technical concern (`src/core/logging/logger.adapter.ts`) |
| facade | `src/features/{feature}/{feature}.api.ts`, only when other features use it |
| `presentation` | `*.routes.ts` (the registration that the manifest imports), `*.controller.ts`, `*.request.ts`, `*.command.ts`, `*.page.ts`, `*.component.ts`, `*.card.ts` (`.tsx` in a React `web`) |
| `logic` | `*.service.ts`, `*.policy.ts`, `*.store.ts` |
| `data` | `*.repository.ts`, `*.client.ts` |
| types of a feature, no layer | `*.type.ts`; value objects in `*.value.ts` (only value objects) |
| `shared` | primitives in `src/shared/{topic}.{role}.ts`, with the role of a function as a verb (`numbers.parse.ts`, `text.check.ts`) and `value` only for a value object (`email.value.ts`); other elements in `src/shared/{concern}/{topic}.{role}.ts`; the contracts of the services of `core` in `src/shared/{concern}/{topic}.contract.ts` |

The concept is still the facade. Only the JS / TS file has the name `api`.

### Roles by framework

The roles stay the same. The framework gives their place and how the composition gives the services of `core`. Write them in sections 4 and 5 of the project `AGENTS.md`.

| Role | Express | React | NestJS | Angular |
| --- | --- | --- | --- | --- |
| composition | `app.compose.ts` exports `createApp()` | `app.main.tsx` renders the root; `app.compose.tsx` exports `createApp()`, which makes the router from the manifest and the providers of the services of `core` | `main.ts` and `AppModule` | `main.ts` and `app.config.ts` |
| manifest | `features.manifest.ts` | `features.manifest.ts`: one explicit list of the route objects of react-router, with `lazy` for a page that loads on demand; never a file-based router (no Next.js) | the `imports` of `AppModule` | `app.routes.ts` (`loadComponent`, `loadChildren`) |
| services of `core` | arguments of each registration | a React context for each contract, declared in `shared` with its hook (`use{Service}()`); `core` makes the value and the composition provides it | injection, with tokens in `shared` | `inject()`, with `InjectionToken` in `shared` and providers in `app.config.ts` |
| registration | `{feature}.routes.ts` | `{feature}.routes.tsx`, with the route objects of the feature | the feature module | `{feature}.routes.ts` |
| facade | `{feature}.api.ts` | `{feature}.api.ts` | the `exports` of the feature module | `{feature}.api.ts` |

### Modern style

Use the current major of each framework and its current idioms. Never write the style of an older major, also when it still works.

**Express (5 or later)**

- ES modules and async handlers. Express 5 sends a rejected promise to the error handler of `core`: no `try`/`catch` in a handler only to call `next(error)`, and no wrapper package such as `express-async-errors`.
- `express.json()` with the body limit of `platform`; no `body-parser`. One `express.Router()` for each feature, in its `{feature}.routes.ts`.
- `core` writes its own middleware for CORS, the security headers, the request identifier and the log line: no `cors`, `helmet`, `morgan` or similar package. Each one is in `src/core/{concern}.middleware.ts`, where the shared limits allow the signature of Express (`request, response, next`, and `error` first in the error handler): no lint comment and no exception in `.lint/`. The composition registers the middleware of `core`; it never writes one.
- The platform first: `node:sqlite`, `node:crypto` (`scrypt` with a random salt for a password, `randomUUID`), global `fetch` and `AbortSignal.timeout`.

**React (19 or later), with react-router (7 or later)**

- Function components and hooks only: no class component, no `React.FC`, no `forwardRef` (a `ref` is a prop), no `import React`. Named exports. `StrictMode` in the root.
- The router in data mode: `createBrowserRouter` with the route objects of the manifest. A page gets its data from the `loader` of its route (`useLoaderData`), and changes data with the `action` of its route (`<Form>`, `useActionState`, `useNavigation`): never `useEffect` to fetch data, and no data library.
- The error of a route goes to its `ErrorBoundary`; the not-found page is the route `*`.
- No manual memoization (`useMemo`, `useCallback`, `memo`). A form uses the elements of HTML and their validation attributes, with no form library.
- `layers` checks it: a facade, a `logic` or a `data` file never imports React, and a file of `presentation` never imports `useEffect`, `useLayoutEffect`, `useMemo`, `useCallback` or `memo` (`.lint/boundaries.json`).

In a React `web`, a `.tsx` file only renders: no rule, no check and no conversion. These go into `.ts` files (`logic`, `shared`), which the unit tests prove. The coverage of the `web` includes only `.ts` files; the acceptance tests prove the `.tsx` files. Local state of a component stays in the component; state that pages share goes into a `*.store.ts` (`logic`), with no state library.

## `web`: the visual base

The `front` project of Archetype Web sets the visual base (Halloween D38). A new archetype with a `web` copies it. For now it is the brand of the author of AIDDbot (Halloween D11).

- Pico CSS and the fonts are dependencies, added with the package manager: `@picocss/pico`, and `@fontsource/roboto` for the text, `@fontsource/audiowide` for the headings, `@fontsource/anonymous-pro` for code. The entry file imports them, and the bundler serves them from the project. No CDN, thus the application operates offline. Never copy their files into the project: the `upgrade` slot keeps them current.
- Copy [`theme/theme.css`](./theme/theme.css) (typography and spacing on top of Pico), [`theme/colors.css`](./theme/colors.css) (the `--ab-*` brand tokens for the light and dark themes, mapped to the `--pico-*` variables) and [`theme/custom.css`](./theme/custom.css) (components) into the project as they are, with a copy command of the system (`cp`, `Copy-Item`), and import them after Pico. Never read them to write them again: a rewrite costs tokens and can change them. Never invent other colors: the owner changes the values only in these files.
- Components write semantic HTML with the elements and classes of Pico, so Pico, the theme and the tokens reach every element. No CSS-in-JS, no CSS modules, no component library and no Shadow DOM.
- The theme is in the `data-theme` attribute of the document. The first value comes from `prefers-color-scheme`. The user selection stays in `localStorage`.
- Source of the three files: [`theme/`](./theme/) of this Blueprint. Archetype Web copies them to `projects/front/src/core/styles/`.

## Dependencies: add and upgrade

A project has only the dependencies that this file, the `AGENTS.md` of its archetype or a spec names: the list is closed (Halloween D36). Never add one on your own judgment, such as a UI for the test runner, a second assertion library, or a library for a few lines of code. A need that no named dependency and no module of the platform covers is a decision of a spec: the spec names the dependency and why. A dependency that nobody names breaks a rule of the project: `medium` debt.

The dependencies that this file names for JS / TS on Node:

| Where | Dependencies |
| --- | --- |
| root `devDependencies` | `vite-plus`, `@vitest/coverage-v8`, `@types/node` (for `"types": ["node"]`) |
| `api` with Express | `express`, `@types/express` |
| `web` | `@picocss/pico`, `@fontsource/roboto`, `@fontsource/audiowide`, `@fontsource/anonymous-pro` |
| `web` with React | `react`, `react-dom`, `react-router`, `@vitejs/plugin-react`, `@types/react`, `@types/react-dom` |
| `e2e` with a `web` | `@playwright/test`, `tree-kill` (stops a started project with its children) |

No `typescript`: Vite+ brings it. No `@vitest/ui`: the `start` of an `e2e` with Vitest is the watch mode. No component test library and no DOM emulator: the `.tsx` files have no unit tests. The persistence of an `api` uses `node:sqlite`, a module of the platform. A different framework is in the `AGENTS.md` of its archetype.

Add a dependency only with the package manager's add command, so it resolves the latest release; never write a version by hand. The `upgrade` slot raises every dependency to its latest release, majors included. Each package manager has its own commands: use the one the project uses, never a second one.

| Ecosystem | Package manager | Add | `upgrade` |
| --- | --- | --- | --- |
| JS / TS | npm | `npm install {pkg}` | `npx npm-check-updates@latest -u && npm install`, at the root |
| JS / TS | pnpm | `pnpm add {pkg}` | `pnpm update --latest` |
| JS / TS | Yarn (Berry) | `yarn add {pkg}` | `yarn up "*"` |
| JS / TS | Bun | `bun add {pkg}` | `bun update --latest` |
| JS / TS | Deno | `deno add {pkg}` | `deno outdated --update --latest` |
| Go | Go modules | `go get {pkg}` | `go get -u ./... && go mod tidy` |
| Rust | Cargo | `cargo add {pkg}` | `cargo upgrade --incompatible && cargo update` (cargo-edit) |
| PHP | Composer | `composer require {pkg}` | `composer update -W` (within constraints; raise them with `composer require {pkg}:^{major}`) |
| Python | uv | `uv add {pkg}` | `uv lock --upgrade && uv sync` |
| Python | Poetry | `poetry add {pkg}` | `poetry update` (within constraints; raise them with `poetry add {pkg}@latest`) |
| Java / Kotlin | Maven | edit `pom.xml` after `mvn versions:display-dependency-updates` | `mvn versions:use-latest-releases` |
| Java / Kotlin | Gradle | version catalog entry | `./gradlew versionCatalogUpdate` (version-catalog-update plugin) |
