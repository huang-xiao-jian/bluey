import { describe, expect, it } from "vitest";
import { InspectDelegation } from "../../core/model/inspect-delegation";
import { InspectTarget } from "../../core/model/inspect-target";
import {
  InspectTargetDependencyScaleQuality,
  InspectTargetQuality,
  InspectTargetQualityException,
} from "../../core/model/inspect-target-quality";
import type { InspectResult } from "../../facade/inspect-result";
import { InspectResultSummarizer } from "./inspect-result-summarizer";

describe("InspectResultSummarizer", () => {
  it("should summarize available dependency data", () => {
    const result: InspectResult = {
      delegation: new InspectDelegation("example-package"),
      target: new InspectTarget("example-package", "1.2.3", "latest"),
      quality: new InspectTargetQuality(
        new InspectTargetDependencyScaleQuality([], {
          runtimeCount: 1,
          optionalCount: 2,
          peerCount: 3,
          bundledCount: 4,
        }),
        [],
      ),
    };

    expect(new InspectResultSummarizer().summarize(result)).toBe(`检查目标  example-package@1.2.3
版本来源  latest tag

依赖规模
  运行时依赖  1
  可选依赖    2
  对等依赖    3
  捆绑依赖    4

数据获取异常  0`);
  });

  it("should omit the version source for an exact version", () => {
    const result: InspectResult = {
      delegation: new InspectDelegation("example-package", "1.2.3"),
      target: new InspectTarget("example-package", "1.2.3"),
      quality: new InspectTargetQuality(
        new InspectTargetDependencyScaleQuality([], {
          runtimeCount: 0,
          optionalCount: 0,
          peerCount: 0,
          bundledCount: 0,
        }),
        [],
      ),
    };

    expect(new InspectResultSummarizer().summarize(result)).toBe(`检查目标  example-package@1.2.3

依赖规模
  运行时依赖  0
  可选依赖    0
  对等依赖    0
  捆绑依赖    0

数据获取异常  0`);
  });

  it("should summarize unavailable dependency data and its exception", () => {
    const result: InspectResult = {
      delegation: new InspectDelegation("example-package"),
      target: new InspectTarget("example-package", "1.2.3", "latest"),
      quality: new InspectTargetQuality(undefined, [
        new InspectTargetQualityException(
          "PackageManifestReadError",
          "manifest unavailable",
        ),
      ]),
    };

    expect(new InspectResultSummarizer().summarize(result)).toBe(`检查目标  example-package@1.2.3
版本来源  latest tag

依赖规模  数据不可用

异常详情
  PackageManifestReadError
  manifest unavailable`);
  });
});
