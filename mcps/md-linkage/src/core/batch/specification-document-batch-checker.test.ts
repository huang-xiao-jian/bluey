import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { Container } from "inversify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NodeSpecificationDocumentStore } from "../../infrastructure/filesystem/node-specification-document-store";
import { CrossFileAnchorLinkCheckStrategy } from "../document/cross-file-anchor-link-check-strategy";
import { InFileAnchorLinkCheckStrategy } from "../document/in-file-anchor-link-check-strategy";
import { LocalFileLinkCheckStrategy } from "../document/local-file-link-check-strategy";
import { SpecificationDocumentChecker } from "../document/specification-document-checker";
import { SpecificationHeadingCataloger } from "../document/specification-heading-cataloger";
import { SpecificationLinkCheckStrategy } from "../document/specification-link-check-strategy";
import { SpecificationLinkChecker } from "../document/specification-link-checker";
import { SpecificationLinkExtractor } from "../document/specification-link-extractor";
import { LinkCheckDelegation, LinkCheckMode } from "../model/link-check-delegation";
import { LinkCheckScope } from "../model/link-check-scope";
import { SpecificationDocumentStore } from "../ports/specification-document-store";
import { ReferencedDocumentDiscoverer } from "./referenced-document-discoverer";
import { SpecificationDocumentBatchChecker } from "./specification-document-batch-checker";

describe("SpecificationDocumentBatchChecker", () => {
  let root: string;
  let checker: SpecificationDocumentBatchChecker;

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), "md-linkage-batch-"));
    await writeFile(root + "/a.md", "[B](b.md)\n[Missing A](missing-a.md)\n", "utf8");
    await writeFile(root + "/b.md", "[A](a.md)\n[C](c.md)\n[Missing B](missing-b.md)\n", "utf8");
    await writeFile(root + "/c.md", "[Missing C](missing-c.md)\n", "utf8");

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
    container.bind(ReferencedDocumentDiscoverer).toSelf();
    container.bind(SpecificationDocumentBatchChecker).toSelf();
    checker = container.get(SpecificationDocumentBatchChecker);
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it("checks only starting documents in shallow mode", async () => {
    const deadLinks = await checker.check(
      new LinkCheckDelegation(root, ["a.md"], LinkCheckMode.Shallow),
      new LinkCheckScope(["a.md"], []),
    );

    expect(deadLinks.map((result) => result.link.name)).toEqual(["Missing A"]);
  });

  it("recursively checks discovered Markdown documents once in breadth-first order", async () => {
    const deadLinks = await checker.check(
      new LinkCheckDelegation(root, ["a.md"], LinkCheckMode.Recursive),
      new LinkCheckScope(["a.md"], []),
    );

    expect(deadLinks.map((result) => result.link.name)).toEqual([
      "Missing A",
      "Missing B",
      "Missing C",
    ]);
  });
});
