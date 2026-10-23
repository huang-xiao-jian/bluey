import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NodeSpecificationDocumentStore } from "../../infrastructure/filesystem/node-specification-document-store";
import { ReferencedDocumentDiscoverer } from "../batch/referenced-document-discoverer";
import { SpecificationDocumentBatchChecker } from "../batch/specification-document-batch-checker";
import { SpecificationDocumentChecker } from "../document/specification-document-checker";
import { SpecificationHeadingCataloger } from "../document/specification-heading-cataloger";
import { SpecificationLinkChecker } from "../document/specification-link-checker";
import { SpecificationLinkExtractor } from "../document/specification-link-extractor";
import { LinkCheckDelegation } from "../model/link-check-delegation";
import { LinkCheckScopeBuilder } from "../scope/link-check-scope-builder";
import { LinkCheckReportFabricator } from "./link-check-report-fabricator";
import { LinkCheckWorkflowScheduler } from "./link-check-workflow-scheduler";

describe("LinkCheckWorkflowScheduler", () => {
  let root: string;
  let scheduler: LinkCheckWorkflowScheduler;

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), "md-linkage-workflow-"));
    await writeFile(join(root, "spec.md"), "[Missing](missing.md)\n", "utf8");
    const store = new NodeSpecificationDocumentStore();
    const cataloger = new SpecificationHeadingCataloger();
    scheduler = new LinkCheckWorkflowScheduler(
      new LinkCheckScopeBuilder(store),
      new SpecificationDocumentBatchChecker(
        store,
        new SpecificationDocumentChecker(
          new SpecificationLinkExtractor(),
          cataloger,
          new SpecificationLinkChecker(store, cataloger),
        ),
        new ReferencedDocumentDiscoverer(store),
      ),
      new LinkCheckReportFabricator(),
    );
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
