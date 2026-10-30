import { injectable } from "inversify";
import { InspectNpmPackageQualityWorkflowScheduler } from "../core/workflow/inspect-npm-package-quality-workflow-scheduler";
import { NpmPlusMcpServerFactory } from "../mcp/server";
import { McpTransportFactory } from "../mcp/transport";

@injectable()
export class McpHandler {
  public constructor(
    private readonly scheduler: InspectNpmPackageQualityWorkflowScheduler,
    private readonly serverFactory: NpmPlusMcpServerFactory,
    private readonly transportFactory: McpTransportFactory,
  ) {}

  public async run(): Promise<void> {
    const server = this.serverFactory.create(this.scheduler);
    await server.connect(this.transportFactory.create());
  }
}
