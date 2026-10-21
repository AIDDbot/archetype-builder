import { defineConfig, devices } from "@playwright/test";

const chromium = devices["Desktop Chrome"];

export default defineConfig({
  testDir: "./features",
  fullyParallel: true,
  projects: [{ name: "chromium", use: chromium }],
});
