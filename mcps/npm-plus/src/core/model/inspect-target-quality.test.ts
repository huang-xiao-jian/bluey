import { describe, expect, it } from "vitest";
import { InspectTarget } from "./inspect-target";
import {
  DirectDependencyKind,
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

  it("should isolate dependency facts from mutable constructor input", () => {
    const declarations = [
      {
        packageName: "runtime-helper",
        kind: DirectDependencyKind.Runtime,
        declaredRange: "^1.0.0",
        bundled: false,
      },
    ];
    const counts = {
      runtimeCount: 1,
      optionalCount: 0,
      peerCount: 0,
      bundledCount: 0,
    };
    const dependencyScale = new InspectTargetDependencyScaleQuality(
      declarations,
      counts,
    );

    declarations.push({
      packageName: "late-mutation",
      kind: DirectDependencyKind.Runtime,
      declaredRange: "^2.0.0",
      bundled: false,
    });
    counts.runtimeCount = 2;

    expect(dependencyScale.directDependencyDeclarations).toHaveLength(1);
    expect(dependencyScale.directDependencyCounts.runtimeCount).toBe(1);
    expect(Object.isFrozen(dependencyScale.directDependencyDeclarations)).toBe(
      true,
    );
    expect(Object.isFrozen(dependencyScale.directDependencyCounts)).toBe(true);
  });

  it("should isolate quality exceptions from mutable constructor input", () => {
    const exceptions = [
      new InspectTargetQualityException("ExampleError", "example"),
    ];
    const quality = new InspectTargetQuality(undefined, exceptions);

    exceptions.push(new InspectTargetQualityException("LateError", "late"));

    expect(quality.exceptions).toHaveLength(1);
    expect(Object.isFrozen(quality.exceptions)).toBe(true);
  });
});
