import { describe, expect, it } from "vitest";
import {
  InspectTargetException,
  InspectTargetExceptionCode,
} from "../../core/errors/inspect-target-exception";
import { InspectTarget } from "../../core/model/inspect-target";
import {
  InspectTargetQuality,
  InspectTargetQualityException,
} from "../../core/model/inspect-target-quality";
import type { InspectNpmPackageQualityWorkflow } from "../../core/workflow/inspect-npm-package-quality-workflow-scheduler";
import {
  InspectDelegateException,
  InspectDelegateExceptionCode,
  InspectDelegationInterpreter,
} from "../../facade/inspect-delegation-interpreter";
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
    {},
    { packageName: 42 },
    { packageName: "example-package", versionIdentifier: 42 },
  ])("should reject a structurally invalid input %#", (input) => {
    expect(() => InspectNpmPackageInputSchema.parse(input)).toThrow();
  });

  it("should leave semantic validation to the delegation interpreter", () => {
    expect(
      InspectNpmPackageInputSchema.parse({
        packageName: "example-package",
        versionIdentifier: "^1.0.0",
      }),
    ).toEqual({
      packageName: "example-package",
      versionIdentifier: "^1.0.0",
    });
  });
});

describe("createInspectNpmPackageTool", () => {
  it("should define the required read-only annotations", () => {
    expect(
      createInspectNpmPackageTool(
        schedulerWithResult(),
        new InspectResultSummarizer(),
        new InspectDelegationInterpreter(),
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
      new InspectDelegationInterpreter(),
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

  it("should convert unsupported input through the delegation interpreter", async () => {
    const tool = createInspectNpmPackageTool(
      schedulerWithResult(),
      new InspectResultSummarizer(),
      new InspectDelegationInterpreter(),
    );

    await expect(
      tool.callback({
        packageName: "example-package",
        versionIdentifier: "^1.0.0",
      }),
    ).rejects.toEqual(
      new InspectDelegateException(
        InspectDelegateExceptionCode.UnsupportedVersionRange,
        "暂不支持版本范围“^1.0.0”，请提供精确版本号或 tag。",
      ),
    );
  });

  it("should propagate target determination errors", async () => {
    const scheduler = {
      async run() {
        throw new InspectTargetException(
          InspectTargetExceptionCode.PackageNotFound,
          "npm Registry 中未找到 package“missing”，请确认名称是否正确以及该 package 是否已发布。",
        );
      },
    } satisfies InspectNpmPackageQualityWorkflow;

    await expect(
      createInspectNpmPackageTool(
        scheduler,
        new InspectResultSummarizer(),
        new InspectDelegationInterpreter(),
      ).callback({ packageName: "missing" }),
    ).rejects.toEqual(
      new InspectTargetException(
        InspectTargetExceptionCode.PackageNotFound,
        "npm Registry 中未找到 package“missing”，请确认名称是否正确以及该 package 是否已发布。",
      ),
    );
  });
});
