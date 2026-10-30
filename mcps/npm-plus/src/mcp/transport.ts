import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import { injectable } from "inversify";

export abstract class McpTransportFactory {
  public abstract create(): Transport;
}

@injectable()
export class StdioMcpTransportFactory extends McpTransportFactory {
  public create(): Transport {
    return new StdioServerTransport();
  }
}
