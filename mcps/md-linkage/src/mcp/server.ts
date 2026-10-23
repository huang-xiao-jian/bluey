import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { LinkCheckWorkflowScheduler } from "../core/workflow/link-check-workflow-scheduler";
import { createCheckSpecificationLinksTool } from "./tools/check-specification-links";

export function setupMcpServer(
  scheduler: LinkCheckWorkflowScheduler,
): McpServer {
  const server = new McpServer({ name: "bluey-md-linkage", version: "0.1.0" });
  const tool = createCheckSpecificationLinksTool(scheduler);

  server.registerTool(
    tool.name,
    {
      title: tool.title,
      description: tool.description,
      inputSchema: tool.inputSchema,
      outputSchema: tool.outputSchema,
      annotations: { readOnlyHint: true },
    },
    async (input) => {
      try {
        const result = await tool.callback(input);
        return {
          content: [{ type: "text" as const, text: result.summary }],
          structuredContent: result.report,
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
