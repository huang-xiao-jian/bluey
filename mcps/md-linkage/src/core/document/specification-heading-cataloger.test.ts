import { describe, expect, it } from "vitest";
import { SpecificationHeadingCataloger } from "./specification-heading-cataloger";

describe("SpecificationHeadingCataloger", () => {
  it("catalogs GitHub-compatible identifiers and duplicate suffixes", () => {
    const content = [
      "# Getting *Started*!",
      "## Getting Started!",
      "## 权限控制",
      "### Section 3.1",
    ].join("\n\n");

    expect([...new SpecificationHeadingCataloger().catalog(content)]).toEqual([
      ["getting-started", "Getting Started!"],
      ["getting-started-1", "Getting Started!"],
      ["权限控制", "权限控制"],
      ["section-31", "Section 3.1"],
    ]);
  });
});
