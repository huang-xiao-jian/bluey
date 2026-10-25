import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { EchoTool } from "./tools/echo";

export function setupMcpServer(): McpServer {
  const server = new McpServer({ name: "bluey-echo", version: "0.1.0" });

  server.registerTool(
    EchoTool.name,
    {
      title: EchoTool.title,
      description: EchoTool.description,
      inputSchema: EchoTool.inputSchema,
      outputSchema: EchoTool.outputSchema,
      annotations: { readOnlyHint: true },
    },
    async (input) => {
      try {
        const result = await EchoTool.callback(input);

        return {
          content: [{ type: "text" as const, text: result.summary }],
          structuredContent: result.result,
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: error instanceof Error ? error.message : String(error),
            },
          ],
        };
      }
    },
  );

  return server;
}
