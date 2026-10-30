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
import { PackageVersionIdentifierInterpreter } from "../core/target/package-version-identifier-interpreter";
import { InspectNpmPackageQualityWorkflowScheduler } from "../core/workflow/inspect-npm-package-quality-workflow-scheduler";
import {
  InspectHandler,
  InspectHandlerDependencies,
  InspectInputError,
  UnsupportedVersionRangeError,
} from "./inspect-handler";
import { InspectResultFormatterPicker } from "./report/inspect-result-formatter-picker";
import { JSONInspectResultFormatter } from "./report/json-inspect-result-formatter";
import { TerminalInspectResultFormatter } from "./report/terminal-inspect-result-formatter";

class CapturingDependencies extends InspectHandlerDependencies {
  public output = "";

  public stdout(text: string): void {
    this.output += text;
  }
}

class InMemoryRegistry extends NpmPackageRegistry {
  public async readManifest(): Promise<NpmPackageManifestResolution> {
    return {
      exactVersion: "1.2.3",
      manifest: { dependencies: { "runtime-helper": "^4.0.0" } },
    };
  }

  public async readPackage(): Promise<never> {
    throw new Error("Unexpected package metadata fallback");
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
    new InspectTargetDeterminer(
      new InMemoryRegistry(),
      new PackageVersionIdentifierInterpreter(),
    ),
    new InspectTargetQualityInspector(
      dependencyScaleInspector,
      new QualityDimensionFailureRecorder(),
      new InspectTargetQualityFabricator(),
    ),
  );
}

function createFormatterPicker(): InspectResultFormatterPicker {
  return new InspectResultFormatterPicker(
    new TerminalInspectResultFormatter(),
    new JSONInspectResultFormatter(),
  );
}

describe("InspectHandler", () => {
  it("should preserve an explicit version identifier in the result", async () => {
    const dependencies = new CapturingDependencies();
    const handler = new InspectHandler(
      createScheduler(),
      createFormatterPicker(),
      dependencies,
    );

    await handler.run("example-package", "stable", { json: true });

    expect(dependencies.output).toContain('"versionIdentifier": "stable"');
    expect(dependencies.output).toContain('"tag": "stable"');
  });

  it("should write only the complete serialized result as JSON", async () => {
    const dependencies = new CapturingDependencies();
    const handler = new InspectHandler(
      createScheduler(),
      createFormatterPicker(),
      dependencies,
    );

    await handler.run("example-package", undefined, { json: true });

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

  it("should write the complete terminal inspect summary", async () => {
    const dependencies = new CapturingDependencies();
    const handler = new InspectHandler(
      createScheduler(),
      createFormatterPicker(),
      dependencies,
    );

    await handler.run("example-package", undefined, {});

    expect(dependencies.output).toBe(`检查目标  example-package@1.2.3
版本来源  latest tag

依赖规模
  运行时依赖  1
  可选依赖    0
  对等依赖    0
  捆绑依赖    0

数据获取异常  0
`);
  });

  it("should render quality exceptions as a successful report", async () => {
    const dependencies = new CapturingDependencies();
    const handler = new InspectHandler(
      createScheduler(new FailingDependencyScaleInspector()),
      createFormatterPicker(),
      dependencies,
    );

    await handler.run("example-package", undefined, {});

    expect(dependencies.output).toBe(`检查目标  example-package@1.2.3
版本来源  latest tag

依赖规模  数据不可用

异常详情
  PackageManifestReadError
  manifest unavailable
`);
  });

  it("should reject an empty package name", async () => {
    const dependencies = new CapturingDependencies();
    const handler = new InspectHandler(
      createScheduler(),
      createFormatterPicker(),
      dependencies,
    );

    await expect(handler.run("", undefined, {})).rejects.toBeInstanceOf(
      InspectInputError,
    );
  });

  it("should reject a version range before running the workflow", async () => {
    const dependencies = new CapturingDependencies();
    const handler = new InspectHandler(
      createScheduler(),
      createFormatterPicker(),
      dependencies,
    );

    await expect(
      handler.run("example-package", "^1.0.0", {}),
    ).rejects.toBeInstanceOf(UnsupportedVersionRangeError);
    expect(dependencies.output).toBe("");
  });
});
