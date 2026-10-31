import { injectable } from "inversify";
import { InspectDelegation } from "../core/model/inspect-delegation";
import { isUnsupportedVersionRange } from "../core/target/package-version-identifier-interpreter";

export enum InspectDelegateExceptionCode {
  PackageNameRequired = "PACKAGE_NAME_REQUIRED",
  VersionIdentifierEmpty = "VERSION_IDENTIFIER_EMPTY",
  UnsupportedVersionRange = "UNSUPPORTED_VERSION_RANGE",
  InspectDelegationFailed = "INSPECT_DELEGATION_FAILED",
}

export class InspectDelegateException {
  public constructor(
    public readonly code: InspectDelegateExceptionCode,
    public readonly message: string,
  ) {}
}

@injectable()
export class InspectDelegationInterpreter {
  public interpret(
    packageName: string,
    versionIdentifier: string | undefined,
  ): InspectDelegation {
    try {
      if (!packageName.trim()) {
        throw new InspectDelegateException(
          InspectDelegateExceptionCode.PackageNameRequired,
          "请提供要检查的 npm package 名称。",
        );
      }
      if (versionIdentifier !== undefined && !versionIdentifier.trim()) {
        throw new InspectDelegateException(
          InspectDelegateExceptionCode.VersionIdentifierEmpty,
          "版本标识不能为空，请提供精确版本号或 tag；也可以省略该参数以使用 latest tag。",
        );
      }
      if (
        versionIdentifier !== undefined &&
        isUnsupportedVersionRange(versionIdentifier)
      ) {
        throw new InspectDelegateException(
          InspectDelegateExceptionCode.UnsupportedVersionRange,
          `暂不支持版本范围“${versionIdentifier}”，请提供精确版本号或 tag。`,
        );
      }
      return new InspectDelegation(packageName, versionIdentifier);
    } catch (error) {
      if (error instanceof InspectDelegateException) throw error;
      const message = error instanceof Error ? error.message : String(error);
      throw new InspectDelegateException(
        InspectDelegateExceptionCode.InspectDelegationFailed,
        `建立 npm package 检查请求时发生异常：${message}`,
      );
    }
  }
}
