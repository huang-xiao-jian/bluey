import { describe, expect, it } from "vitest";
import {
  type NpmPackageManifestResolution,
  NpmPackageRegistry,
} from "../core/ports/npm-package-registry";
import { DependencyScaleQualityInspector } from "../core/quality/dependency-scale-quality-inspector";
import { InspectTargetQualityFabricator } from "../core/quality/inspect-target-quality-fabricator";
import { InspectTargetQualityInspector } from "../core/quality/inspect-target-quality-inspector";
import { QualityDimensionFailureRecorder } from "../core/quality/quality-dimension-failure-recorder";
import { InspectTargetDeterminer } from "../core/target/inspect-target-determiner";
import { InspectNpmPackageQualityWorkflowScheduler } from "../core/workflow/inspect-npm-package-quality-workflow-scheduler";
import {
  InspectHandler,
  InspectHandlerDependencies,
  InspectInputError,
} from "./inspect-handler";
import { InspectReportFormatter } from "./report/inspect-report-formatter";

class CapturingDependencies extends InspectHandlerDependencies {
  public output = "";

  public stdout(text: string): void {
    this.output += text;
  }
}

class InMemoryRegistry extends NpmPackageRegistry {
  public async readLatestManifest(): Promise<NpmPackageManifestResolution> {
    return {
      exactVersion: "1.2.3",
      manifest: { dependencies: { "runtime-helper": "^4.0.0" } },
    };
  }
}

class FailingDependencyScaleInspector extends DependencyScaleQualityInspector {
  public override inspect(): never {
    const error = new Error("manifest unavailable");
    error.name = "PackageManifestReadError";
    throw error;
  }
}

function createScheduler(
  dependencyScaleInspector = new DependencyScaleQualityInspector(),
): InspectNpmPackageQualityWorkflowScheduler {
  return new InspectNpmPackageQualityWorkflowScheduler(
    new InspectTargetDeterminer(new InMemoryRegistry()),
    new InspectTargetQualityInspector(
      dependencyScaleInspector,
      new QualityDimensionFailureRecorder(),
      new InspectTargetQualityFabricator(),
    ),
  );
}

describe("InspectHandler", () => {
  it("should write only the complete serialized result as JSON", async () => {
    const dependencies = new CapturingDependencies();
    const handler = new InspectHandler(
      createScheduler(),
      new InspectReportFormatter(),
      dependencies,
    );

    await handler.run("example-package", { json: true });

    expect(dependencies.output).toBe(`{
  "delegation": {
    "packageName": "example-package"
  },
  "target": {
    "packageName": "example-package",
    "exactVersion": "1.2.3",
    "tag": "latest"
  },
  "quality": {
    "dependencyScale": {
      "directDependencyDeclarations": [
        {
          "packageName": "runtime-helper",
          "kind": "runtime",
          "declaredRange": "^4.0.0",
          "bundled": false
        }
      ],
      "directDependencyCounts": {
        "runtimeCount": 1,
        "optionalCount": 0,
        "peerCount": 0,
        "bundledCount": 0
      }
    },
    "exceptions": []
  }
}\n`);
  });

  it("should write a concise objective human report", async () => {
    const dependencies = new CapturingDependencies();
    const handler = new InspectHandler(
      createScheduler(),
      new InspectReportFormatter(),
      dependencies,
    );

    await handler.run("example-package", {});

    expect(dependencies.output).toContain("example-package@1.2.3 (tag: latest)");
    expect(dependencies.output).toContain("Runtime dependencies: 1");
    expect(dependencies.output).toContain("Quality exceptions: 0");
  });

  it("should render quality exceptions as a successful report", async () => {
    const dependencies = new CapturingDependencies();
    const handler = new InspectHandler(
      createScheduler(new FailingDependencyScaleInspector()),
      new InspectReportFormatter(),
      dependencies,
    );

    await handler.run("example-package", {});

    expect(dependencies.output).toContain(
      "PackageManifestReadError: manifest unavailable",
    );
  });

  it("should reject an empty package name", async () => {
    const dependencies = new CapturingDependencies();
    const handler = new InspectHandler(
      createScheduler(),
      new InspectReportFormatter(),
      dependencies,
    );

    await expect(handler.run("", {})).rejects.toBeInstanceOf(InspectInputError);
  });
});
