import { describe, expect, it } from "vitest";
import { LinkCheckMode } from "../../core/model/link-check-delegation";
import { LinkCheckReport } from "../../core/model/link-check-report";
import { LinkCheckScope } from "../../core/model/link-check-scope";
import {
  CheckSpecificationLinksInputSchema,
  createCheckSpecificationLinksTool,
} from "./check-specification-links";

describe("CheckSpecificationLinksInputSchema", () => {
  it("requires an absolute root and defaults to shallow mode", () => {
    expect(
      CheckSpecificationLinksInputSchema.parse({
        root: "/workspace/project",
        files: ["spec.md"],
      }),
    ).toEqual({
      root: "/workspace/project",
      files: ["spec.md"],
      mode: LinkCheckMode.Shallow,
    });
  });

  it.each([
    { root: "relative", files: ["spec.md"] },
    { root: "", files: ["spec.md"] },
    { root: "/workspace", files: [] },
    { root: "/workspace", files: [""] },
    { root: "/workspace", files: ["**/*.md"] },
    { root: "/workspace", files: ["spec.md"], mode: "deep" },
  ])("rejects invalid input %#", (input) => {
    expect(CheckSpecificationLinksInputSchema.safeParse(input).success).toBe(false);
  });
});

describe("check_specification_links callback", () => {
  it("maps input to a delegation and returns a structured report with counts", async () => {
    const tool = createCheckSpecificationLinksTool({
      async checkSpecificationLinks(delegation) {
        return new LinkCheckReport(
          delegation,
          new LinkCheckScope(delegation.files, []),
          [],
        );
      },
    });

    const result = await tool.callback({
      root: "/workspace/project",
      files: ["spec.md"],
      mode: LinkCheckMode.Recursive,
    });

    expect(result.report.delegation).toEqual({
      root: "/workspace/project",
      files: ["spec.md"],
      mode: LinkCheckMode.Recursive,
    });
    expect(result.summary).toBe("Documents: 1; scope issues: 0; dead links: 0");
  });
});
