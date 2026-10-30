import { injectable } from "inversify";
import type { InspectDelegation } from "../model/inspect-delegation";
import type { InspectTarget } from "../model/inspect-target";
import type { InspectTargetQuality } from "../model/inspect-target-quality";
import { InspectTargetQualityInspector } from "../quality/inspect-target-quality-inspector";
import { InspectTargetDeterminer } from "../target/inspect-target-determiner";

export interface InspectNpmPackageQualityWorkflowResult {
  readonly target: InspectTarget;
  readonly quality: InspectTargetQuality;
}

export interface InspectNpmPackageQualityWorkflow {
  run(
    delegation: InspectDelegation,
  ): Promise<InspectNpmPackageQualityWorkflowResult>;
}

@injectable()
export class InspectNpmPackageQualityWorkflowScheduler
  implements InspectNpmPackageQualityWorkflow
{
  public constructor(
    private readonly targetDeterminer: InspectTargetDeterminer,
    private readonly qualityInspector: InspectTargetQualityInspector,
  ) {}

  public async run(
    delegation: InspectDelegation,
  ): Promise<InspectNpmPackageQualityWorkflowResult> {
    const { target, manifest } =
      await this.targetDeterminer.determine(delegation);
    const quality = await this.qualityInspector.inspect(target, manifest);
    return { target, quality };
  }
}
