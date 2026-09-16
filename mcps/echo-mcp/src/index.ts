import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

export const server = new McpServer({ name: "bluey-echo", version: "0.1.0" });

server.registerTool(
  "echo",
  {
    title: "Echo text",
    description: "Returns supplied text unchanged. This tool has no side effects.",
    inputSchema: {
      text: z.string().min(1).max(4_000).describe("Text to return unchanged."),
    },
  },
  async ({ text }) => ({ content: [{ type: "text", text }] }),
);

if (import.meta.url === `file://${process.argv[1]}`) {
  await server.connect(new StdioServerTransport());
}
