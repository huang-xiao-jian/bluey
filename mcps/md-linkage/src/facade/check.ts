import { resolve } from "node:path";
import {
  LinkCheckDelegation,
  LinkCheckMode,
} from "../core/model/link-check-delegation";
import type { LinkCheckWorkflowScheduler } from "../core/workflow/link-check-workflow-scheduler";
import { formatHumanReport, formatJsonReport } from "./report-formatter";

export interface CheckOptions {
  readonly root?: string;
  readonly mode?: LinkCheckMode;
  readonly json?: boolean;
}

export interface CheckHandlerDependencies {
  workflow: Pick<LinkCheckWorkflowScheduler, "run">;
  readonly cwd: () => string;
  readonly stdout: (text: string) => void;
}

export class CheckHandler {
  public constructor(private readonly dependencies: CheckHandlerDependencies) {}

  public async run(
    files: readonly string[],
    options: CheckOptions,
  ): Promise<void> {
    const root = resolve(
      this.dependencies.cwd(),
      options.root ?? this.dependencies.cwd(),
    );
    const delegation = new LinkCheckDelegation(root, files, options.mode);
    const report = await this.dependencies.workflow.run(delegation);
    const output = options.json ? formatJsonReport(report) : formatHumanReport(report);

    this.dependencies.stdout(`${output}\n`);
  }
}
