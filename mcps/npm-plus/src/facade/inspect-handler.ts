import { InspectDelegation } from "../core/model/inspect-delegation";
import { isUnsupportedVersionRange } from "../core/target/package-version-identifier-interpreter";
import type { InspectNpmPackageQualityWorkflow } from "../core/workflow/inspect-npm-package-quality-workflow-scheduler";
import type { InspectResult } from "./inspect-result";
import { InspectReportFormatter } from "./report/inspect-report-formatter";

export interface InspectOptions {
  readonly json?: boolean;
}

export class InspectInputError extends Error {
  public override name: string = "InspectInputError";
}

export class UnsupportedVersionRangeError extends InspectInputError {
  public override name = "UnsupportedVersionRangeError";

  public constructor(versionIdentifier: string) {
    super(`Version ranges are not supported: ${versionIdentifier}`);
  }
}

export class InspectHandler {
  public constructor(
    private readonly scheduler: InspectNpmPackageQualityWorkflow,
    private readonly stdout: (text: string) => void,
    private readonly formatter = new InspectReportFormatter(),
  ) {}

  public async run(
    packageName: string,
    versionIdentifier: string | undefined,
    options: InspectOptions,
  ): Promise<void> {
    if (!packageName.trim()) throw new InspectInputError("Package name is required");
    if (versionIdentifier !== undefined && !versionIdentifier.trim()) {
      throw new InspectInputError("Version identifier must not be empty");
    }
    if (
      versionIdentifier !== undefined &&
      isUnsupportedVersionRange(versionIdentifier)
    ) {
      throw new UnsupportedVersionRangeError(versionIdentifier);
    }

    const delegation = new InspectDelegation(packageName, versionIdentifier);
    const workflowResult = await this.scheduler.run(delegation);
    const result: InspectResult = { delegation, ...workflowResult };
    this.stdout(
      options.json
        ? this.formatter.formatJson(result)
        : this.formatter.formatHuman(result),
    );
  }
}
