import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createLinkCheckWorkflowScheduler } from "../../composition/link-check-composition";
import { LinkCheckMode } from "../../core/model/link-check-delegation";
import {
  CheckSpecificationLinksInputSchema,
  createCheckSpecificationLinksTool,
} from "./check-specification-links";

const projectRoot = join(
  import.meta.dirname,
  "../../../tests/e2e/__fixtures__/project",
);

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
    { root: "/workspace", files: ["spec.md"], mode: "deep" },
  ])("rejects invalid input %#", (input) => {
    expect(CheckSpecificationLinksInputSchema.safeParse(input).success).toBe(false);
  });

  it("accepts file, directory, and glob input strings", () => {
    expect(
      CheckSpecificationLinksInputSchema.safeParse({
        root: "/workspace",
        files: ["spec.md", "guides", "**/*.md"],
      }).success,
    ).toBe(true);
  });
});

describe("check_specification_links callback", () => {
  it("maps input to a delegation and returns a structured report with counts", async () => {
    const tool = createCheckSpecificationLinksTool(
      createLinkCheckWorkflowScheduler(),
    );

    const result = await tool.callback({
      root: projectRoot,
      files: ["clean.md"],
      mode: LinkCheckMode.Recursive,
    });

    expect(result.report.delegation).toEqual({
      root: projectRoot,
      base: projectRoot,
      files: ["clean.md"],
      mode: LinkCheckMode.Recursive,
    });
    expect(result.summary).toBe("Documents: 1; scope issues: 0; dead links: 0");
  });

  it("returns discriminated glob scope issues", async () => {
    const tool = createCheckSpecificationLinksTool(
      createLinkCheckWorkflowScheduler(),
    );

    const result = await tool.callback({
      root: projectRoot,
      files: ["missing/**/*.md"],
      mode: LinkCheckMode.Shallow,
    });

    expect(result.report.scope.issues).toEqual([
      {
        subjectType: "glob-pattern",
        base: projectRoot,
        pattern: "missing/**/*.md",
        issueType: "glob-pattern-not-matched",
      },
    ]);
  });
});
