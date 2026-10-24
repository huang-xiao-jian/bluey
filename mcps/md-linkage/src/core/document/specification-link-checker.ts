import { injectable, multiInject } from "inversify";
import type { ResolvedSpecificationLink } from "../model/resolved-specification-link";
import type { SpecificationDocument } from "../model/specification-document";
import type { SpecificationLink } from "../model/specification-link";
import { SpecificationLinkCheckStrategy } from "./specification-link-check-strategy";

@injectable()
export class SpecificationLinkChecker {
  private readonly strategies: readonly SpecificationLinkCheckStrategy[];

  public constructor(
    @multiInject(SpecificationLinkCheckStrategy)
    strategies: readonly SpecificationLinkCheckStrategy[],
  ) {
    this.strategies = Object.freeze([...strategies]);
  }

  public async check(
    root: string,
    source: SpecificationDocument,
    link: SpecificationLink,
    sourceHeadings: ReadonlyMap<string, string>,
  ): Promise<readonly ResolvedSpecificationLink[]> {
    const resolves = this.strategies
      .filter((strategy) => strategy.supports(link))
      .map((strategy) =>
        strategy.check({ root, source, link, sourceHeadings }),
      );

    const result = await Promise.all(resolves);

    return result.flat();
  }
}
