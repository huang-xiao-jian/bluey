import { describe, expect, it } from "vitest";
import { McpHandler } from "./mcp";

describe("McpHandler", () => {
  it("constructs without an external scheduler", () => {
    expect(McpHandler.length).toBe(0);
    expect(new McpHandler()).toBeInstanceOf(McpHandler);
  });
});
