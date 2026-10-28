import { describe, expect, it } from "vitest";
import { createMcpHandler, McpHandler } from "./mcp-handler";

describe("McpHandler", () => {
  it("should resolve from the application dependency graph", () => {
    expect(createMcpHandler()).toBeInstanceOf(McpHandler);
  });
});
