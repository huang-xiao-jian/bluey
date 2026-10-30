import { injectable } from "inversify";
import type { InspectResult } from "../inspect-result";
import { InspectResultFormatter } from "./inspect-result-formatter";

@injectable()
export class JSONInspectResultFormatter extends InspectResultFormatter {
  public format(result: InspectResult): string {
    return `${JSON.stringify(result, undefined, 2)}\n`;
  }
}
