import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { MarkdownLinkage } from "../application/markdown-linkage";
import { setupMcpServer } from "../mcp/server";

export class McpHandler {
  private readonly markdownLinkage = new MarkdownLinkage();

  public async run(): Promise<void> {
    const server = setupMcpServer(this.markdownLinkage);

    await server.connect(new StdioServerTransport());
  }
}
