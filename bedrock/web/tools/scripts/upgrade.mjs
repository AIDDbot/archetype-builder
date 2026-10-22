// Each dependency of the root and of each project to its latest version, majors included, and the browser of Playwright.
import { runAll } from "./shell.mjs";

const commands = [
  "npx npm-check-updates@latest -u --workspaces --root",
  "npm install",
  "npm exec -w e2e -- playwright install chromium",
];

process.exitCode = runAll(commands) ? 0 : 1;
