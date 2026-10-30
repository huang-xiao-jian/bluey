import { Container } from "inversify";
import { McpHandler } from "../facade/mcp-handler";
import {
  DefaultNpmPlusMcpServerFactory,
  NpmPlusMcpServerFactory,
} from "../mcp/server";
import { InspectResultSummarizer } from "../mcp/report/inspect-result-summarizer";
import { McpTransportFactory, StdioMcpTransportFactory } from "../mcp/transport";
import { npmPackageQualityModule } from "./npm-package-quality-module";

export function createMcpHandler(): McpHandler {
  const container = new Container({ defaultScope: "Singleton" });
  container.load(npmPackageQualityModule);
  container.bind(InspectResultSummarizer).toSelf();
  container.bind(NpmPlusMcpServerFactory).to(DefaultNpmPlusMcpServerFactory);
  container.bind(McpTransportFactory).to(StdioMcpTransportFactory);
  container.bind(McpHandler).toSelf();
  return container.get(McpHandler);
}
