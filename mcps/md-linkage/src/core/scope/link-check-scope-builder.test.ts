import {
  mkdtemp,
  mkdir,
  realpath,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { Container } from "inversify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NodeSpecificationDocumentStore } from "../../infrastructure/filesystem/node-specification-document-store";
import { LinkCheckDelegation } from "../model/link-check-delegation";
import { SpecificationDocumentStore } from "../ports/specification-document-store";
import { LinkCheckScopeBuilder } from "./link-check-scope-builder";

describe("LinkCheckScopeBuilder", () => {
  let root: string;
  let outside: string;
  const container = new Container();
  container
    .bind(SpecificationDocumentStore)
    .to(NodeSpecificationDocumentStore);
  container.bind(LinkCheckScopeBuilder).toSelf();
  const builder = container.get(LinkCheckScopeBuilder);

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), "md-linkage-scope-"));
    outside = await mkdtemp(join(tmpdir(), "md-linkage-outside-"));
    root = await realpath(root);
    outside = await realpath(outside);
    await mkdir(join(root, "specs", "nested"), { recursive: true });
    await mkdir(join(root, "empty"));
    await writeFile(join(root, "specs", "a.md"), "# A\n", "utf8");
    await writeFile(join(root, "specs", "nested", "b.md"), "# B\n", "utf8");
    await writeFile(join(root, "notes.txt"), "notes\n", "utf8");
    await writeFile(join(root, "notes[1].md"), "# Notes\n", "utf8");
    await writeFile(join(root, ".hidden.md"), "# Hidden\n", "utf8");
    await writeFile(join(outside, "outside.md"), "# Outside\n", "utf8");
    await symlink(join(root, "specs", "a.md"), join(root, "inside-link.md"));
    await symlink(outside, join(root, "linked-directory"));
  });

  afterEach(async () => {
    await Promise.all([
      rm(root, { recursive: true, force: true }),
      rm(outside, { recursive: true, force: true }),
    ]);
  });

  it("preserves valid file order while deduplicating identities", async () => {
    const scope = await builder.build(
      new LinkCheckDelegation(root, [
        "specs/a.md",
        join(root, "specs", "a.md"),
      ]),
    );

    expect(scope.files).toEqual(["specs/a.md"]);
    expect(scope.issues).toEqual([]);
  });

  it("records every tolerated concrete path issue in delegated order", async () => {
    const paths = [
      join(outside, "outside.md"),
      "missing.md",
      "notes.txt",
      "empty",
    ];
    const scope = await builder.build(new LinkCheckDelegation(root, paths));

    expect(scope.files).toEqual([]);
    expect(scope.issues).toEqual([
      {
        subjectType: "path",
        path: paths[0],
        resolvedPath: paths[0],
        issueType: "path-outside-project-root",
      },
      {
        subjectType: "path",
        path: paths[1],
        resolvedPath: join(root, paths[1]),
        issueType: "path-not-found",
      },
      {
        subjectType: "path",
        path: paths[2],
        resolvedPath: join(root, paths[2]),
        issueType: "file-not-markdown",
      },
      {
        subjectType: "path",
        path: paths[3],
        resolvedPath: join(root, paths[3]),
        issueType: "directory-contains-no-markdown",
      },
    ]);
  });

  it("expands directories recursively without following directory symbolic links", async () => {
    const scope = await builder.build(new LinkCheckDelegation(root, ["."]));

    expect(scope.files).toEqual([
      "specs/a.md",
      "notes[1].md",
      "specs/nested/b.md",
    ]);
    expect(scope.issues).toEqual([]);
  });

  it("expands glob patterns without hidden files and reports unmatched patterns", async () => {
    const scope = await builder.build(
      new LinkCheckDelegation(root, ["**/*.md", "missing/**/*.md"]),
    );

    expect(scope.files).toEqual([
      "specs/a.md",
      "notes[1].md",
      "specs/nested/b.md",
    ]);
    expect(scope.issues).toEqual([
      {
        subjectType: "glob-pattern",
        base: root,
        pattern: "missing/**/*.md",
        issueType: "glob-pattern-not-matched",
      },
    ]);
  });

  it("preserves character-class glob semantics for ordinary directories", async () => {
    const scope = await builder.build(
      new LinkCheckDelegation(root, ["[s]pecs/*.md"]),
    );

    expect(scope.files).toEqual(["specs/a.md"]);
    expect(scope.issues).toEqual([]);
  });

  it("treats leading exclamation and hash characters with glob semantics", async () => {
    await Promise.all([
      mkdir(join(root, "!docs")),
      mkdir(join(root, "#docs")),
      mkdir(join(root, "other")),
    ]);
    await Promise.all([
      writeFile(join(root, "!docs", "a.md"), "# A\n", "utf8"),
      writeFile(join(root, "#docs", "b.md"), "# B\n", "utf8"),
      writeFile(join(root, "other", "c.md"), "# C\n", "utf8"),
    ]);

    const scope = await builder.build(
      new LinkCheckDelegation(root, [
        "!docs/*.md",
        "#docs/*.md",
        "!(specs)/*.md",
      ]),
    );

    expect(scope.files).toEqual([
      "!docs/a.md",
      "#docs/b.md",
      "other/c.md",
    ]);
    expect(scope.issues).toEqual([]);
  });

  it("does not follow directory symbolic links matched by glob segments", async () => {
    const patterns = [
      "linked-directory/**/*.md",
      "[l]inked-directory/*.md",
      "{linked-directory,missing}/*.md",
    ];

    const scope = await builder.build(new LinkCheckDelegation(root, patterns));

    expect(scope.files).toEqual([]);
    expect(scope.issues).toEqual(
      patterns.map((pattern) => ({
        subjectType: "glob-pattern",
        base: root,
        pattern,
        issueType: "glob-pattern-not-matched",
      })),
    );
  });

  it("reports glob matches that contain no Markdown files without expanding directories", async () => {
    const scope = await builder.build(
      new LinkCheckDelegation(root, ["*.txt", "sp*"]),
    );

    expect(scope.files).toEqual([]);
    expect(scope.issues).toEqual([
      {
        subjectType: "glob-pattern",
        base: root,
        pattern: "*.txt",
        issueType: "glob-pattern-matched-no-markdown",
      },
      {
        subjectType: "glob-pattern",
        base: root,
        pattern: "sp*",
        issueType: "glob-pattern-matched-no-markdown",
      },
    ]);
  });

  it("rejects absolute glob patterns", async () => {
    const pattern = join(root, "**/*.md");

    const scope = await builder.build(new LinkCheckDelegation(root, [pattern]));

    expect(scope.files).toEqual([]);
    expect(scope.issues).toEqual([
      {
        subjectType: "glob-pattern",
        base: root,
        pattern,
        issueType: "glob-pattern-invalid",
      },
    ]);
  });

  it("records invalid glob patterns and continues expanding later inputs", async () => {
    const pattern = "*".repeat(65_537);

    const scope = await builder.build(
      new LinkCheckDelegation(root, [pattern, "specs/a.md"]),
    );

    expect(scope.files).toEqual(["specs/a.md"]);
    expect(scope.issues).toEqual([
      {
        subjectType: "glob-pattern",
        base: root,
        pattern,
        issueType: "glob-pattern-invalid",
      },
    ]);
  });

  it("reports Markdown glob matches outside the project root", async () => {
    const scope = await builder.build(
      new LinkCheckDelegation(root, ["*.md"], undefined, outside),
    );

    expect(scope.files).toEqual([]);
    expect(scope.issues).toEqual([
      {
        subjectType: "glob-match",
        base: outside,
        pattern: "*.md",
        matchedPath: join(outside, "outside.md"),
        issueType: "path-outside-project-root",
      },
    ]);
  });

  it("treats escaped glob characters as a concrete path", async () => {
    const scope = await builder.build(
      new LinkCheckDelegation(root, [String.raw`notes\[1\].md`]),
    );

    expect(scope.files).toEqual(["notes[1].md"]);
    expect(scope.issues).toEqual([]);
  });

  it("accepts file symbolic links within root and rejects targets outside root", async () => {
    await symlink(join(outside, "outside.md"), join(root, "outside-link.md"));

    const scope = await builder.build(
      new LinkCheckDelegation(root, ["inside-link.md", "outside-link.md"]),
    );

    expect(scope.files).toEqual(["specs/a.md"]);
    expect(scope.issues).toEqual([
      {
        subjectType: "path",
        path: "outside-link.md",
        resolvedPath: join(outside, "outside.md"),
        issueType: "path-outside-project-root",
      },
    ]);
  });

  it("fails when the project root cannot be established", async () => {
    const delegation = new LinkCheckDelegation(join(root, "missing"), ["a.md"]);

    await expect(builder.build(delegation)).rejects.toThrow("Invalid project root");
  });

  it("fails when the input base cannot be established", async () => {
    const delegation = new LinkCheckDelegation(
      root,
      ["specs/a.md"],
      undefined,
      join(root, "missing"),
    );

    await expect(builder.build(delegation)).rejects.toThrow("Invalid input base");
  });
});
