import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: ["scripts", "mcps/*"],
    reporters: ["default"],
    passWithNoTests: true,
  },
});
