import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NodeSpecificationDocumentStore } from "../../infrastructure/filesystem/node-specification-document-store";
import { DeadReason, ResolvedSpecificationLinkStatus } from "../model/resolved-specification-link";
import { SpecificationDocument } from "../model/specification-document";
import { SpecificationLinkType } from "../model/specification-link";
import { SpecificationHeadingCataloger } from "./specification-heading-cataloger";
import { SpecificationLinkChecker } from "./specification-link-checker";

describe("SpecificationLinkChecker", () => {
  let root: string;
  let checker: SpecificationLinkChecker;
  let source: SpecificationDocument;

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), "md-linkage-checker-"));
    await mkdir(join(root, "docs"));
    await writeFile(join(root, "docs", "target.md"), "# Target Heading\n", "utf8");
    source = new SpecificationDocument("spec.md", "# Source Heading\n");
    checker = new SpecificationLinkChecker(
      new NodeSpecificationDocumentStore(),
      new SpecificationHeadingCataloger(),
    );
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it("resolves live in-file and cross-file anchors with heading names", async () => {
    const sourceHeadings = new SpecificationHeadingCataloger().catalog(source.content);
    const inFile = await checker.check(
      root,
      source,
      {
        type: SpecificationLinkType.InFileAnchor,
        text: "[Source](#source-heading)",
        name: "Source",
        anchor: "source-heading",
      },
      sourceHeadings,
    );
    const crossFile = await checker.check(
      root,
      source,
      {
        type: SpecificationLinkType.CrossFileAnchor,
        text: "[Target](docs/target.md#target-heading)",
        name: "Target",
        path: "docs/target.md",
        anchor: "target-heading",
      },
      sourceHeadings,
    );

    expect(inFile).toMatchObject({
      status: ResolvedSpecificationLinkStatus.Live,
      target: {
        filePath: join(root, "spec.md"),
        anchorId: "source-heading",
        anchorName: "Source Heading",
      },
    });
    expect(crossFile).toMatchObject({
      status: ResolvedSpecificationLinkStatus.Live,
      target: {
        filePath: join(root, "docs", "target.md"),
        anchorId: "target-heading",
        anchorName: "Target Heading",
      },
    });
  });

  it("applies containment, existence, and anchor checks in precedence order", async () => {
    const headings = new Map<string, string>();
    const outside = await checker.check(
      root,
      source,
      {
        type: SpecificationLinkType.LocalFile,
        text: "[Outside](../missing.md)",
        name: "Outside",
        path: "../missing.md",
      },
      headings,
    );
    const missing = await checker.check(
      root,
      source,
      {
        type: SpecificationLinkType.CrossFileAnchor,
        text: "[Missing](docs/missing.md#section)",
        name: "Missing",
        path: "docs/missing.md",
        anchor: "section",
      },
      headings,
    );
    const missingAnchor = await checker.check(
      root,
      source,
      {
        type: SpecificationLinkType.CrossFileAnchor,
        text: "[Missing heading](docs/target.md#missing)",
        name: "Missing heading",
        path: "docs/target.md",
        anchor: "missing",
      },
      headings,
    );

    expect(outside).toMatchObject({
      status: ResolvedSpecificationLinkStatus.Dead,
      reason: DeadReason.TargetOutsideProjectRoot,
    });
    expect(missing).toMatchObject({
      status: ResolvedSpecificationLinkStatus.Dead,
      reason: DeadReason.FileNotFound,
    });
    expect(missingAnchor).toMatchObject({
      status: ResolvedSpecificationLinkStatus.Dead,
      reason: DeadReason.AnchorNotFound,
    });
  });
});
