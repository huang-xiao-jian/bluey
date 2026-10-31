import { Container } from "inversify";
import { describe, expect, it } from "vitest";
import { InspectDelegation } from "../core/model/inspect-delegation";
import {
  type NpmPackageManifestResolution,
  NpmPackageRegistry,
} from "../core/ports/npm-package-registry";
import { InspectNpmPackageQualityWorkflowScheduler } from "../core/workflow/inspect-npm-package-quality-workflow-scheduler";
import { provideNpmPackageQualityModule } from "./npm-package-quality-module";

class InMemoryRegistry extends NpmPackageRegistry {
  public async readManifest(): Promise<NpmPackageManifestResolution> {
    return {
      exactVersion: "1.0.0",
      manifest: { version: "1.0.0", dependencies: { helper: "^2.0.0" } },
    };
  }

  public async readPackage(): Promise<never> {
    throw new Error("Unexpected package metadata fallback");
  }
}

describe("provideNpmPackageQualityModule", () => {
  it("should resolve the complete workflow with the provided registry", async () => {
    const container = new Container({ defaultScope: "Singleton" });
    container.load(provideNpmPackageQualityModule(new InMemoryRegistry()));

    const scheduler = container.get(InspectNpmPackageQualityWorkflowScheduler);
    const result = await scheduler.run(
      new InspectDelegation("example-package"),
    );

    expect(result.target).toEqual({
      packageName: "example-package",
      exactVersion: "1.0.0",
      tag: "latest",
    });
    expect(
      result.quality.dependencyScale?.directDependencyCounts.runtimeCount,
    ).toBe(1);
  });
});
