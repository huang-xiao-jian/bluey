import { describe, expect, it } from "vitest";
import { InspectTarget } from "../model/inspect-target";
import {
  DirectDependencyKind,
  InspectTargetDependencyScaleQuality,
} from "../model/inspect-target-quality";
import type { NpmPackageManifest } from "../ports/npm-package-registry";
import {
  DependencyScaleQualityInspector,
  PackageManifestReadError,
} from "./dependency-scale-quality-inspector";

describe("DependencyScaleQualityInspector", () => {
  const target = new InspectTarget("example-package", "1.0.0");
  const inspector = new DependencyScaleQualityInspector();

  it("should normalize direct dependency declarations and counts", () => {
    const manifest: NpmPackageManifest = {
      name: "example-package",
      version: "1.0.0",
      dependencies: {
        "runtime-helper": "^4.1.0",
        "platform-adapter": "^1.0.0",
      },
      optionalDependencies: {
        "platform-adapter": "^2.0.0",
        "optional-helper": "~3.0.0",
      },
      peerDependencies: {
        "host-framework": ">=3 <5",
        "runtime-helper": "^4.0.0",
      },
      peerDependenciesMeta: {
        "host-framework": { optional: true },
        "runtime-helper": { optional: false },
      },
      bundledDependencies: ["platform-adapter", "host-framework"],
      devDependencies: { "test-library": "^1.0.0" },
    };

    const result = inspector.inspect(target, manifest);

    expect(result).toBeInstanceOf(InspectTargetDependencyScaleQuality);
    expect(result).toEqual({
      directDependencyDeclarations: [
        {
          packageName: "runtime-helper",
          kind: DirectDependencyKind.Runtime,
          declaredRange: "^4.1.0",
          bundled: false,
        },
        {
          packageName: "optional-helper",
          kind: DirectDependencyKind.Optional,
          declaredRange: "~3.0.0",
          bundled: false,
        },
        {
          packageName: "platform-adapter",
          kind: DirectDependencyKind.Optional,
          declaredRange: "^2.0.0",
          bundled: true,
        },
        {
          packageName: "host-framework",
          kind: DirectDependencyKind.Peer,
          declaredRange: ">=3 <5",
          bundled: false,
          peerOptional: true,
        },
        {
          packageName: "runtime-helper",
          kind: DirectDependencyKind.Peer,
          declaredRange: "^4.0.0",
          bundled: false,
        },
      ],
      directDependencyCounts: {
        runtimeCount: 1,
        optionalCount: 2,
        peerCount: 2,
        bundledCount: 1,
      },
    });
  });

  it.each(["bundledDependencies", "bundleDependencies"] as const)(
    "should support the %s alias",
    (field) => {
      const manifest: NpmPackageManifest = {
        name: "example-package",
        version: "1.0.0",
        dependencies: { first: "1", second: "2" },
        optionalDependencies: { third: "3" },
        [field]: ["second", "third"],
      };

      expect(inspector.inspect(target, manifest).directDependencyCounts).toEqual({
        runtimeCount: 2,
        optionalCount: 1,
        peerCount: 0,
        bundledCount: 2,
      });
    },
  );

  it("should treat a true bundle flag as all runtime and optional declarations", () => {
    const manifest: NpmPackageManifest = {
      name: "example-package",
      version: "1.0.0",
      dependencies: { first: "1" },
      optionalDependencies: { second: "2" },
      peerDependencies: { third: "3" },
      bundleDependencies: true,
    };

    expect(
      inspector.inspect(target, manifest).directDependencyCounts.bundledCount,
    ).toBe(2);
  });

  it("should return zero counts for a manifest without dependencies", () => {
    expect(
      inspector.inspect(target, { name: "example-package", version: "1.0.0" }),
    ).toEqual({
      directDependencyDeclarations: [],
      directDependencyCounts: {
        runtimeCount: 0,
        optionalCount: 0,
        peerCount: 0,
        bundledCount: 0,
      },
    });
  });

  it("should reject malformed dependency declarations", () => {
    const manifest = {
      name: "example-package",
      version: "1.0.0",
      dependencies: { broken: 42 },
    } as unknown as NpmPackageManifest;

    expect(() => inspector.inspect(target, manifest)).toThrow(
      PackageManifestReadError,
    );
  });
});
