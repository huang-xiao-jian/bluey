import type { InspectResult } from "../inspect-result";

export abstract class InspectResultFormatter {
  public abstract format(result: InspectResult): string;
}
