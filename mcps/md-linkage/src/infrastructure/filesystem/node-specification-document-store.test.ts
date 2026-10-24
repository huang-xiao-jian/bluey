import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { Container } from "inversify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NodeSpecificationDocumentStore } from "./node-specification-document-store";

describe("NodeSpecificationDocumentStore", () => {
  let root: string;
  const container = new Container();
  container.bind(NodeSpecificationDocumentStore).toSelf();
  const store = container.get(NodeSpecificationDocumentStore);

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), "md-linkage-store-"));
    await mkdir(join(root, "specs"));
    await writeFile(join(root, "specs", "guide.MD"), "# Guide\n", "utf8");
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it("establishes an existing directory as the stable root", async () => {
    await expect(store.establishRoot(root)).resolves.toBe(root);
  });

  it("rejects a missing project root", async () => {
    await expect(store.establishRoot(join(root, "missing"))).rejects.toThrow(
      "Invalid project root",
    );
  });

  it("resolves and reads a Markdown document", async () => {
    const target = store.resolvePath(root, "specs/guide.MD");

    expect(store.isWithinRoot(root, target)).toBe(true);
    expect(store.isMarkdown(target)).toBe(true);
    await expect(store.exists(target)).resolves.toBe(true);
    await expect(store.isFile(target)).resolves.toBe(true);
    await expect(store.readDocument(root, "specs/guide.MD")).resolves.toEqual({
      filePath: "specs/guide.MD",
      content: "# Guide\n",
    });
  });

  it("recognizes a target outside the project root", () => {
    expect(store.isWithinRoot(root, join(root, "..", "outside.md"))).toBe(false);
  });
});
