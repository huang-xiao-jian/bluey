import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { Container } from "inversify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NodeSpecificationDocumentStore } from "../../infrastructure/filesystem/node-specification-document-store";
import { ResolvedSpecificationLinkStatus } from "../model/resolved-specification-link";
import { SpecificationDocument } from "../model/specification-document";
import { SpecificationDocumentStore } from "../ports/specification-document-store";
import { CrossFileAnchorLinkCheckStrategy } from "./cross-file-anchor-link-check-strategy";
import { InFileAnchorLinkCheckStrategy } from "./in-file-anchor-link-check-strategy";
import { LocalFileLinkCheckStrategy } from "./local-file-link-check-strategy";
import { SpecificationDocumentChecker } from "./specification-document-checker";
import { SpecificationHeadingCataloger } from "./specification-heading-cataloger";
import { SpecificationLinkCheckStrategy } from "./specification-link-check-strategy";
import { SpecificationLinkChecker } from "./specification-link-checker";
import { SpecificationLinkExtractor } from "./specification-link-extractor";

describe("SpecificationDocumentChecker", () => {
  let root: string;
  let checker: SpecificationDocumentChecker;

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), "md-linkage-document-"));
    const container = new Container();
    container
      .bind(SpecificationDocumentStore)
      .to(NodeSpecificationDocumentStore);
    container.bind(SpecificationLinkExtractor).toSelf();
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
    container.bind(SpecificationDocumentChecker).toSelf();
    checker = container.get(SpecificationDocumentChecker);
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it("checks every supported link once and separates live and dead outcomes", async () => {
    const document = new SpecificationDocument(
      "spec.md",
      [
        "# Existing",
        "[Live](#existing)",
        "[First missing](first.md)",
        "[Web](https://example.com)",
        "[Second missing](second.md)",
      ].join("\n\n"),
    );

    const artifact = await checker.check(root, document);

    expect(artifact.liveLinks).toHaveLength(1);
    expect(artifact.liveLinks[0]?.status).toBe(ResolvedSpecificationLinkStatus.Live);
    expect(artifact.deadLinks.map((result) => result.link.name)).toEqual([
      "First missing",
      "Second missing",
    ]);
  });

  it("returns empty collections for a document without supported links", async () => {
    const artifact = await checker.check(
      root,
      new SpecificationDocument("spec.md", "# No links\n"),
    );

    expect(artifact).toEqual({ liveLinks: [], deadLinks: [] });
  });
});
