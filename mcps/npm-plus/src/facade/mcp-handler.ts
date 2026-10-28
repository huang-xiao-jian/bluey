import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { NpmPackageQualityComposition } from "../composition/npm-package-quality-composition";
import { setupMcpServer } from "../mcp/server";

export class McpHandler {
  public constructor(
    private readonly composition: NpmPackageQualityComposition,
  ) {}

  public async run(): Promise<void> {
    const server = setupMcpServer(this.composition.createWorkflowScheduler());
    await server.connect(new StdioServerTransport());
  }
}

export function createMcpHandler(): McpHandler {
  return new McpHandler(new NpmPackageQualityComposition());
}
