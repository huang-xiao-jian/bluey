import { injectable } from "inversify";
import {
  ResolvedSpecificationLinkStatus,
  type DeadResolvedSpecificationLink,
  type LiveResolvedSpecificationLink,
} from "../model/resolved-specification-link";
import type { SpecificationDocument } from "../model/specification-document";
import { SpecificationHeadingCataloger } from "./specification-heading-cataloger";
import { SpecificationLinkChecker } from "./specification-link-checker";
import { SpecificationLinkExtractor } from "./specification-link-extractor";

export interface AtomicLinkCheckArtifact {
  readonly liveLinks: readonly LiveResolvedSpecificationLink[];
  readonly deadLinks: readonly DeadResolvedSpecificationLink[];
}

@injectable()
export class SpecificationDocumentChecker {
  public constructor(
    private readonly extractor: SpecificationLinkExtractor,
    private readonly headingCataloger: SpecificationHeadingCataloger,
    private readonly linkChecker: SpecificationLinkChecker,
  ) {}

  public async check(
    root: string,
    document: SpecificationDocument,
  ): Promise<AtomicLinkCheckArtifact> {
    const liveLinks: LiveResolvedSpecificationLink[] = [];
    const deadLinks: DeadResolvedSpecificationLink[] = [];
    const headings = this.headingCataloger.catalog(document.content);

    for (const link of this.extractor.extract(document)) {
      const result = await this.linkChecker.check(root, document, link, headings);
      if (result.status === ResolvedSpecificationLinkStatus.Live) {
        liveLinks.push(result);
      } else {
        deadLinks.push(result);
      }
    }

    return { liveLinks, deadLinks };
  }
}
