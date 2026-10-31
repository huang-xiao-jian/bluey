import chalk, { chalkStderr } from "chalk";
import { afterEach, describe, expect, it } from "vitest";
import {
  InspectDelegateException,
  InspectDelegateExceptionCode,
} from "../inspect-delegation-interpreter";
import { PlainInspectExceptionFormatter } from "./plain-inspect-exception-formatter";
import { TerminalInspectExceptionFormatter } from "./terminal-inspect-exception-formatter";

describe("inspect exception formatters", () => {
  const colorLevel = chalk.level;
  const stderrColorLevel = chalkStderr.level;

  afterEach(() => {
    chalk.level = colorLevel;
    chalkStderr.level = stderrColorLevel;
  });

  it("should aggregate the semantic message from a final exception", () => {
    chalk.level = 1;
    const formatter = new PlainInspectExceptionFormatter();
    const exception = new InspectDelegateException(
      InspectDelegateExceptionCode.PackageNameRequired,
      "请提供要检查的 npm package 名称。",
    );

    expect(formatter.format(exception)).toBe(`无法检查 npm package

原因
  请提供要检查的 npm package 名称。`);
  });

  it("should highlight a failed inspection when terminal colors are enabled", () => {
    chalk.level = 0;
    chalkStderr.level = 1;
    const formatter = new TerminalInspectExceptionFormatter();
    const exception = new InspectDelegateException(
      InspectDelegateExceptionCode.PackageNameRequired,
      "请提供要检查的 npm package 名称。",
    );

    const output = formatter.format(exception);

    expect(output).toContain("\u001B[31m");
  });
});
