import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { Container } from "inversify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NodeSpecificationDocumentStore } from "../../infrastructure/filesystem/node-specification-document-store";
import { LinkCheckDelegation } from "../model/link-check-delegation";
import { LinkCheckScopeIssueType } from "../model/link-check-scope";
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
    await mkdir(join(root, "specs"));
    await writeFile(join(root, "specs", "a.md"), "# A\n", "utf8");
    await writeFile(join(root, "notes.txt"), "notes\n", "utf8");
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

  it("records every tolerated path issue in delegated order", async () => {
    const paths = [
      join(outside, "outside.md"),
      "missing.md",
      "notes.txt",
      "specs",
    ];
    const scope = await builder.build(new LinkCheckDelegation(root, paths));

    expect(scope.files).toEqual([]);
    expect(scope.issues.map((issue) => [issue.path, issue.issueType])).toEqual([
      [paths[0], LinkCheckScopeIssueType.DocumentOutsideProjectRoot],
      [paths[1], LinkCheckScopeIssueType.DocumentNotFound],
      [paths[2], LinkCheckScopeIssueType.DocumentNotMarkdown],
      [paths[3], LinkCheckScopeIssueType.DocumentNotMarkdown],
    ]);
  });

  it("fails when the project root cannot be established", async () => {
    const delegation = new LinkCheckDelegation(join(root, "missing"), ["a.md"]);

    await expect(builder.build(delegation)).rejects.toThrow("Invalid project root");
  });
});
