import { ContainerModule } from "inversify";
import { NpmPackageRegistry } from "../core/ports/npm-package-registry";
import { DependencyScaleQualityInspector } from "../core/quality/dependency-scale-quality-inspector";
import { InspectTargetQualityFabricator } from "../core/quality/inspect-target-quality-fabricator";
import { InspectTargetQualityInspector } from "../core/quality/inspect-target-quality-inspector";
import { QualityDimensionFailureRecorder } from "../core/quality/quality-dimension-failure-recorder";
import { InspectTargetDeterminer } from "../core/target/inspect-target-determiner";
import { InspectNpmPackageQualityWorkflowScheduler } from "../core/workflow/inspect-npm-package-quality-workflow-scheduler";
import { NodeNpmPackageRegistry } from "../infrastructure/registry/node-npm-package-registry";

export const npmPackageQualityModule = new ContainerModule(({ bind }) => {
  bind(NpmPackageRegistry).to(NodeNpmPackageRegistry).inSingletonScope();
  bind(InspectTargetDeterminer).toSelf().inSingletonScope();
  bind(DependencyScaleQualityInspector).toSelf().inSingletonScope();
  bind(QualityDimensionFailureRecorder).toSelf().inSingletonScope();
  bind(InspectTargetQualityFabricator).toSelf().inSingletonScope();
  bind(InspectTargetQualityInspector).toSelf().inSingletonScope();
  bind(InspectNpmPackageQualityWorkflowScheduler).toSelf().inSingletonScope();
});
