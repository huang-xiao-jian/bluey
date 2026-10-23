import { createApplicationContainer } from "../composition/create-application-container";
import type { LinkCheckDelegation } from "../core/model/link-check-delegation";
import type { LinkCheckReport } from "../core/model/link-check-report";
import { LinkCheckWorkflowScheduler } from "../core/workflow/link-check-workflow-scheduler";

export class MarkdownLinkage {
  private readonly scheduler: LinkCheckWorkflowScheduler;

  public constructor() {
    this.scheduler = createApplicationContainer().get(
      LinkCheckWorkflowScheduler,
    );
  }

  public async checkSpecificationLinks(
    delegation: LinkCheckDelegation,
  ): Promise<LinkCheckReport> {
    return this.scheduler.run(delegation);
  }
}

export type MarkdownLinkageCapabilities = Pick<
  MarkdownLinkage,
  "checkSpecificationLinks"
>;
