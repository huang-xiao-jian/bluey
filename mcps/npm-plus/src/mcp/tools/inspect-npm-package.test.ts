import { describe, expect, it } from "vitest";
import { PackageNotFound } from "../../core/errors/target-determination-errors";
import { InspectTarget } from "../../core/model/inspect-target";
import {
  InspectTargetQuality,
  InspectTargetQualityException,
} from "../../core/model/inspect-target-quality";
import type { InspectNpmPackageQualityWorkflow } from "../../core/workflow/inspect-npm-package-quality-workflow-scheduler";
import { InspectResultSummarizer } from "../report/inspect-result-summarizer";
import {
  createInspectNpmPackageTool,
  InspectNpmPackageInputSchema,
} from "./inspect-npm-package";

function schedulerWithResult(): InspectNpmPackageQualityWorkflow {
  return {
    async run() {
      return {
        target: new InspectTarget("example-package", "1.2.3", "latest"),
        quality: new InspectTargetQuality(undefined, [
          new InspectTargetQualityException(
            "PackageManifestReadError",
            "manifest unavailable",
          ),
        ]),
      };
    },
  };
}

describe("InspectNpmPackageInputSchema", () => {
  it("should accept a package name and optional version identifier", () => {
    expect(
      InspectNpmPackageInputSchema.parse({
        packageName: "example-package",
        versionIdentifier: "stable",
      }),
    ).toEqual({
      packageName: "example-package",
      versionIdentifier: "stable",
    });
  });

  it.each([
    { packageName: "" },
    { packageName: "example-package", versionIdentifier: "" },
    { packageName: "example-package", versionIdentifier: "^1.0.0" },
    { packageName: "example-package", versionIdentifier: "1.x" },
  ])("should reject unsupported input %#", (input) => {
    expect(() => InspectNpmPackageInputSchema.parse(input)).toThrow();
  });
});

describe("createInspectNpmPackageTool", () => {
  it("should define the required read-only annotations", () => {
    expect(
      createInspectNpmPackageTool(
        schedulerWithResult(),
        new InspectResultSummarizer(),
      ).annotations,
    ).toEqual({
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: true,
        destructiveHint: false,
      });
  });

  it("should preserve the delegation in a successful result", async () => {
    const tool = createInspectNpmPackageTool(
      schedulerWithResult(),
      new InspectResultSummarizer(),
    );

    const result = await tool.callback({
      packageName: "example-package",
      versionIdentifier: "stable",
    });

    expect(result.result).toEqual({
      delegation: {
        packageName: "example-package",
        versionIdentifier: "stable",
      },
      target: {
        packageName: "example-package",
        exactVersion: "1.2.3",
        tag: "latest",
      },
      quality: {
        dependencyScale: undefined,
        exceptions: [
          {
            name: "PackageManifestReadError",
            message: "manifest unavailable",
          },
        ],
      },
    });
    expect(result.summary).toBe(`检查目标  example-package@1.2.3
版本来源  latest tag

依赖规模  数据不可用

异常详情
  PackageManifestReadError
  manifest unavailable`);
  });

  it("should propagate target determination errors", async () => {
    const scheduler = {
      async run() {
        throw new PackageNotFound("missing");
      },
    } satisfies InspectNpmPackageQualityWorkflow;

    await expect(
      createInspectNpmPackageTool(
        scheduler,
        new InspectResultSummarizer(),
      ).callback({ packageName: "missing" }),
    ).rejects.toBeInstanceOf(PackageNotFound);
  });
});
