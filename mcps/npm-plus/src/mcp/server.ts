import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  InspectTargetException,
  InspectTargetExceptionCode,
} from "../core/errors/inspect-target-exception";
import type { InspectNpmPackageQualityWorkflow } from "../core/workflow/inspect-npm-package-quality-workflow-scheduler";
import {
  InspectDelegateException,
  InspectDelegationInterpreter,
} from "../facade/inspect-delegation-interpreter";
import { InspectExceptionFormatter } from "../facade/report/inspect-exception-formatter";
import { InspectResultSummarizer } from "./report/inspect-result-summarizer";
import { createInspectNpmPackageTool } from "./tools/inspect-npm-package";

export function setupMcpServer(
  scheduler: InspectNpmPackageQualityWorkflow,
  summarizer: InspectResultSummarizer,
  delegationInterpreter: InspectDelegationInterpreter,
  exceptionFormatter: InspectExceptionFormatter,
): McpServer {
  const server = new McpServer({ name: "bluey-npm-plus", version: "0.1.0" });
  const tool = createInspectNpmPackageTool(
    scheduler,
    summarizer,
    delegationInterpreter,
  );

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
        const exception =
          error instanceof InspectDelegateException ||
          error instanceof InspectTargetException
            ? error
            : new InspectTargetException(
                InspectTargetExceptionCode.InspectTargetDeterminationFailed,
                `执行 npm package 检查时发生异常：${error instanceof Error ? error.message : String(error)}`,
              );
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: exceptionFormatter.format(exception),
            },
          ],
        };
      }
    },
  );

  return server;
}
