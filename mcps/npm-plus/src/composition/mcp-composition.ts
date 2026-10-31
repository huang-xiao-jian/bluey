import { Container } from "inversify";
import { McpHandler } from "../facade/mcp-handler";
import { InspectExceptionFormatter } from "../facade/report/inspect-exception-formatter";
import { PlainInspectExceptionFormatter } from "../facade/report/plain-inspect-exception-formatter";
import { NodeNpmPackageRegistry } from "../infrastructure/registry/node-npm-package-registry";
import { InspectResultSummarizer } from "../mcp/report/inspect-result-summarizer";
import {
  McpTransportFactory,
  StdioMcpTransportFactory,
} from "../mcp/transport";
import { provideNpmPackageQualityModule } from "./npm-package-quality-module";

export function createMcpHandler(): McpHandler {
  const container = new Container({ defaultScope: "Singleton" });
  const registry = new NodeNpmPackageRegistry(
    globalThis.fetch,
    process.env.NPM_CONFIG_REGISTRY ?? "https://registry.npmjs.org",
  );
  container.load(provideNpmPackageQualityModule(registry));
  container.bind(InspectExceptionFormatter).to(PlainInspectExceptionFormatter);
  container.bind(InspectResultSummarizer).toSelf();
  container.bind(McpTransportFactory).to(StdioMcpTransportFactory);
  container.bind(McpHandler).toSelf();
  return container.get(McpHandler);
}
