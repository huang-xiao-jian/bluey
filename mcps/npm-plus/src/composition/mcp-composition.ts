import { Container } from "inversify";
import { McpHandler } from "../facade/mcp-handler";
import { InspectExceptionFormatter } from "../facade/report/inspect-exception-formatter";
import { PlainInspectExceptionFormatter } from "../facade/report/plain-inspect-exception-formatter";
import { InspectResultSummarizer } from "../mcp/report/inspect-result-summarizer";
import {
  McpTransportFactory,
  StdioMcpTransportFactory,
} from "../mcp/transport";
import { NPM_PACKAGE_QUALITY_MODULE } from "./npm-package-quality-module";

export function createMcpHandler(): McpHandler {
  const container = new Container({ defaultScope: "Singleton" });
  container.load(NPM_PACKAGE_QUALITY_MODULE);
  container.bind(InspectExceptionFormatter).to(PlainInspectExceptionFormatter);
  container.bind(InspectResultSummarizer).toSelf();
  container.bind(McpTransportFactory).to(StdioMcpTransportFactory);
  container.bind(McpHandler).toSelf();
  return container.get(McpHandler);
}
