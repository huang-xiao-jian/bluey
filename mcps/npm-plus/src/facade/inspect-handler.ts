import { injectable } from "inversify";
import { InspectDelegation } from "../core/model/inspect-delegation";
import { InspectNpmPackageQualityWorkflowScheduler } from "../core/workflow/inspect-npm-package-quality-workflow-scheduler";
import type { InspectResult } from "./inspect-result";
import { InspectReportFormatter } from "./report/inspect-report-formatter";

export interface InspectOptions {
  readonly json?: boolean;
}

export class InspectInputError extends Error {
  public override name: string = "InspectInputError";
}

export abstract class InspectHandlerDependencies {
  public abstract stdout(text: string): void;
}

@injectable()
export class NodeInspectHandlerDependencies extends InspectHandlerDependencies {
  public stdout(text: string): void {
    process.stdout.write(text);
  }
}

@injectable()
export class InspectHandler {
  public constructor(
    private readonly scheduler: InspectNpmPackageQualityWorkflowScheduler,
    private readonly formatter: InspectReportFormatter,
    private readonly dependencies: InspectHandlerDependencies,
  ) {}

  public async run(
    packageName: string,
    options: InspectOptions,
  ): Promise<void> {
    if (!packageName.trim()) throw new InspectInputError("Package name is required");

    const delegation = new InspectDelegation(packageName);
    const workflowResult = await this.scheduler.run(delegation);
    const result: InspectResult = { delegation, ...workflowResult };
    this.dependencies.stdout(
      options.json
        ? this.formatter.formatJson(result)
        : this.formatter.formatHuman(result),
    );
  }
}
