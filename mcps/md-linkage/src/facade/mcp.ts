import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { LinkCheckWorkflowScheduler } from "../core/workflow/link-check-workflow-scheduler";
import { setupMcpServer } from "../mcp/server";

export class McpHandler {
  public constructor(
    private readonly workflow: Pick<LinkCheckWorkflowScheduler, "run">,
  ) {}

  public async run(): Promise<void> {
    const server = setupMcpServer(this.workflow);
    await server.connect(new StdioServerTransport());
  }
}
