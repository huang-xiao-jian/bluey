import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import chalk from "chalk";
import { injectable } from "inversify";
import type { LinkCheckReport } from "../../core/model/link-check-report";
import {
  LinkCheckScopeIssueSubjectType,
  type LinkCheckScopeIssue,
} from "../../core/model/link-check-scope";
import {
  ReportFormatter,
  type ReportFormatterOptions,
} from "./report-formatter";

@injectable()
export class HumanReportFormatter extends ReportFormatter {
  public format(
    report: LinkCheckReport,
    options: ReportFormatterOptions = {},
  ): string {
    const hasFailures =
      report.scope.issues.length > 0 || report.deadLinks.length > 0;
    const status = hasFailures
      ? chalk.red.bold("FAIL")
      : chalk.green.bold("PASS");
    const lines = [
      `${chalk.cyan.bold("🔗 Markdown Link Check")}  ${status}`,
      "",
      this.summary("Root", report.delegation.root),
      this.summary("Mode", report.delegation.mode),
      this.summary("Documents", chalk.bold(String(report.scope.files.length))),
      this.summary(
        "Scope",
        this.findingCount(report.scope.issues.length, "issue", chalk.yellow),
      ),
      this.summary(
        "Links",
        this.findingCount(report.deadLinks.length, "dead", chalk.red),
      ),
    ];

    if (!hasFailures) {
      lines.push("", chalk.green.bold("✓ No link issues found."));
    }

    if (report.scope.issues.length > 0) {
      lines.push(
        "",
        chalk.yellow.bold(`SCOPE ISSUES (${report.scope.issues.length})`),
      );
      for (const [index, issue] of report.scope.issues.entries()) {
        if (index > 0) {
          lines.push("");
        }
        lines.push(
          `  ${chalk.yellow.bold(this.title(issue.issueType))}`,
          ...this.scopeIssueDetails(issue),
        );
      }
    }

    if (report.deadLinks.length > 0) {
      lines.push("", chalk.red.bold(`DEAD LINKS (${report.deadLinks.length})`));
      for (const [index, result] of report.deadLinks.entries()) {
        if (index > 0) {
          lines.push("");
        }
        const anchor = result.target.anchorId ? `#${result.target.anchorId}` : "";
        lines.push(
          `  ${chalk.red.bold(this.title(result.reason))}`,
          `  ${chalk.dim("Source:")} ${this.sourceFile(result.location, options)}`,
          `  ${chalk.dim("Link:  ")} ${result.link.text}`,
          `  ${chalk.dim("Target:")} ${result.target.filePath}${anchor}`,
        );
      }
    }

    return lines.join("\n");
  }

  private findingCount(
    value: number,
    label: string,
    color: (text: string) => string,
  ): string {
    const count = `${value} ${label}${value === 1 || label === "dead" ? "" : "s"}`;
    return value === 0 ? chalk.green(count) : color(count);
  }

  private summary(label: string, value: string): string {
    return `${chalk.bold(label.padEnd(11))}${value}`;
  }

  private scopeIssueDetails(issue: LinkCheckScopeIssue): string[] {
    switch (issue.subjectType) {
      case LinkCheckScopeIssueSubjectType.Path:
        return [
          `  ${issue.path}`,
          `  ${chalk.dim("Resolved to:")} ${chalk.dim(issue.resolvedPath)}`,
        ];
      case LinkCheckScopeIssueSubjectType.GlobPattern:
        return [
          `  ${chalk.dim("Pattern:")} ${issue.pattern}`,
          `  ${chalk.dim("Base:   ")} ${chalk.dim(issue.base)}`,
        ];
      case LinkCheckScopeIssueSubjectType.GlobMatch:
        return [
          `  ${chalk.dim("Pattern:")} ${issue.pattern}`,
          `  ${chalk.dim("Matched:")} ${chalk.dim(issue.matchedPath)}`,
          `  ${chalk.dim("Base:   ")} ${chalk.dim(issue.base)}`,
        ];
    }
  }

  private title(value: string): string {
    return value.replaceAll("-", " ").toUpperCase();
  }

  private sourceFile(
    location: { readonly root: string; readonly filePath: string },
    options: ReportFormatterOptions,
  ): string {
    if (!options.hyperlinks) return location.filePath;

    const target = pathToFileURL(resolve(location.root, location.filePath)).href;
    return `\u001B]8;;${target}\u001B\\${location.filePath}\u001B]8;;\u001B\\`;
  }
}
