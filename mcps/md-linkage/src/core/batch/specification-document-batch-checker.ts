import { injectable } from "inversify";
import { SpecificationDocumentChecker } from "../document/specification-document-checker";
import { LinkCheckMode, type LinkCheckDelegation } from "../model/link-check-delegation";
import type { LinkCheckScope } from "../model/link-check-scope";
import type { DeadResolvedSpecificationLink } from "../model/resolved-specification-link";
import { SpecificationDocumentStore } from "../ports/specification-document-store";
import { ReferencedDocumentDiscoverer } from "./referenced-document-discoverer";
import { SpecificationDocumentRepository } from "./specification-document-repository";

@injectable()
export class SpecificationDocumentBatchChecker {
  public constructor(
    private readonly store: SpecificationDocumentStore,
    private readonly documentChecker: SpecificationDocumentChecker,
    private readonly discoverer: ReferencedDocumentDiscoverer,
  ) {}

  public async check(
    delegation: LinkCheckDelegation,
    scope: LinkCheckScope,
  ): Promise<readonly DeadResolvedSpecificationLink[]> {
    const root = await this.store.establishRoot(delegation.root);
    const repository = new SpecificationDocumentRepository(scope.files);
    const deadLinks: DeadResolvedSpecificationLink[] = [];

    for (let filePath = repository.takeNext(); filePath; filePath = repository.takeNext()) {
      const document = await this.store.readDocument(root, filePath);
      const artifact = await this.documentChecker.check(root, document);
      deadLinks.push(...artifact.deadLinks);

      if (delegation.mode === LinkCheckMode.Recursive) {
        for (const discovered of this.discoverer.discover(
          root,
          artifact.liveLinks,
          repository,
        )) {
          repository.enqueue(discovered);
        }
      }
    }

    return deadLinks;
  }
}
