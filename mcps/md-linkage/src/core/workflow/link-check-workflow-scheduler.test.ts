import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { Container } from "inversify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NodeSpecificationDocumentStore } from "../../infrastructure/filesystem/node-specification-document-store";
import { ReferencedDocumentDiscoverer } from "../batch/referenced-document-discoverer";
import { SpecificationDocumentBatchChecker } from "../batch/specification-document-batch-checker";
import { CrossFileAnchorLinkCheckStrategy } from "../document/cross-file-anchor-link-check-strategy";
import { InFileAnchorLinkCheckStrategy } from "../document/in-file-anchor-link-check-strategy";
import { LocalFileLinkCheckStrategy } from "../document/local-file-link-check-strategy";
import { SpecificationDocumentChecker } from "../document/specification-document-checker";
import { SpecificationHeadingCataloger } from "../document/specification-heading-cataloger";
import { SpecificationLinkCheckStrategy } from "../document/specification-link-check-strategy";
import { SpecificationLinkChecker } from "../document/specification-link-checker";
import { SpecificationLinkExtractor } from "../document/specification-link-extractor";
import { LinkCheckDelegation } from "../model/link-check-delegation";
import { SpecificationDocumentStore } from "../ports/specification-document-store";
import { LinkCheckScopeBuilder } from "../scope/link-check-scope-builder";
import { LinkCheckReportFabricator } from "./link-check-report-fabricator";
import { LinkCheckWorkflowScheduler } from "./link-check-workflow-scheduler";

describe("LinkCheckWorkflowScheduler", () => {
  let root: string;
  let scheduler: LinkCheckWorkflowScheduler;

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), "md-linkage-workflow-"));
    await writeFile(join(root, "spec.md"), "[Missing](missing.md)\n", "utf8");
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
    container.bind(LinkCheckScopeBuilder).toSelf();
    container.bind(LinkCheckReportFabricator).toSelf();
    container.bind(LinkCheckWorkflowScheduler).toSelf();
    scheduler = container.get(LinkCheckWorkflowScheduler);
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it("produces a traceable report for a completed delegation", async () => {
    const delegation = new LinkCheckDelegation(root, ["spec.md", "missing.md"]);

    const report = await scheduler.run(delegation);

    expect(report.delegation).toBe(delegation);
    expect(report.scope.files).toEqual(["spec.md"]);
    expect(report.scope.issues).toHaveLength(1);
    expect(report.deadLinks.map((link) => link.link.name)).toEqual(["Missing"]);
  });

  it("does not produce a report when the root is invalid", async () => {
    await expect(
      scheduler.run(new LinkCheckDelegation(join(root, "missing"), ["spec.md"])),
    ).rejects.toThrow("Invalid project root");
  });
});
