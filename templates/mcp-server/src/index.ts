import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({ name: "replace-me", version: "0.1.0" });

server.registerTool(
  "replace_me",
  {
    title: "Replace me",
    description: "Describe the tool's behavior, inputs, and side effects.",
    inputSchema: { value: z.string().min(1).describe("A non-empty input value.") },
  },
  async ({ value }) => ({ content: [{ type: "text", text: value }] }),
);

await server.connect(new StdioServerTransport());
