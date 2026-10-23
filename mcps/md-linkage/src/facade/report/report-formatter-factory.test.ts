import { describe, expect, it } from "vitest";
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
  const formatterFactory = new ReportFormatterFactory(
    new HumanReportFormatter(),
    new JsonReportFormatter(),
  );
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
    expect(formatterFactory.create({}).format(report)).toBe(
      [
        "Documents: 1",
        "Scope issues: 1",
        "Dead links: 1",
        "",
        "Scope issues:",
        "- missing.md: document-not-found (/workspace/project/missing.md)",
        "",
        "Dead links:",
        "- spec.md: [Guide](guide.md) -> /workspace/project/guide.md (file-not-found)",
      ].join("\n"),
    );
  });

  it("selects JSON formatting when requested", () => {
    expect(formatterFactory.create({ json: true }).format(report)).toBe(
      JSON.stringify(report, null, 2),
    );
  });
});
