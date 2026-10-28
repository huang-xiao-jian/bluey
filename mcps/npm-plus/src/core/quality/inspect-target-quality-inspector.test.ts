import { describe, expect, it } from "vitest";
import { InspectTarget } from "../model/inspect-target";
import type { NpmPackageManifest } from "../ports/npm-package-registry";
import {
  type DependencyScaleQualityInspection,
  DependencyScaleQualityInspector,
} from "./dependency-scale-quality-inspector";
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
    );

    await expect(inspector.inspect(target, manifest)).resolves.toEqual({
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
    const failingDimension = {
      inspect() {
        const error = new Error("manifest unavailable");
        error.name = "PackageManifestReadError";
        throw error;
      },
    } satisfies DependencyScaleQualityInspection;
    const inspector = new InspectTargetQualityInspector(
      failingDimension,
      new QualityDimensionFailureRecorder(),
    );

    await expect(inspector.inspect(target, manifest)).resolves.toEqual({
      exceptions: [
        {
          name: "PackageManifestReadError",
          message: "manifest unavailable",
        },
      ],
    });
  });

  it("should serialize an unknown thrown value", async () => {
    const failingDimension = {
      inspect() {
        throw "manifest unavailable";
      },
    } satisfies DependencyScaleQualityInspection;
    const inspector = new InspectTargetQualityInspector(
      failingDimension,
      new QualityDimensionFailureRecorder(),
    );

    await expect(inspector.inspect(target, manifest)).resolves.toEqual({
      exceptions: [{ name: "Error", message: "manifest unavailable" }],
    });
  });
});
