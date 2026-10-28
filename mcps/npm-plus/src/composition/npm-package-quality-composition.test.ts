import { describe, expect, it } from "vitest";
import { InspectDelegation } from "../core/model/inspect-delegation";
import {
  type NpmPackageDocument,
  NpmPackageRegistry,
} from "../core/ports/npm-package-registry";
import { NpmPackageQualityComposition } from "./npm-package-quality-composition";

class InMemoryRegistry extends NpmPackageRegistry {
  public async readPackage(): Promise<NpmPackageDocument> {
    return {
      name: "example-package",
      distTags: { latest: "1.0.0" },
      versions: {
        "1.0.0": {
          name: "example-package",
          version: "1.0.0",
          dependencies: { helper: "^2.0.0" },
        },
      },
    };
  }
}

describe("NpmPackageQualityComposition", () => {
  it("should assemble the complete inspection workflow", async () => {
    const scheduler = new NpmPackageQualityComposition(
      new InMemoryRegistry(),
    ).createWorkflowScheduler();

    const result = await scheduler.run(
      new InspectDelegation("example-package"),
    );

    expect(result.target).toEqual({
      packageName: "example-package",
      exactVersion: "1.0.0",
      tag: "latest",
    });
    expect(result.quality.dependencyScale?.directDependencyCounts).toEqual({
      runtimeCount: 1,
      optionalCount: 0,
      peerCount: 0,
      bundledCount: 0,
    });
  });

  it("should keep a malformed selected manifest as a quality exception", async () => {
    class MalformedManifestRegistry extends NpmPackageRegistry {
      public async readPackage(): Promise<NpmPackageDocument> {
        return {
          name: "example-package",
          distTags: { latest: "1.0.0" },
          versions: {
            "1.0.0": {
              name: "example-package",
              version: "1.0.0",
              dependencies: { broken: 42 },
            },
          },
        };
      }
    }
    const scheduler = new NpmPackageQualityComposition(
      new MalformedManifestRegistry(),
    ).createWorkflowScheduler();

    const result = await scheduler.run(
      new InspectDelegation("example-package"),
    );

    expect(result.target.exactVersion).toBe("1.0.0");
    expect(result.quality).toEqual({
      exceptions: [
        {
          name: "PackageManifestReadError",
          message:
            "Unable to read dependency declarations from the published package manifest.",
        },
      ],
    });
  });
});
