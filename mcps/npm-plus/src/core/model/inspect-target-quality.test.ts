import { describe, expect, it } from "vitest";
import { InspectTarget } from "./inspect-target";
import {
  InspectTargetDependencyScaleQuality,
  InspectTargetQuality,
  InspectTargetQualityException,
} from "./inspect-target-quality";

describe("npm inspection domain objects", () => {
  it("should preserve an optional tag on the inspect target", () => {
    expect(
      JSON.parse(JSON.stringify(new InspectTarget("example-package", "1.2.3"))),
    ).toEqual({
      packageName: "example-package",
      exactVersion: "1.2.3",
    });
    expect(new InspectTarget("example-package", "1.2.3", "stable").tag).toBe(
      "stable",
    );
  });

  it("should preserve the public quality serialization shape", () => {
    const dependencyScale = new InspectTargetDependencyScaleQuality([], {
      runtimeCount: 0,
      optionalCount: 0,
      peerCount: 0,
      bundledCount: 0,
    });
    const quality = new InspectTargetQuality(dependencyScale, [
      new InspectTargetQualityException("ExampleError", "example"),
    ]);

    expect(JSON.parse(JSON.stringify(quality))).toEqual({
      dependencyScale: {
        directDependencyDeclarations: [],
        directDependencyCounts: {
          runtimeCount: 0,
          optionalCount: 0,
          peerCount: 0,
          bundledCount: 0,
        },
      },
      exceptions: [{ name: "ExampleError", message: "example" }],
    });
  });
});
