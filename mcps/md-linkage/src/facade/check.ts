import { resolve } from "node:path";
import {
  LinkCheckDelegation,
  LinkCheckMode,
} from "../core/model/link-check-delegation";
import type { LinkCheckReport } from "../core/model/link-check-report";
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
  readonly stderr: (text: string) => void;
}

export class CheckHandler {
  public constructor(private readonly dependencies: CheckHandlerDependencies) {}

  public async run(
    files: readonly string[],
    options: CheckOptions,
  ): Promise<number> {
    try {
      const root = resolve(
        this.dependencies.cwd(),
        options.root ?? this.dependencies.cwd(),
      );
      const delegation = new LinkCheckDelegation(root, files, options.mode);
      const report = await this.dependencies.workflow.run(delegation);
      const output = options.json ? formatJsonReport(report) : formatHumanReport(report);

      this.dependencies.stdout(`${output}\n`);
      return this.hasFindings(report) ? 1 : 0;
    } catch (error) {
      this.dependencies.stderr(`Error: ${this.errorMessage(error)}\n`);
      return 2;
    }
  }

  private hasFindings(report: LinkCheckReport): boolean {
    return report.scope.issues.length > 0 || report.deadLinks.length > 0;
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
