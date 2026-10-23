import { stripVTControlCharacters } from "node:util";
import chalk from "chalk";
import { afterEach, describe, expect, it } from "vitest";
import { LinkCheckDelegation } from "../../core/model/link-check-delegation";
import { LinkCheckReport } from "../../core/model/link-check-report";
import {
  LinkCheckScope,
  LinkCheckScopeIssueType,
} from "../../core/model/link-check-scope";
import {
  DeadReason,
  ResolvedSpecificationLinkStatus,
} from "../../core/model/resolved-specification-link";
import { SpecificationLinkType } from "../../core/model/specification-link";
import { HumanReportFormatter } from "./human-report-formatter";
import { JsonReportFormatter } from "./json-report-formatter";
import { ReportFormatterFactory } from "./report-formatter-factory";

describe("ReportFormatterFactory", () => {
  const colorLevel = chalk.level;
  const formatterFactory = new ReportFormatterFactory(
    new HumanReportFormatter(),
    new JsonReportFormatter(),
  );

  afterEach(() => {
    chalk.level = colorLevel;
  });
  const delegation = new LinkCheckDelegation("/workspace/project", ["spec.md"]);
  const report = new LinkCheckReport(
    delegation,
    new LinkCheckScope(["spec.md"], [
      {
        path: "missing.md",
        resolvedPath: "/workspace/project/missing.md",
        issueType: LinkCheckScopeIssueType.DocumentNotFound,
      },
    ]),
    [
      {
        status: ResolvedSpecificationLinkStatus.Dead,
        location: { root: "/workspace/project", filePath: "spec.md" },
        link: {
          type: SpecificationLinkType.LocalFile,
          text: "[Guide](guide.md)",
          name: "Guide",
          path: "guide.md",
        },
        target: { filePath: "/workspace/project/guide.md" },
        reason: DeadReason.FileNotFound,
      },
    ],
  );

  it("selects human formatting by default", () => {
    expect(
      stripVTControlCharacters(formatterFactory.create({}).format(report)),
    ).toBe(
      [
        "🔗 Markdown Link Check  FAIL",
        "",
        "Root       /workspace/project",
        "Mode       shallow",
        "Documents  1",
        "Scope      1 issue",
        "Links      1 dead",
        "",
        "SCOPE ISSUES (1)",
        "  DOCUMENT NOT FOUND",
        "  missing.md",
        "  Resolved to: /workspace/project/missing.md",
        "",
        "DEAD LINKS (1)",
        "  FILE NOT FOUND",
        "  Source: spec.md",
        "  Link:   [Guide](guide.md)",
        "  Target: /workspace/project/guide.md",
      ].join("\n"),
    );
  });

  it("selects JSON formatting when requested", () => {
    expect(formatterFactory.create({ json: true }).format(report)).toBe(
      JSON.stringify(report, null, 2),
    );
  });

  it("themes failed reports when terminal colors are enabled", () => {
    chalk.level = 1;

    const output = formatterFactory.create({}).format(report);

    expect(output).toContain("\u001B[31m");
    expect(output).toContain("\u001B[33m");
  });

  it("highlights a clean report at a glance", () => {
    chalk.level = 1;
    const cleanReport = new LinkCheckReport(
      delegation,
      new LinkCheckScope(["spec.md"], []),
      [],
    );

    const output = formatterFactory.create({}).format(cleanReport);

    expect(stripVTControlCharacters(output)).toBe(
      [
        "🔗 Markdown Link Check  PASS",
        "",
        "Root       /workspace/project",
        "Mode       shallow",
        "Documents  1",
        "Scope      0 issues",
        "Links      0 dead",
        "",
        "✓ No link issues found.",
      ].join("\n"),
    );
    expect(output).toContain("\u001B[32m");
  });

  it("separates consecutive findings with one blank line", () => {
    const reportWithMultipleFindings = new LinkCheckReport(
      delegation,
      new LinkCheckScope(
        ["spec.md"],
        [
          ...report.scope.issues,
          {
            path: "notes.txt",
            resolvedPath: "/workspace/project/notes.txt",
            issueType: LinkCheckScopeIssueType.DocumentNotMarkdown,
          },
        ],
      ),
      [
        ...report.deadLinks,
        {
          status: ResolvedSpecificationLinkStatus.Dead,
          location: { root: "/workspace/project", filePath: "spec.md" },
          link: {
            type: SpecificationLinkType.CrossFileAnchor,
            text: "[Intro](guide.md#intro)",
            name: "Intro",
            path: "guide.md",
            anchor: "#intro",
          },
          target: {
            filePath: "/workspace/project/guide.md",
            anchorId: "intro",
          },
          reason: DeadReason.AnchorNotFound,
        },
      ],
    );

    const output = stripVTControlCharacters(
      formatterFactory.create({}).format(reportWithMultipleFindings),
    );

    expect(output).toContain(
      [
        "  Resolved to: /workspace/project/missing.md",
        "",
        "  DOCUMENT NOT MARKDOWN",
        "  notes.txt",
        "  Resolved to: /workspace/project/notes.txt",
        "",
        "DEAD LINKS (2)",
      ].join("\n"),
    );
    expect(output).toContain(
      [
        "  Target: /workspace/project/guide.md",
        "",
        "  ANCHOR NOT FOUND",
        "  Source: spec.md",
        "  Link:   [Intro](guide.md#intro)",
        "  Target: /workspace/project/guide.md#intro",
      ].join("\n"),
    );
  });
});
