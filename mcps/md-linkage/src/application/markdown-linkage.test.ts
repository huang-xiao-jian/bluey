import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { LinkCheckDelegation } from "../core/model/link-check-delegation";
import { MarkdownLinkage } from "./markdown-linkage";

const projectRoot = join(
  import.meta.dirname,
  "../../tests/e2e/__fixtures__/project",
);

describe("MarkdownLinkage", () => {
  it("checks specification links through the composed core workflow", async () => {
    const markdownLinkage = new MarkdownLinkage();

    const report = await markdownLinkage.checkSpecificationLinks(
      new LinkCheckDelegation(projectRoot, ["clean.md"]),
    );

    expect(report.delegation.root).toBe(projectRoot);
    expect(report.scope.files).toEqual(["clean.md"]);
    expect(report.deadLinks).toEqual([]);
  });
});
