import { defineConfig } from "vite-plus";

export default defineConfig({
  test: {
    name: "e2e",
    include: [],
    passWithNoTests: true,
  },
});
