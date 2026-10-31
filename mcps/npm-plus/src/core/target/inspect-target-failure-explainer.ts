import { injectable } from "inversify";
import {
  InspectTargetException,
  InspectTargetExceptionCode,
} from "../errors/inspect-target-exception";
import {
  ExactVersionNotFound,
  PackageNotFound,
  RegistryRequestError,
  RegistryResponseError,
  TagNotFound,
  TagUnresolvable,
} from "../errors/target-determination-errors";
import type { InspectDelegation } from "../model/inspect-delegation";

@injectable()
export class InspectTargetFailureExplainer {
  public explain(
    error: unknown,
    delegation: InspectDelegation,
  ): InspectTargetException {
    if (error instanceof InspectTargetException) return error;

    if (error instanceof PackageNotFound) {
      return new InspectTargetException(
        InspectTargetExceptionCode.PackageNotFound,
        `npm Registry 中未找到 package“${delegation.packageName}”，请确认名称是否正确以及该 package 是否已发布。`,
      );
    }
    if (error instanceof ExactVersionNotFound) {
      return new InspectTargetException(
        InspectTargetExceptionCode.ExactVersionNotFound,
        `npm package“${delegation.packageName}”没有发布版本“${delegation.versionIdentifier}”，请确认精确版本号是否正确。`,
      );
    }
    if (error instanceof TagNotFound) {
      const tag = delegation.versionIdentifier ?? "latest";
      return new InspectTargetException(
        InspectTargetExceptionCode.TagNotFound,
        `npm package“${delegation.packageName}”没有“${tag}”tag，请确认 tag 是否正确。`,
      );
    }
    if (error instanceof TagUnresolvable) {
      const tag = delegation.versionIdentifier ?? "latest";
      return new InspectTargetException(
        InspectTargetExceptionCode.TagUnresolvable,
        `npm package“${delegation.packageName}”的“${tag}”tag 未指向已发布版本，请尝试其他 tag 或精确版本号。`,
      );
    }
    if (
      error instanceof RegistryRequestError ||
      error instanceof RegistryResponseError
    ) {
      return new InspectTargetException(
        InspectTargetExceptionCode.RegistryError,
        error.message,
      );
    }
    const message = error instanceof Error ? error.message : String(error);
    return new InspectTargetException(
      InspectTargetExceptionCode.InspectTargetDeterminationFailed,
      `确定 npm package“${delegation.packageName}”的检查版本时发生异常：${message}`,
    );
  }
}
