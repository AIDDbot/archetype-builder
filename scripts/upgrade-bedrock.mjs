// Keeps each bedrock current: the latest dependencies, and a green check.
// Usage: node scripts/upgrade-bedrock.mjs [cli|web]
import { readdirSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";

const bedrocks = join(import.meta.dirname, "..", "bedrock");

const run = (command, cwd) => {
  console.log(`> ${command}`);
  execSync(command, { cwd, stdio: "inherit" });
};

const upgrade = (name) => {
  const folder = join(bedrocks, name);
  console.log(`\n# bedrock/${name}`);
  run("npx npm-check-updates@latest -u --workspaces --root", folder);
  // A bedrock lives inside the Builder repository: `prepare` would point its Git hooks at the bedrock.
  run("npm install --ignore-scripts", folder);
  run("npm run check", folder);
  run("npm test", folder);
};

const requested = process.argv[2];
const names = requested ? [requested] : readdirSync(bedrocks);
for (const name of names) upgrade(name);
