import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { EchoTool, EchoInput } from "./tools/echo";

export function setupMcpServer(): McpServer {
  const server = new McpServer({ name: "bluey-echo", version: "0.1.0" });

  server.registerTool(
    EchoTool.name,
    {
      title: EchoTool.title,
      description: EchoTool.description,
      inputSchema: EchoTool.inputSchema,
      outputSchema: EchoTool.outputSchema,
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
