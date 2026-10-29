import { describe, expect, it } from "vitest";
import { InspectDelegation } from "../model/inspect-delegation";
import { InspectTarget } from "../model/inspect-target";
import type { InspectTargetQuality } from "../model/inspect-target-quality";
import type { NpmPackageManifest } from "../ports/npm-package-registry";
import type { InspectTargetQualityInspection } from "../quality/inspect-target-quality-inspector";
import type { InspectTargetDetermination } from "../target/inspect-target-determiner";
import { InspectNpmPackageQualityWorkflowScheduler } from "./inspect-npm-package-quality-workflow-scheduler";

const delegation = new InspectDelegation("example-package");
const target = new InspectTarget("example-package", "1.0.0", "latest");
const manifest: NpmPackageManifest = {
  name: "example-package",
  version: "1.0.0",
};
const quality: InspectTargetQuality = {
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
};

describe("InspectNpmPackageQualityWorkflowScheduler", () => {
  it("should determine the target before inspecting its quality", async () => {
    const determiner = {
      async determine() {
        return { target, manifest };
      },
    } satisfies InspectTargetDetermination;
    const inspector = {
      async inspect(receivedTarget: InspectTarget) {
        if (receivedTarget !== target) throw new Error("unexpected target");
        return quality;
      },
    } satisfies InspectTargetQualityInspection;
    const scheduler = new InspectNpmPackageQualityWorkflowScheduler(
      determiner,
      inspector,
    );

    await expect(scheduler.run(delegation)).resolves.toEqual({
      target,
      quality,
    });
  });

  it("should propagate target errors without inspecting quality", async () => {
    const targetError = new Error("target unavailable");
    const determiner = {
      async determine() {
        throw targetError;
      },
    } satisfies InspectTargetDetermination;
    const inspector = {
      async inspect() {
        throw new Error("quality inspection must not run");
      },
    } satisfies InspectTargetQualityInspection;
    const scheduler = new InspectNpmPackageQualityWorkflowScheduler(
      determiner,
      inspector,
    );

    await expect(scheduler.run(delegation)).rejects.toBe(targetError);
  });
});
