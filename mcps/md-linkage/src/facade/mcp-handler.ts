import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Container, injectable } from "inversify";
import { LinkCheckComposition } from "../composition/link-check-composition";
import { setupMcpServer } from "../mcp/server";

@injectable()
export class McpHandler {
  public constructor(private readonly composition: LinkCheckComposition) {}

  public async run(): Promise<void> {
    const scheduler = this.composition.createLinkCheckWorkflowScheduler();
    const server = setupMcpServer(scheduler);

    await server.connect(new StdioServerTransport());
  }
}

export function createMcpHandler(): McpHandler {
  const container = new Container({
    defaultScope: "Singleton",
  });

  container.bind(McpHandler).toSelf();
  container.bind(LinkCheckComposition).toSelf();

  return container.get(McpHandler);
}
