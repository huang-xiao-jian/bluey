import { injectable } from "inversify";
import { SpecificationDocumentBatchChecker } from "../batch/specification-document-batch-checker";
import type { LinkCheckDelegation } from "../model/link-check-delegation";
import type { LinkCheckReport } from "../model/link-check-report";
import { LinkCheckScopeBuilder } from "../scope/link-check-scope-builder";
import { LinkCheckReportFabricator } from "./link-check-report-fabricator";

@injectable()
export class LinkCheckWorkflowScheduler {
  public constructor(
    private readonly scopeBuilder: LinkCheckScopeBuilder,
    private readonly batchChecker: SpecificationDocumentBatchChecker,
    private readonly reportFabricator: LinkCheckReportFabricator,
  ) {}

  public async run(delegation: LinkCheckDelegation): Promise<LinkCheckReport> {
    const scope = await this.scopeBuilder.build(delegation);
    const deadLinks = await this.batchChecker.check(delegation, scope);
    return this.reportFabricator.fabricate(delegation, scope, deadLinks);
  }
}
