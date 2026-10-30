import { injectable } from "inversify";
import { InspectDelegation } from "../core/model/inspect-delegation";
import { isUnsupportedVersionRange } from "../core/target/package-version-identifier-interpreter";
import { InspectNpmPackageQualityWorkflowScheduler } from "../core/workflow/inspect-npm-package-quality-workflow-scheduler";
import type { InspectResult } from "./inspect-result";
import { InspectResultFormatterPicker } from "./report/inspect-result-formatter-picker";

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
    private readonly formatterPicker: InspectResultFormatterPicker,
    private readonly dependencies: InspectHandlerDependencies,
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
    const formatter = this.formatterPicker.pick(options.json === true);
    this.dependencies.stdout(formatter.format(result));
  }
}
