import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { injectable } from "inversify";
import type { InspectNpmPackageQualityWorkflow } from "../core/workflow/inspect-npm-package-quality-workflow-scheduler";
import { createInspectNpmPackageTool } from "./tools/inspect-npm-package";

export abstract class NpmPlusMcpServerFactory {
  public abstract create(workflow: InspectNpmPackageQualityWorkflow): McpServer;
}

@injectable()
export class DefaultNpmPlusMcpServerFactory extends NpmPlusMcpServerFactory {
  public create(workflow: InspectNpmPackageQualityWorkflow): McpServer {
    return setupMcpServer(workflow);
  }
}

export function setupMcpServer(
  scheduler: InspectNpmPackageQualityWorkflow,
): McpServer {
  const server = new McpServer({ name: "bluey-npm-plus", version: "0.1.0" });
  const tool = createInspectNpmPackageTool(scheduler);

  server.registerTool(
    tool.name,
    {
      title: tool.title,
      description: tool.description,
      inputSchema: tool.inputSchema,
      outputSchema: tool.outputSchema,
      annotations: tool.annotations,
    },
    async (input) => {
      try {
        const result = await tool.callback(input);
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
