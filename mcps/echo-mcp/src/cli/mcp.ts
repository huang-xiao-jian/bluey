import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio";
import { setupMcpServer } from "../mcp/server";

export class McpHandler {
  async run() {
    const server = setupMcpServer();
    const transport = new StdioServerTransport();

    await server.connect(transport);
  }
}
