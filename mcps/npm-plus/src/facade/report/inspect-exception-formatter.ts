import type { InspectTargetException } from "../../core/errors/inspect-target-exception";
import type { InspectDelegateException } from "../inspect-delegation-interpreter";

export abstract class InspectExceptionFormatter {
  public abstract format(
    exception: InspectDelegateException | InspectTargetException,
  ): string;
}
