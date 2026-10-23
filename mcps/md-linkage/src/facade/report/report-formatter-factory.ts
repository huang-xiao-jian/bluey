import { inject, injectable, named } from "inversify";
import {
  ReportFormat,
  ReportFormatter,
  type ReportFormatterOptions,
} from "./report-formatter";

@injectable()
export class ReportFormatterFactory {
  public constructor(
    @inject(ReportFormatter)
    @named(ReportFormat.Human)
    private readonly humanFormatter: ReportFormatter,
    @inject(ReportFormatter)
    @named(ReportFormat.Json)
    private readonly jsonFormatter: ReportFormatter,
  ) {}

  public create(options: ReportFormatterOptions): ReportFormatter {
    return options.json ? this.jsonFormatter : this.humanFormatter;
  }
}
