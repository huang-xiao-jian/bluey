import { Container, injectable } from "inversify";
import { ReferencedDocumentDiscoverer } from "../core/batch/referenced-document-discoverer";
import { SpecificationDocumentBatchChecker } from "../core/batch/specification-document-batch-checker";
import { SpecificationDocumentChecker } from "../core/document/specification-document-checker";
import { SpecificationHeadingCataloger } from "../core/document/specification-heading-cataloger";
import { SpecificationLinkChecker } from "../core/document/specification-link-checker";
import { SpecificationLinkExtractor } from "../core/document/specification-link-extractor";
import { SpecificationDocumentStore } from "../core/ports/specification-document-store";
import { LinkCheckScopeBuilder } from "../core/scope/link-check-scope-builder";
import { LinkCheckReportFabricator } from "../core/workflow/link-check-report-fabricator";
import { LinkCheckWorkflowScheduler } from "../core/workflow/link-check-workflow-scheduler";
import { NodeSpecificationDocumentStore } from "../infrastructure/filesystem/node-specification-document-store";

export function createLinkCheckWorkflowScheduler(): LinkCheckWorkflowScheduler {
  const container = new Container();

  container
    .bind(SpecificationDocumentStore)
    .to(NodeSpecificationDocumentStore)
    .inSingletonScope();
  container.bind(SpecificationLinkExtractor).toSelf().inSingletonScope();
  container.bind(SpecificationHeadingCataloger).toSelf().inSingletonScope();
  container.bind(SpecificationLinkChecker).toSelf().inSingletonScope();
  container.bind(SpecificationDocumentChecker).toSelf().inSingletonScope();
  container.bind(ReferencedDocumentDiscoverer).toSelf().inSingletonScope();
  container.bind(SpecificationDocumentBatchChecker).toSelf().inSingletonScope();
  container.bind(LinkCheckScopeBuilder).toSelf().inSingletonScope();
  container.bind(LinkCheckReportFabricator).toSelf().inSingletonScope();
  container.bind(LinkCheckWorkflowScheduler).toSelf().inSingletonScope();

  return container.get(LinkCheckWorkflowScheduler);
}

@injectable()
export class LinkCheckComposition {
  createLinkCheckWorkflowScheduler(): LinkCheckWorkflowScheduler {
    return createLinkCheckWorkflowScheduler();
  }
}
