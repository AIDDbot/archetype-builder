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
- The root `package.json` has `"workspaces": ["projects/*"]`, the identity of the system, `vite-plus` in `devDependencies`, `"prepare": "vp config"` (it installs the hook) and `"test": "vp run -r test"`.
- `.vite-hooks/pre-commit` contains `vp staged`. `vp config` installs the dispatcher, but not this file: write it.
- The root has no `tsconfig.json`. Each project has its own `tsconfig.json`, with `"erasableSyntaxOnly": true`, `"allowImportingTsExtensions": true` and `"types": ["node"]`: Node.js runs the TypeScript files as they are, so a syntax that it cannot erase (such as a parameter property `constructor(public readonly kind)`) fails at run time, not at the type check.
- Each project has its `package.json` with its scripts, its `vite.config.ts` with its Vitest project (`name`, `include`) and its coverage, its `lint/` folder, and a `.gitignore` that anchors its runtime data: the default paths of its settings, such as `/data/`, `/logs/` or `/config.json`.
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
  fmt: { ignorePatterns: ["**/*.md"] },
  lint: {
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
- `test.projects` names the folder of each Vitest project, so that `vp test related` uses the configuration of each project.
- A value that can be missing is checked, never asserted with `!` (`typescript/no-non-null-assertion`).

**Unit tests**

- Vitest, through `vp test`. A test imports from `vite-plus/test`. The `vite.config.ts` of the project includes `src/**/*.test.ts`.
- A unit test proves logic only. It is fast and touches no disk, database, network or process: the acceptance tests prove `data`.
- To fake the disk, the network or the process, the code gets them as an argument (such as `files: { read, write }`), and the test gives a fake. Never `vi.mock` of a module, and never an exception for a test in `lint/`.

**Debt checks**

- `projects/lint/`, next to the projects that use it: copy [`lint/complexity.json`](./lint/complexity.json) (the limits of code, with an override for `*.test.ts`) and [`lint/complexity.tests.json`](./lint/complexity.tests.json) (the limits of tests for all files). The `lint/crap.json` of each project extends `../../lint/complexity.json`, or `../../lint/complexity.tests.json` in an `e2e` project. `projects/lint/` has no `package.json`, so the workspace and Vitest skip it.
- Each project: copy [`lint/dependencies.json`](./lint/dependencies.json) (or [`lint/dependencies.e2e.json`](./lint/dependencies.e2e.json) for the `e2e`) to its `lint/`, and add `lint/layers.json` that extends it. Change the folder map if the project has a different one.
- Each rule is an `error`, so that a check fails with its findings. The configurations turn off the default `correctness` rules: a debt check never reports what the hook reports.
- Oxlint reads the `files` of an override relative to the configuration file. Start each path with `**/` (`**/src/core/**/*.ts`): a path such as `src/core/*.ts` matches nothing from `lint/`, and the check passes with no warning.
- A later override replaces the rule; it does not merge it. Thus each override repeats all of its groups.
- The last override is for the tests: a test can import any layer, but no module of disk, database, network or process (`node:fs`, `node:sqlite`, `node:child_process`, …) and no `*.repository.ts` or `*.client.ts`; and no `vi.mock` or `vi.doMock` (`no-restricted-properties`). Thus "a unit test proves logic only" is a check, not a review.
- Coverage: add `@vitest/coverage-v8` to the root `devDependencies`, next to `vite-plus` and at its Vitest version. In the `vite.config.ts` of the project, `coverage.include` is `src/**/*.ts` without the tests (else a file that no test loads does not count), and `coverage.thresholds` gives 80 for `statements`, `branches`, `functions` and `lines` to `src/core/**` and `src/shared/**`, with `perFile: true` (else a file with no test passes inside the mean of its folder).
- A false alarm of a rule is turned off in the `lint/` configuration of the project, for its files, never with a comment in each place. An import of disk, network or process in a test is never a false alarm.
- Do not write an own boundary checker: the overrides check the imports, and the `layers` run of the core reports a subfolder in a feature.

**Acceptance tests**

- The `e2e` project is a sibling folder. It starts each project with its `start` command and never imports its code: the `**/src/**` group of `lint/dependencies.e2e.json` checks it.
- The settings of each project (its folder, its start command) and its client are in `shared/projects/`. A test gets them from there, never from `core`: `core` is only the life cycle of the suite.
- A test keeps the tag of each requirement that it proves. A later spec adds its tag next to the others; it never replaces the tag of another spec.
- A system with no `web`: Vitest. The `vite.config.ts` of the `e2e` includes `**/*.test.ts`. The requirement tag goes in the title of the test (`"@S0001-R01 …"`): Vitest has no tags.
- A system with a `web`: Playwright, with one browser engine (Chromium). Turn off `no-empty-pattern` for the Playwright fixtures and tests with no fixture (`({}, use)`, `({}, testInfo)`). Never add a false dependency to avoid the rule.

**Arguments of a `cli`**

- `core` reads the arguments with `node:util` `parseArgs` (`strict: true`, `allowPositionals: true`), from the options that each registration gives as data. It never writes an own parser: a hand-written parser goes over the complexity limits again and again (cli-9).
- An error of `parseArgs` (`code` `ERR_PARSE_ARGS_*`) is the `usage` error of `monitoring`. Any other error is a defect of the definitions, and passes as it is.

**Persistence**

- Use `node:sqlite` (`DatabaseSync`) for the database of an `api`, and for the local store of a `cli` when a spec adds one: the foundation of a `cli` has no store (Halloween D35). It is part of Node.js: no dependency to add or upgrade.
- `DATABASE_URL` is the path of the database file. Its default is `./data/app.sqlite`, relative to the project folder.
- Write it in the main dependencies and in the technology rules of the project `AGENTS.md`: the specs never name it.

**Script names**

- The slot names are the script names: `upgrade`, `test`, `test:spec`, `start`, `layers`, `crap`. Use the standard npm names, which run without `run`: `test` and `start`.
- Lint, format and the affected unit tests are no scripts: the hook runs them.
- `test` runs all the tests of the project: `vp test run`. In an `e2e` project, `vp test run --passWithNoTests` (or `playwright test --pass-with-no-tests`), so that the scaffold passes before the first spec.
- In an `e2e` project, `start` is for a human only: with Vitest, the watch mode `vp test --passWithNoTests`, with no UI package; with Playwright, `playwright test --ui`.
- `test:spec` exists only in an `e2e` project. It ends in the filter flag of the runner, because the core adds only the tag (`@S0001-`): `vp test run --passWithNoTests -t` (or `playwright test --pass-with-no-tests --grep`).
- Each debt slot has one script for each check, because the core runs each one also after a failure, and the project registers the list of the parts. `layers` has one check: it is `vp lint -c lint/layers.json`. `crap:complexity` is `vp lint -c lint/crap.json` and, in an `api`, a `web` or a `cli`, `crap:coverage` is `vp test run --coverage`; `crap` runs both for a human.
- `upgrade` raises `vite-plus` and `@vitest/coverage-v8` together: their Vitest must be the same.

**Scaffold commands**

These commands were tested without a terminal (the input is closed). Run them from the repository root. Each one writes only its folder and asks nothing:

| Project | Command | Notes |
| --- | --- | --- |
| system root | `npm init -y --init-type=module && npm install -D vite-plus` | Then write the workspace files above, and run `npm install`: its `prepare` installs the hook. |
| `api` | `mkdir -p projects/back && (cd projects/back && npm init -y --init-type=module)` | Writes only `package.json`. Not tested yet in a Vite+ workspace. |
| `cli` | `mkdir -p projects/cli && (cd projects/cli && npm init -y --init-type=module)` | Writes only `package.json`. Add `bin`. |
| `web` | `npm create vite@latest projects/front -- --template vanilla-ts --no-interactive --no-immediate` | Installs nothing; run `npm install` in the folder. Not tested yet in a Vite+ workspace. |
| `e2e` | `mkdir -p projects/e2e && (cd projects/e2e && npm init -y --init-type=module)` | With a `web`: `npm init playwright@latest projects/e2e -- --quiet --browser=chromium --lang=TypeScript --no-examples --no-browsers`, then `npx playwright install chromium` in the folder. |

Use these commands as they are. Test a different generator in a temporary folder before you write it in the proposal.

| Ecosystem | Hook: lint, format, affected unit tests | Types | Unit tests (inside `test`) | Boundaries (`layers`) | Complexity and coverage (`crap`) |
| --- | --- | --- | --- | --- | --- |
| JS / TS on Node | `vp staged`: `vp check --fix`, `vp test related` | Oxlint `typeCheck` (TypeScript 7); no `tsc` | Vitest (`vp test`) | Oxlint `no-restricted-imports` with `overrides` per folder and file role | Oxlint with a configuration of complexity and size rules only |
| Go | `go vet`, golangci-lint, `gofmt -w`, `go test` of the changed packages | compiler | `go test` | `internal/` + depguard | gocyclo, gocognit |
| Rust | `cargo clippy`, `cargo fmt`, `cargo test` | compiler | `cargo test` | module visibility | `clippy::cognitive_complexity` |
| PHP | PHP_CodeSniffer, `php-cs-fixer fix` | PHPStan, Psalm | PHPUnit, Pest | Deptrac | PHPMD |
| Python | Ruff, `ruff format`, pytest-testmon | mypy, pyright | pytest | import-linter | radon, Ruff `C901` |
| Java / Kotlin | Checkstyle, detekt, google-java-format, ktlint | compiler | JUnit | ArchUnit | PMD, detekt complexity |

### JS / TS file names

Use the pattern `{business}.{role}.ts`. The role tells the layer. The boundary reference uses these names.

| Concept | File |
| --- | --- |
| composition | `src/app.main.ts` (entry), `src/app.compose.ts` (`createApp()`) and `src/features/features.manifest.ts` |
| `core` | `src/core/app.{service}.ts`, for example `app.config.ts`, `app.logger.ts`, `app.server.ts` |
| facade | `src/features/{feature}/{feature}.api.ts`, only when other features use it |
| `presentation` | `*.routes.ts` (the registration that the manifest imports), `*.controller.ts`, `*.request.ts`, `*.command.ts`, `*.page.ts`, `*.component.ts`, `*.card.ts` (or `.vue`) |
| `logic` | `*.service.ts`, `*.policy.ts`, `*.store.ts` |
| `data` | `*.repository.ts`, `*.client.ts` |
| types of a feature, no layer | `*.type.ts`; value objects in `*.value.ts` (only value objects) |
| `shared` | primitives in `src/shared/{topic}.{role}.ts`, with the role of a function as a verb (`numbers.parse.ts`, `text.check.ts`) and `value` only for a value object (`email.value.ts`); other elements in `src/shared/{concern}/{topic}.{role}.ts`; the contracts of the services of `core` in `src/shared/{concern}/{topic}.contract.ts` |

The concept is still the facade. Only the JS / TS file has the name `api`.

### Roles by framework

The roles stay the same. The framework gives their place and how the composition gives the services of `core`. Write them in sections 4 and 5 of the project `AGENTS.md`.

| Role | Express | NestJS | Angular |
| --- | --- | --- | --- |
| composition | `app.compose.ts` exports `createApp()` | `main.ts` and `AppModule` | `main.ts` and `app.config.ts` |
| manifest | `features.manifest.ts` | the `imports` of `AppModule` | `app.routes.ts` (`loadComponent`, `loadChildren`) |
| services of `core` | arguments of each registration | injection, with tokens in `shared` | `inject()`, with `InjectionToken` in `shared` and providers in `app.config.ts` |
| registration | `{feature}.routes.ts` | the feature module | `{feature}.routes.ts` |
| facade | `{feature}.api.ts` | the `exports` of the feature module | `{feature}.api.ts` |

## `web`: the visual base

The `front/` archetype of Archetype Base sets the visual base. A new archetype with a `web` copies it. For now it is the brand of the author of AIDDbot (Halloween D11).

- Pico CSS and the fonts are dependencies, added with the package manager: `@picocss/pico`, and `@fontsource/roboto` for the text, `@fontsource/audiowide` for the headings, `@fontsource/anonymous-pro` for code. The entry file imports them, and the bundler serves them from the project. No CDN, thus the application operates offline. Never copy their files into the project: the `upgrade` slot keeps them current.
- Copy [`theme/theme.css`](./theme/theme.css) (typography and spacing on top of Pico), [`theme/colors.css`](./theme/colors.css) (the `--ab-*` brand tokens for the light and dark themes, mapped to the `--pico-*` variables) and [`theme/custom.css`](./theme/custom.css) (components) into the project as they are, with a copy command of the system (`cp`, `Copy-Item`), and import them after Pico. Never read them to write them again: a rewrite costs tokens and can change them. Never invent other colors: the owner changes the values only in these files.
- Components render in the light DOM: no Shadow DOM, so Pico, the theme and the tokens reach every element. Use Shadow DOM only when the archetype says so.
- The theme is in the `data-theme` attribute of the document. The first value comes from `prefers-color-scheme`. The user selection stays in `localStorage`.
- Source of the three files: `front/src/core/styles/` of [`AIDDbot/archetype-base`](https://github.com/AIDDbot/archetype-base). Keep them equal.

## Dependencies: add and upgrade

A project has only the dependencies that this file, the `AGENTS.md` of its archetype or a spec names: the list is closed (Halloween D36). Never add one on your own judgment, such as a UI for the test runner, a second assertion library, or a library for a few lines of code. A need that no named dependency and no module of the platform covers is a decision of a spec: the spec names the dependency and why. A dependency that nobody names breaks a rule of the project: `medium` debt.

The dependencies that this file names for JS / TS on Node:

| Where | Dependencies |
| --- | --- |
| root `devDependencies` | `vite-plus`, `@vitest/coverage-v8`, `@types/node` (for `"types": ["node"]`), `npm-check-updates` (the `upgrade` slot) |
| `web` | `@picocss/pico`, `@fontsource/roboto`, `@fontsource/audiowide`, `@fontsource/anonymous-pro` |
| `e2e` with a `web` | `@playwright/test` |

No `typescript`: Vite+ brings it. No `@vitest/ui`: the `start` of an `e2e` with Vitest is the watch mode. The framework of a project (such as Express) is in the `AGENTS.md` of its archetype.

Add a dependency only with the package manager's add command, so it resolves the latest release; never write a version by hand. The `upgrade` slot raises every dependency to its latest release, majors included. Each package manager has its own commands: use the one the project uses, never a second one.

| Ecosystem | Package manager | Add | `upgrade` |
| --- | --- | --- | --- |
| JS / TS | npm | `npm install {pkg}` | `npx npm-check-updates -u && npm install` |
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
