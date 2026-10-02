import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: ["mcps/*"],
    reporters: ["default"],
    passWithNoTests: true,
  },
});
