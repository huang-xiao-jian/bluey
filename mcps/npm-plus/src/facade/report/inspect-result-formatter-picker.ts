import { injectable } from "inversify";
import { InspectResultFormatter } from "./inspect-result-formatter";
import { JSONInspectResultFormatter } from "./json-inspect-result-formatter";
import { TerminalInspectResultFormatter } from "./terminal-inspect-result-formatter";

@injectable()
export class InspectResultFormatterPicker {
  public constructor(
    private readonly terminalFormatter: TerminalInspectResultFormatter,
    private readonly jsonFormatter: JSONInspectResultFormatter,
  ) {}

  public pick(json: boolean): InspectResultFormatter {
    return json ? this.jsonFormatter : this.terminalFormatter;
  }
}
