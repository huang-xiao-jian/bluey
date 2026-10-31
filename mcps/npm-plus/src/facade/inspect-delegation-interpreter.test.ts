import { describe, expect, it } from "vitest";
import {
  InspectDelegateException,
  InspectDelegateExceptionCode,
  InspectDelegationInterpreter,
} from "./inspect-delegation-interpreter";

describe("InspectDelegationInterpreter", () => {
  const interpreter = new InspectDelegationInterpreter();

  it("should create a delegation from supported input", () => {
    expect(interpreter.interpret("example-package", "stable")).toEqual({
      packageName: "example-package",
      versionIdentifier: "stable",
    });
  });

  it("should explain why a package name is required", () => {
    expect(() => interpreter.interpret("", undefined)).toThrow(
      new InspectDelegateException(
        InspectDelegateExceptionCode.PackageNameRequired,
        "请提供要检查的 npm package 名称。",
      ),
    );
  });

  it("should explain why an explicitly provided version cannot be empty", () => {
    expect(() => interpreter.interpret("example-package", " ")).toThrow(
      new InspectDelegateException(
        InspectDelegateExceptionCode.VersionIdentifierEmpty,
        "版本标识不能为空，请提供精确版本号或 tag；也可以省略该参数以使用 latest tag。",
      ),
    );
  });

  it("should explain why a version range is unsupported", () => {
    expect(() => interpreter.interpret("example-package", "^1.0.0")).toThrow(
      new InspectDelegateException(
        InspectDelegateExceptionCode.UnsupportedVersionRange,
        "暂不支持版本范围“^1.0.0”，请提供精确版本号或 tag。",
      ),
    );
  });

  it("should add delegation context to an unexpected semantic message", () => {
    const unexpectedPackageName = {
      trim(): never {
        throw new Error("无法读取 package 名称。");
      },
    } as unknown as string;

    expect(() => interpreter.interpret(unexpectedPackageName, undefined)).toThrow(
      new InspectDelegateException(
        InspectDelegateExceptionCode.InspectDelegationFailed,
        "建立 npm package 检查请求时发生异常：无法读取 package 名称。",
      ),
    );
  });
});
