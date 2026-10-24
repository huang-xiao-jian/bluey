import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { Container } from "inversify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NodeSpecificationDocumentStore } from "../../infrastructure/filesystem/node-specification-document-store";
import { DeadReason, ResolvedSpecificationLinkStatus } from "../model/resolved-specification-link";
import { SpecificationDocument } from "../model/specification-document";
import { SpecificationLinkType } from "../model/specification-link";
import { SpecificationDocumentStore } from "../ports/specification-document-store";
import { CrossFileAnchorLinkCheckStrategy } from "./cross-file-anchor-link-check-strategy";
import { InFileAnchorLinkCheckStrategy } from "./in-file-anchor-link-check-strategy";
import { LocalFileLinkCheckStrategy } from "./local-file-link-check-strategy";
import { SpecificationHeadingCataloger } from "./specification-heading-cataloger";
import { SpecificationLinkCheckStrategy } from "./specification-link-check-strategy";
import { SpecificationLinkChecker } from "./specification-link-checker";

describe("SpecificationLinkChecker", () => {
  let root: string;
  let checker: SpecificationLinkChecker;
  let headingCataloger: SpecificationHeadingCataloger;
  let source: SpecificationDocument;

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), "md-linkage-checker-"));
    await mkdir(join(root, "docs"));
    await writeFile(join(root, "docs", "target.md"), "# Target Heading\n", "utf8");
    source = new SpecificationDocument("spec.md", "# Source Heading\n");
    const container = new Container();
    container
      .bind(SpecificationDocumentStore)
      .to(NodeSpecificationDocumentStore);
    container.bind(SpecificationHeadingCataloger).toSelf();
    container
      .bind(SpecificationLinkCheckStrategy)
      .to(InFileAnchorLinkCheckStrategy);
    container
      .bind(SpecificationLinkCheckStrategy)
      .to(LocalFileLinkCheckStrategy);
    container
      .bind(SpecificationLinkCheckStrategy)
      .to(CrossFileAnchorLinkCheckStrategy);
    container.bind(SpecificationLinkChecker).toSelf();
    checker = container.get(SpecificationLinkChecker);
    headingCataloger = container.get(SpecificationHeadingCataloger);
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it("resolves live in-file and cross-file anchors with heading names", async () => {
    const sourceHeadings = headingCataloger.catalog(source.content);
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

    expect(inFile).toMatchObject([
      {
        status: ResolvedSpecificationLinkStatus.Live,
        target: {
          filePath: join(root, "spec.md"),
          anchorId: "source-heading",
          anchorName: "Source Heading",
        },
      },
    ]);
    expect(crossFile).toMatchObject([
      {
        status: ResolvedSpecificationLinkStatus.Live,
        target: {
          filePath: join(root, "docs", "target.md"),
          anchorId: "target-heading",
          anchorName: "Target Heading",
        },
      },
    ]);
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

    expect(outside).toMatchObject([
      {
        status: ResolvedSpecificationLinkStatus.Dead,
        reason: DeadReason.TargetOutsideProjectRoot,
      },
    ]);
    expect(missing).toMatchObject([
      {
        status: ResolvedSpecificationLinkStatus.Dead,
        reason: DeadReason.FileNotFound,
      },
    ]);
    expect(missingAnchor).toMatchObject([
      {
        status: ResolvedSpecificationLinkStatus.Dead,
        reason: DeadReason.AnchorNotFound,
      },
    ]);
  });

  it("checks local files and missing in-file anchors", async () => {
    const headings = new Map<string, string>();
    const liveFile = await checker.check(
      root,
      source,
      {
        type: SpecificationLinkType.LocalFile,
        text: "[Target](docs/target.md)",
        name: "Target",
        path: "docs/target.md",
      },
      headings,
    );
    const missingFile = await checker.check(
      root,
      source,
      {
        type: SpecificationLinkType.LocalFile,
        text: "[Missing](docs/missing.md)",
        name: "Missing",
        path: "docs/missing.md",
      },
      headings,
    );
    const missingAnchor = await checker.check(
      root,
      source,
      {
        type: SpecificationLinkType.InFileAnchor,
        text: "[Missing](#missing)",
        name: "Missing",
        anchor: "missing",
      },
      headings,
    );

    expect(liveFile).toMatchObject([
      {
        status: ResolvedSpecificationLinkStatus.Live,
        target: { filePath: join(root, "docs", "target.md") },
      },
    ]);
    expect(missingFile).toMatchObject([
      {
        status: ResolvedSpecificationLinkStatus.Dead,
        reason: DeadReason.FileNotFound,
      },
    ]);
    expect(missingAnchor).toMatchObject([
      {
        status: ResolvedSpecificationLinkStatus.Dead,
        reason: DeadReason.AnchorNotFound,
      },
    ]);
  });

  it("returns no results when no strategy matches", async () => {
    const container = new Container();
    container
      .bind(SpecificationDocumentStore)
      .to(NodeSpecificationDocumentStore);
    container
      .bind(SpecificationLinkCheckStrategy)
      .to(InFileAnchorLinkCheckStrategy);
    container.bind(SpecificationLinkChecker).toSelf();
    const checkerWithoutMatchingStrategy = container.get(SpecificationLinkChecker);

    const results = await checkerWithoutMatchingStrategy.check(
      root,
      source,
      {
        type: SpecificationLinkType.LocalFile,
        text: "[Target](docs/target.md)",
        name: "Target",
        path: "docs/target.md",
      },
      new Map(),
    );

    expect(results).toEqual([]);
  });

});
