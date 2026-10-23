import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createLinkCheckWorkflowScheduler } from "../composition/link-check-composition";
import { setupMcpServer } from "../mcp/server";

export class McpHandler {
  private readonly scheduler = createLinkCheckWorkflowScheduler();

  public async run(): Promise<void> {
    const server = setupMcpServer(this.scheduler);

    await server.connect(new StdioServerTransport());
  }
}
