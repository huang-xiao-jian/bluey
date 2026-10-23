import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NodeSpecificationDocumentStore } from "../../infrastructure/filesystem/node-specification-document-store";
import { SpecificationDocumentChecker } from "../document/specification-document-checker";
import { SpecificationHeadingCataloger } from "../document/specification-heading-cataloger";
import { SpecificationLinkChecker } from "../document/specification-link-checker";
import { SpecificationLinkExtractor } from "../document/specification-link-extractor";
import { LinkCheckDelegation, LinkCheckMode } from "../model/link-check-delegation";
import { LinkCheckScope } from "../model/link-check-scope";
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

    const store = new NodeSpecificationDocumentStore();
    const cataloger = new SpecificationHeadingCataloger();
    checker = new SpecificationDocumentBatchChecker(
      store,
      new SpecificationDocumentChecker(
        new SpecificationLinkExtractor(),
        cataloger,
        new SpecificationLinkChecker(store, cataloger),
      ),
      new ReferencedDocumentDiscoverer(store),
    );
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
