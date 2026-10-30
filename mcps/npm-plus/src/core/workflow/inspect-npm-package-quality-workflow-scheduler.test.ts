import { describe, expect, it } from "vitest";
import { InspectDelegation } from "../model/inspect-delegation";
import { InspectTarget } from "../model/inspect-target";
import {
  DirectDependencyKind,
  InspectTargetQuality,
} from "../model/inspect-target-quality";
import {
  NpmPackageRegistry,
  type NpmPackageManifestResolution,
} from "../ports/npm-package-registry";
import { DependencyScaleQualityInspector } from "../quality/dependency-scale-quality-inspector";
import { InspectTargetQualityFabricator } from "../quality/inspect-target-quality-fabricator";
import { InspectTargetQualityInspector } from "../quality/inspect-target-quality-inspector";
import { QualityDimensionFailureRecorder } from "../quality/quality-dimension-failure-recorder";
import { InspectTargetDeterminer } from "../target/inspect-target-determiner";
import { InspectNpmPackageQualityWorkflowScheduler } from "./inspect-npm-package-quality-workflow-scheduler";

const delegation = new InspectDelegation("example-package");

class StubRegistry extends NpmPackageRegistry {
  public constructor(
    private readonly resolution: NpmPackageManifestResolution | Error,
  ) {
    super();
  }

  public override async readLatestManifest(
    packageName: string,
  ): Promise<NpmPackageManifestResolution> {
    if (packageName !== "example-package") throw new Error("unexpected package");
    if (this.resolution instanceof Error) throw this.resolution;
    return this.resolution;
  }
}

describe("InspectNpmPackageQualityWorkflowScheduler", () => {
  it("should inspect the manifest resolved for the delegated package", async () => {
    const scheduler = new InspectNpmPackageQualityWorkflowScheduler(
      new InspectTargetDeterminer(
        new StubRegistry({
          exactVersion: "1.0.0",
          manifest: {
            name: "example-package",
            version: "1.0.0",
            dependencies: { helper: "^2.0.0" },
          },
        }),
      ),
      new InspectTargetQualityInspector(
        new DependencyScaleQualityInspector(),
        new QualityDimensionFailureRecorder(),
        new InspectTargetQualityFabricator(),
      ),
    );

    const result = await scheduler.run(delegation);

    expect(result.target).toBeInstanceOf(InspectTarget);
    expect(result.quality).toBeInstanceOf(InspectTargetQuality);
    expect(result).toEqual({
      target: {
        packageName: "example-package",
        exactVersion: "1.0.0",
        tag: "latest",
      },
      quality: {
        dependencyScale: {
          directDependencyDeclarations: [
            {
              packageName: "helper",
              kind: DirectDependencyKind.Runtime,
              declaredRange: "^2.0.0",
              bundled: false,
            },
          ],
          directDependencyCounts: {
            runtimeCount: 1,
            optionalCount: 0,
            peerCount: 0,
            bundledCount: 0,
          },
        },
        exceptions: [],
      },
    });
  });

  it("should propagate target errors without inspecting quality", async () => {
    const targetError = new Error("target unavailable");
    let inspectionStarted = false;
    class UnexpectedQualityInspector extends InspectTargetQualityInspector {
      public override async inspect(): Promise<never> {
        inspectionStarted = true;
        throw new Error("quality inspection must not run");
      }
    }
    const scheduler = new InspectNpmPackageQualityWorkflowScheduler(
      new InspectTargetDeterminer(new StubRegistry(targetError)),
      new UnexpectedQualityInspector(
        new DependencyScaleQualityInspector(),
        new QualityDimensionFailureRecorder(),
        new InspectTargetQualityFabricator(),
      ),
    );

    await expect(scheduler.run(delegation)).rejects.toBe(targetError);
    expect(inspectionStarted).toBe(false);
  });
});
