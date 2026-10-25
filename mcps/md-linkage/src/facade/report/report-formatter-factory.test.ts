import { stripVTControlCharacters } from "node:util";
import chalk from "chalk";
import { Container } from "inversify";
import { afterEach, describe, expect, it } from "vitest";
import { LinkCheckDelegation } from "../../core/model/link-check-delegation";
import { LinkCheckReport } from "../../core/model/link-check-report";
import {
  LinkCheckScope,
  LinkCheckScopeIssueSubjectType,
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
  const container = new Container();
  container.bind(HumanReportFormatter).toSelf();
  container.bind(JsonReportFormatter).toSelf();
  container.bind(ReportFormatterFactory).toSelf();
  const formatterFactory = container.get(ReportFormatterFactory);

  afterEach(() => {
    chalk.level = colorLevel;
  });
  const delegation = new LinkCheckDelegation("/workspace/project", ["spec.md"]);
  const report = new LinkCheckReport(
    delegation,
    new LinkCheckScope(["spec.md"], [
      {
        subjectType: LinkCheckScopeIssueSubjectType.Path,
        path: "missing.md",
        resolvedPath: "/workspace/project/missing.md",
        issueType: LinkCheckScopeIssueType.PathNotFound,
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
        "  PATH NOT FOUND",
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
            subjectType: LinkCheckScopeIssueSubjectType.Path,
            path: "notes.txt",
            resolvedPath: "/workspace/project/notes.txt",
            issueType: LinkCheckScopeIssueType.FileNotMarkdown,
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
        "  FILE NOT MARKDOWN",
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

  it("formats glob pattern and glob match issue details", () => {
    const reportWithGlobIssues = new LinkCheckReport(
      delegation,
      new LinkCheckScope([], [
        {
          subjectType: LinkCheckScopeIssueSubjectType.GlobPattern,
          base: "/workspace/project",
          pattern: "missing/**/*.md",
          issueType: LinkCheckScopeIssueType.GlobPatternNotMatched,
        },
        {
          subjectType: LinkCheckScopeIssueSubjectType.GlobMatch,
          base: "/workspace/project",
          pattern: "../outside/**/*.md",
          matchedPath: "/workspace/outside/spec.md",
          issueType: LinkCheckScopeIssueType.PathOutsideProjectRoot,
        },
      ]),
      [],
    );

    const output = stripVTControlCharacters(
      formatterFactory.create({}).format(reportWithGlobIssues),
    );

    expect(output).toContain(
      [
        "  GLOB PATTERN NOT MATCHED",
        "  Pattern: missing/**/*.md",
        "  Base:    /workspace/project",
        "",
        "  PATH OUTSIDE PROJECT ROOT",
        "  Pattern: ../outside/**/*.md",
        "  Matched: /workspace/outside/spec.md",
        "  Base:    /workspace/project",
      ].join("\n"),
    );
  });
});
