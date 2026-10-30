import { describe, expect, it } from "vitest";
import { McpHandler } from "../facade/mcp-handler";
import { createMcpHandler } from "./mcp-composition";

describe("createMcpHandler", () => {
  it("should resolve a fully injected MCP handler", () => {
    expect(createMcpHandler()).toBeInstanceOf(McpHandler);
  });

  it("should create an independent handler for each MCP application", () => {
    expect(createMcpHandler()).not.toBe(createMcpHandler());
  });
});
