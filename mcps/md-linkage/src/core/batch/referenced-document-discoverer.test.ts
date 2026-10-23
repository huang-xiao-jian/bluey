import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { NodeSpecificationDocumentStore } from "../../infrastructure/filesystem/node-specification-document-store";
import { ResolvedSpecificationLinkStatus, type LiveResolvedSpecificationLink } from "../model/resolved-specification-link";
import { SpecificationLinkType } from "../model/specification-link";
import { ReferencedDocumentDiscoverer } from "./referenced-document-discoverer";
import { SpecificationDocumentRepository } from "./specification-document-repository";

describe("ReferencedDocumentDiscoverer", () => {
  it("returns new in-root Markdown target identities in link order", () => {
    const root = "/workspace/project";
    const repository = new SpecificationDocumentRepository(["source.md", "known.md"]);
    repository.takeNext();
    const links: LiveResolvedSpecificationLink[] = [
      liveLocal(root, "source.md", "known.md"),
      liveLocal(root, "source.md", "docs/next.md"),
      liveLocal(root, "source.md", "assets/data.json"),
      liveInFile(root, "source.md"),
      liveLocal(root, "source.md", "docs/next.md"),
      liveLocal(root, "source.md", "../outside.md"),
    ];

    const discovered = new ReferencedDocumentDiscoverer(
      new NodeSpecificationDocumentStore(),
    ).discover(root, links, repository);

    expect(discovered).toEqual(["docs/next.md"]);
  });
});

function liveLocal(
  root: string,
  source: string,
  target: string,
): LiveResolvedSpecificationLink {
  return {
    status: ResolvedSpecificationLinkStatus.Live,
    location: { root, filePath: source },
    link: {
      type: SpecificationLinkType.LocalFile,
      text: `[Target](${target})`,
      name: "Target",
      path: target,
    },
    target: { filePath: join(root, target) },
  };
}

function liveInFile(root: string, source: string): LiveResolvedSpecificationLink {
  return {
    status: ResolvedSpecificationLinkStatus.Live,
    location: { root, filePath: source },
    link: {
      type: SpecificationLinkType.InFileAnchor,
      text: "[Heading](#heading)",
      name: "Heading",
      anchor: "heading",
    },
    target: { filePath: join(root, source), anchorId: "heading" },
  };
}
