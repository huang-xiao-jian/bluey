import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("echo MCP package", () => {
  it("produces an executable build output", () => {
    expect(existsSync(new URL("../dist/index.mjs", import.meta.url))).toBe(true);
  });
});
