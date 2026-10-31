import { stripVTControlCharacters } from "node:util";
import chalk from "chalk";
import { afterEach, describe, expect, it } from "vitest";
import { InspectDelegation } from "../../core/model/inspect-delegation";
import { InspectTarget } from "../../core/model/inspect-target";
import {
  InspectTargetDependencyScaleQuality,
  InspectTargetQuality,
  InspectTargetQualityException,
} from "../../core/model/inspect-target-quality";
import type { InspectResult } from "../inspect-result";
import { TerminalInspectResultFormatter } from "./terminal-inspect-result-formatter";

function resultWithAvailableDependencyScale(): InspectResult {
  return {
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
}

describe("TerminalInspectResultFormatter", () => {
  const colorLevel = chalk.level;

  afterEach(() => {
    chalk.level = colorLevel;
  });

  it("should format a terminal summary with dependency facts and tag source", () => {
    expect(
      stripVTControlCharacters(
        new TerminalInspectResultFormatter().format(
          resultWithAvailableDependencyScale(),
        ),
      ),
    )
      .toBe(`检查目标  example-package@1.2.3
版本来源  latest tag

依赖规模
  运行时依赖  1
  可选依赖    2
  对等依赖    3
  捆绑依赖    4

数据获取异常  0
`);
  });

  it("should omit the version source for an exact version", () => {
    const result = resultWithAvailableDependencyScale();
    const exactVersionResult: InspectResult = {
      ...result,
      delegation: new InspectDelegation("example-package", "1.2.3"),
      target: new InspectTarget("example-package", "1.2.3"),
    };

    expect(
      stripVTControlCharacters(
        new TerminalInspectResultFormatter().format(exactVersionResult),
      ),
    ).toBe(`检查目标  example-package@1.2.3

依赖规模
  运行时依赖  1
  可选依赖    2
  对等依赖    3
  捆绑依赖    4

数据获取异常  0
`,
    );
  });

  it("should format unavailable dependency data with exception details", () => {
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

    expect(
      stripVTControlCharacters(
        new TerminalInspectResultFormatter().format(result),
      ),
    ).toBe(`检查目标  example-package@1.2.3
版本来源  latest tag

依赖规模  数据不可用

异常详情
  PackageManifestReadError
  manifest unavailable
`);
  });

  it("should highlight successful facts when terminal colors are enabled", () => {
    chalk.level = 1;

    const output = new TerminalInspectResultFormatter().format(
      resultWithAvailableDependencyScale(),
    );

    expect(output).toContain("\u001B[36m");
    expect(output).toContain("\u001B[32m");
  });

  it("should highlight unavailable data when terminal colors are enabled", () => {
    chalk.level = 1;
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

    const output = new TerminalInspectResultFormatter().format(result);

    expect(output).toContain("\u001B[33m");
  });
});
