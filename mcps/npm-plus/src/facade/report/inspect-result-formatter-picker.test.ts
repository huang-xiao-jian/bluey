import { describe, expect, it } from "vitest";
import { InspectDelegation } from "../../core/model/inspect-delegation";
import { InspectTarget } from "../../core/model/inspect-target";
import { InspectTargetQuality } from "../../core/model/inspect-target-quality";
import type { InspectResult } from "../inspect-result";
import { InspectResultFormatterPicker } from "./inspect-result-formatter-picker";
import { JSONInspectResultFormatter } from "./json-inspect-result-formatter";
import { TerminalInspectResultFormatter } from "./terminal-inspect-result-formatter";

const result: InspectResult = {
  delegation: new InspectDelegation("example-package"),
  target: new InspectTarget("example-package", "1.2.3", "latest"),
  quality: new InspectTargetQuality(undefined, []),
};

describe("InspectResultFormatterPicker", () => {
  const picker = new InspectResultFormatterPicker(
    new TerminalInspectResultFormatter(),
    new JSONInspectResultFormatter(),
  );

  it("should pick the terminal formatter by default", () => {
    expect(picker.pick(false).format(result)).toBe(`检查目标  example-package@1.2.3
版本来源  latest tag

依赖规模  数据不可用

数据获取异常  0
`);
  });

  it("should pick the JSON formatter for JSON output", () => {
    expect(picker.pick(true).format(result)).toBe(`{
  "delegation": {
    "packageName": "example-package"
  },
  "target": {
    "packageName": "example-package",
    "exactVersion": "1.2.3",
    "tag": "latest"
  },
  "quality": {
    "exceptions": []
  }
}
`);
  });
});
