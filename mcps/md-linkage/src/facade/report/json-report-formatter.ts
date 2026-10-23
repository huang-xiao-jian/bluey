import { injectable } from "inversify";
import type { LinkCheckReport } from "../../core/model/link-check-report";
import { ReportFormatter } from "./report-formatter";

@injectable()
export class JsonReportFormatter extends ReportFormatter {
  public format(report: LinkCheckReport): string {
    return JSON.stringify(report, null, 2);
  }
}
