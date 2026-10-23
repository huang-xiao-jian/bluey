import { inject, injectable } from "inversify";
import type { LiveResolvedSpecificationLink } from "../model/resolved-specification-link";
import { SpecificationLinkType } from "../model/specification-link";
import {
  SpecificationDocumentStoreToken,
  type SpecificationDocumentStore,
} from "../ports/specification-document-store";
import type { SpecificationDocumentRepository } from "./specification-document-repository";

@injectable()
export class ReferencedDocumentDiscoverer {
  public constructor(
    @inject(SpecificationDocumentStoreToken)
    private readonly store: SpecificationDocumentStore,
  ) {}

  public discover(
    root: string,
    links: readonly LiveResolvedSpecificationLink[],
    repository: SpecificationDocumentRepository,
  ): readonly string[] {
    const discovered: string[] = [];
    const seen = new Set<string>();

    for (const result of links) {
      if (result.link.type === SpecificationLinkType.InFileAnchor) continue;
      if (!this.store.isWithinRoot(root, result.target.filePath)) continue;
      if (!this.store.isMarkdown(result.target.filePath)) continue;

      const identity = this.store.toProjectRelative(root, result.target.filePath);
      if (!repository.has(identity) && !seen.has(identity)) {
        seen.add(identity);
        discovered.push(identity);
      }
    }

    return discovered;
  }
}
