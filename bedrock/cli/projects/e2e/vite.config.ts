import { defineConfig } from "vite-plus";

export default defineConfig({
  test: {
    name: "e2e",
    include: ["features/**/*.test.ts"],
    passWithNoTests: true,
  },
});
