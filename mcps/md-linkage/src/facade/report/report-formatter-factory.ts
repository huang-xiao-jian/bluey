import { injectable } from "inversify";
import { HumanReportFormatter } from "./human-report-formatter";
import { JsonReportFormatter } from "./json-report-formatter";
import { ReportFormatter, type ReportFormatterOptions } from "./report-formatter";

@injectable()
export class ReportFormatterFactory {
  public constructor(
    private readonly humanFormatter: HumanReportFormatter,
    private readonly jsonFormatter: JsonReportFormatter,
  ) {}

  public create(options: ReportFormatterOptions): ReportFormatter {
    return options.json ? this.jsonFormatter : this.humanFormatter;
  }
}
