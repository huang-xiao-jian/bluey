import { describe, expect, it } from "vitest";
import type { InspectDelegateException } from "../inspect-delegation-interpreter";
import {
  InspectDelegateExceptionCode,
} from "../inspect-delegation-interpreter";
import { InspectExceptionFormatter } from "./inspect-exception-formatter";

describe("InspectExceptionFormatter", () => {
  const formatter = new InspectExceptionFormatter();

  it("should aggregate the semantic message from a final exception", () => {
    const exception: InspectDelegateException = {
      code: InspectDelegateExceptionCode.PackageNameRequired,
      message: "请提供要检查的 npm package 名称。",
    };

    expect(formatter.format(exception)).toBe(`无法检查 npm package

原因
  请提供要检查的 npm package 名称。`);
  });
});
