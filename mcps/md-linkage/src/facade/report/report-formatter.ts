import type { LinkCheckReport } from "../../core/model/link-check-report";

export enum ReportFormat {
  Human = "human",
  Json = "json",
}

export abstract class ReportFormatter {
  public abstract format(
    report: LinkCheckReport,
    options?: ReportFormatterOptions,
  ): string;
}

export interface ReportFormatterOptions {
  readonly json?: boolean;
  readonly hyperlinks?: boolean;
}
