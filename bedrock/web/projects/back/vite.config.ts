import { defineConfig } from "vite-plus";

export default defineConfig({
  test: {
    name: "back",
    include: ["src/**/*.test.ts"],
    passWithNoTests: true,
    coverage: {
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/app.main.ts", "src/core/**/*.adapter.ts"],
      thresholds: { lines: 100, functions: 100, perFile: true },
    },
  },
});
