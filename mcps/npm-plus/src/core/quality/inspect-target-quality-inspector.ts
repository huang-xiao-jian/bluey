import { injectable } from "inversify";
import type { InspectTarget } from "../model/inspect-target";
import type { InspectTargetQuality } from "../model/inspect-target-quality";
import type { NpmPackageManifest } from "../ports/npm-package-registry";
import { DependencyScaleQualityInspector } from "./dependency-scale-quality-inspector";
import { InspectTargetQualityFabricator } from "./inspect-target-quality-fabricator";
import { QualityDimensionFailureRecorder } from "./quality-dimension-failure-recorder";

@injectable()
export class InspectTargetQualityInspector {
  public constructor(
    private readonly dependencyScaleInspector: DependencyScaleQualityInspector,
    private readonly failureRecorder: QualityDimensionFailureRecorder,
    private readonly fabricator: InspectTargetQualityFabricator,
  ) {}

  public async inspect(
    target: InspectTarget,
    manifest: NpmPackageManifest,
  ): Promise<InspectTargetQuality> {
    try {
      const scale = this.dependencyScaleInspector.inspect(target, manifest);
      return this.fabricator.fabricate(scale, []);
    } catch (error) {
      return this.fabricator.fabricate(undefined, [
        this.failureRecorder.record(error),
      ]);
    }
  }
}
