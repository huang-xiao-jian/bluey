import { describe, expect, it } from "vitest";
import { InspectTarget } from "../model/inspect-target";
import {
  InspectTargetDependencyScaleQuality,
  InspectTargetQuality,
  InspectTargetQualityException,
} from "../model/inspect-target-quality";
import type { NpmPackageManifest } from "../ports/npm-package-registry";
import { DependencyScaleQualityInspector } from "./dependency-scale-quality-inspector";
import { InspectTargetQualityFabricator } from "./inspect-target-quality-fabricator";
import { InspectTargetQualityInspector } from "./inspect-target-quality-inspector";
import { QualityDimensionFailureRecorder } from "./quality-dimension-failure-recorder";

const target = new InspectTarget("example-package", "1.0.0");
const manifest: NpmPackageManifest = {
  name: "example-package",
  version: "1.0.0",
};

describe("InspectTargetQualityInspector", () => {
  it("should retain successful dependency-scale quality", async () => {
    const inspector = new InspectTargetQualityInspector(
      new DependencyScaleQualityInspector(),
      new QualityDimensionFailureRecorder(),
      new InspectTargetQualityFabricator(),
    );

    const result = await inspector.inspect(target, manifest);

    expect(result).toBeInstanceOf(InspectTargetQuality);
    expect(result.dependencyScale).toBeInstanceOf(
      InspectTargetDependencyScaleQuality,
    );
    expect(result).toEqual({
      dependencyScale: {
        directDependencyDeclarations: [],
        directDependencyCounts: {
          runtimeCount: 0,
          optionalCount: 0,
          peerCount: 0,
          bundledCount: 0,
        },
      },
      exceptions: [],
    });
  });

  it("should convert a dimension failure into stable exception data", async () => {
    class FailingDependencyScaleQualityInspector extends DependencyScaleQualityInspector {
      public override inspect(): never {
        const error = new Error("manifest unavailable");
        error.name = "PackageManifestReadError";
        throw error;
      }
    }
    const inspector = new InspectTargetQualityInspector(
      new FailingDependencyScaleQualityInspector(),
      new QualityDimensionFailureRecorder(),
      new InspectTargetQualityFabricator(),
    );

    const result = await inspector.inspect(target, manifest);

    expect(result).toBeInstanceOf(InspectTargetQuality);
    expect(result.exceptions[0]).toBeInstanceOf(InspectTargetQualityException);
    expect(result.dependencyScale).toBeUndefined();
    expect(result).toEqual({
      dependencyScale: undefined,
      exceptions: [
        {
          name: "PackageManifestReadError",
          message: "manifest unavailable",
        },
      ],
    });
  });

  it("should serialize an unknown thrown value", async () => {
    class FailingDependencyScaleQualityInspector extends DependencyScaleQualityInspector {
      public override inspect(): never {
        throw "manifest unavailable";
      }
    }
    const inspector = new InspectTargetQualityInspector(
      new FailingDependencyScaleQualityInspector(),
      new QualityDimensionFailureRecorder(),
      new InspectTargetQualityFabricator(),
    );

    const result = await inspector.inspect(target, manifest);

    expect(result).toBeInstanceOf(InspectTargetQuality);
    expect(result.exceptions[0]).toBeInstanceOf(InspectTargetQualityException);
    expect(result.dependencyScale).toBeUndefined();
    expect(result).toEqual({
      dependencyScale: undefined,
      exceptions: [{ name: "Error", message: "manifest unavailable" }],
    });
  });
});
