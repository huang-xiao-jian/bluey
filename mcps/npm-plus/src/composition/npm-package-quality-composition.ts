import { NpmPackageRegistry } from "../core/ports/npm-package-registry";
import { DependencyScaleQualityInspector } from "../core/quality/dependency-scale-quality-inspector";
import { InspectTargetQualityInspector } from "../core/quality/inspect-target-quality-inspector";
import { QualityDimensionFailureRecorder } from "../core/quality/quality-dimension-failure-recorder";
import { InspectTargetDeterminer } from "../core/target/inspect-target-determiner";
import { InspectNpmPackageQualityWorkflowScheduler } from "../core/workflow/inspect-npm-package-quality-workflow-scheduler";
import { NodeNpmPackageRegistry } from "../infrastructure/registry/node-npm-package-registry";

export class NpmPackageQualityComposition {
  public constructor(
    private readonly registry: NpmPackageRegistry = new NodeNpmPackageRegistry(),
  ) {}

  public createWorkflowScheduler(): InspectNpmPackageQualityWorkflowScheduler {
    const targetDeterminer = new InspectTargetDeterminer(this.registry);
    const qualityInspector = new InspectTargetQualityInspector(
      new DependencyScaleQualityInspector(),
      new QualityDimensionFailureRecorder(),
    );
    return new InspectNpmPackageQualityWorkflowScheduler(
      targetDeterminer,
      qualityInspector,
    );
  }
}
