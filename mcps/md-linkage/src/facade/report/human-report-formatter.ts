import { injectable } from "inversify";
import type { LinkCheckReport } from "../../core/model/link-check-report";
import { ReportFormatter } from "./report-formatter";

@injectable()
export class HumanReportFormatter extends ReportFormatter {
  public format(report: LinkCheckReport): string {
    const lines = [
      `Documents: ${report.scope.files.length}`,
      `Scope issues: ${report.scope.issues.length}`,
      `Dead links: ${report.deadLinks.length}`,
    ];

    if (report.scope.issues.length > 0) {
      lines.push("", "Scope issues:");
      for (const issue of report.scope.issues) {
        lines.push(`- ${issue.path}: ${issue.issueType} (${issue.resolvedPath})`);
      }
    }

    if (report.deadLinks.length > 0) {
      lines.push("", "Dead links:");
      for (const result of report.deadLinks) {
        const anchor = result.target.anchorId ? `#${result.target.anchorId}` : "";
        lines.push(
          `- ${result.location.filePath}: ${result.link.text} -> ${result.target.filePath}${anchor} (${result.reason})`,
        );
      }
    }

    return lines.join("\n");
  }
}
