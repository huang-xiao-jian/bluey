import { injectable } from "inversify";
import type { LinkCheckDelegation } from "../model/link-check-delegation";
import { LinkCheckReport } from "../model/link-check-report";
import type { LinkCheckScope } from "../model/link-check-scope";
import type { DeadResolvedSpecificationLink } from "../model/resolved-specification-link";

@injectable()
export class LinkCheckReportFabricator {
  public fabricate(
    delegation: LinkCheckDelegation,
    scope: LinkCheckScope,
    deadLinks: readonly DeadResolvedSpecificationLink[],
  ): LinkCheckReport {
    return new LinkCheckReport(delegation, scope, deadLinks);
  }
}
