import { injectable } from "inversify";
import { InspectNpmPackageQualityWorkflowScheduler } from "../core/workflow/inspect-npm-package-quality-workflow-scheduler";
import { InspectResultSummarizer } from "../mcp/report/inspect-result-summarizer";
import { setupMcpServer } from "../mcp/server";
import { McpTransportFactory } from "../mcp/transport";
import { InspectDelegationInterpreter } from "./inspect-delegation-interpreter";
import { InspectExceptionFormatter } from "./report/inspect-exception-formatter";

@injectable()
export class McpHandler {
  public constructor(
    private readonly scheduler: InspectNpmPackageQualityWorkflowScheduler,
    private readonly summarizer: InspectResultSummarizer,
    private readonly delegationInterpreter: InspectDelegationInterpreter,
    private readonly exceptionFormatter: InspectExceptionFormatter,
    private readonly transportFactory: McpTransportFactory,
  ) {}

  public async run(): Promise<void> {
    const server = setupMcpServer(
      this.scheduler,
      this.summarizer,
      this.delegationInterpreter,
      this.exceptionFormatter,
    );
    await server.connect(this.transportFactory.create());
  }
}
