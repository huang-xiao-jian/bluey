import { injectable } from "inversify";
import type { InspectTargetException } from "../../core/errors/inspect-target-exception";
import type { InspectDelegateException } from "../inspect-delegation-interpreter";
import { InspectExceptionFormatter } from "./inspect-exception-formatter";

@injectable()
export class PlainInspectExceptionFormatter extends InspectExceptionFormatter {
  public format(
    exception: InspectDelegateException | InspectTargetException,
  ): string {
    return [
      "无法检查 npm package",
      "",
      "原因",
      `  ${exception.message}`,
    ].join("\n");
  }
}
