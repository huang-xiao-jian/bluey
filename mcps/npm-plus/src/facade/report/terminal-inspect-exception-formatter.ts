import { chalkStderr } from "chalk";
import { injectable } from "inversify";
import type { InspectTargetException } from "../../core/errors/inspect-target-exception";
import type { InspectDelegateException } from "../inspect-delegation-interpreter";
import { InspectExceptionFormatter } from "./inspect-exception-formatter";

@injectable()
export class TerminalInspectExceptionFormatter extends InspectExceptionFormatter {
  public format(
    exception: InspectDelegateException | InspectTargetException,
  ): string {
    return [
      chalkStderr.red.bold("无法检查 npm package"),
      "",
      chalkStderr.red.bold("原因"),
      `  ${chalkStderr.red(exception.message)}`,
    ].join("\n");
  }
}
