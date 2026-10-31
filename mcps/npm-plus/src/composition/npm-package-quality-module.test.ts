import { Container } from "inversify";
import { describe, expect, it } from "vitest";
import { InspectDelegation } from "../core/model/inspect-delegation";
import {
  type NpmPackageManifestResolution,
  NpmPackageRegistry,
} from "../core/ports/npm-package-registry";
import { InspectNpmPackageQualityWorkflowScheduler } from "../core/workflow/inspect-npm-package-quality-workflow-scheduler";
import { NPM_PACKAGE_QUALITY_MODULE } from "./npm-package-quality-module";

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

describe("NPM_PACKAGE_QUALITY_MODULE", () => {
  it("should resolve the complete workflow with a replaceable Registry port", async () => {
    const container = new Container({ defaultScope: "Singleton" });
    container.load(NPM_PACKAGE_QUALITY_MODULE);
    container
      .rebind(NpmPackageRegistry)
      .to(InMemoryRegistry)
      .inSingletonScope();

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
