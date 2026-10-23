import type { LinkCheckDelegation } from "./link-check-delegation";
import type { LinkCheckScope } from "./link-check-scope";
import type { DeadResolvedSpecificationLink } from "./resolved-specification-link";

export class LinkCheckReport {
  public readonly deadLinks: readonly DeadResolvedSpecificationLink[];

  public constructor(
    public readonly delegation: LinkCheckDelegation,
    public readonly scope: LinkCheckScope,
    deadLinks: readonly DeadResolvedSpecificationLink[],
  ) {
    this.deadLinks = Object.freeze([...deadLinks]);
  }
}
