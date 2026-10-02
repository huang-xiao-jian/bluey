import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { EchoTool, EchoInputSchema, EchoOutputSchema, EchoInput } from "./echo";

export function setupMcpServer(): McpServer {
  const server = new McpServer({ name: "bluey-echo", version: "0.1.0" });

  server.registerTool(
    "echo",
    {
      title: "Echo text",
      description: "reflect supplied text unchanged.",
      inputSchema: EchoInputSchema,
      outputSchema: EchoOutputSchema,
    },
    async (input) => {
      const result = await EchoTool.callback(input);

      return {
        content: [{ type: "text", text: result }],
        structuredContent: { text: result },
      };
    },
  );

  return server;
}
