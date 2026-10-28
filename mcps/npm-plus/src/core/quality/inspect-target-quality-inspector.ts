import { injectable } from "inversify";
import type { InspectTarget } from "../model/inspect-target";
import type { InspectTargetQuality } from "../model/inspect-target-quality";
import type { NpmPackageManifest } from "../ports/npm-package-registry";
import type { DependencyScaleQualityInspection } from "./dependency-scale-quality-inspector";
import { QualityDimensionFailureRecorder } from "./quality-dimension-failure-recorder";

export interface InspectTargetQualityInspection {
  inspect(
    target: InspectTarget,
    manifest: NpmPackageManifest,
  ): Promise<InspectTargetQuality>;
}

@injectable()
export class InspectTargetQualityInspector
  implements InspectTargetQualityInspection
{
  public constructor(
    private readonly dependencyScaleInspector: DependencyScaleQualityInspection,
    private readonly failureRecorder: QualityDimensionFailureRecorder,
  ) {}

  public async inspect(
    _target: InspectTarget,
    manifest: NpmPackageManifest,
  ): Promise<InspectTargetQuality> {
    try {
      return {
        dependencyScale: this.dependencyScaleInspector.inspect(manifest),
        exceptions: [],
      };
    } catch (error) {
      return { exceptions: [this.failureRecorder.record(error)] };
    }
  }
}
