import { inject, injectable } from "inversify";
import type { LinkCheckDelegation } from "../model/link-check-delegation";
import {
  LinkCheckScope,
  LinkCheckScopeIssueType,
  type LinkCheckScopeIssue,
} from "../model/link-check-scope";
import {
  SpecificationDocumentStoreToken,
  type SpecificationDocumentStore,
} from "../ports/specification-document-store";

@injectable()
export class LinkCheckScopeBuilder {
  public constructor(
    @inject(SpecificationDocumentStoreToken)
    private readonly store: SpecificationDocumentStore,
  ) {}

  public async build(delegation: LinkCheckDelegation): Promise<LinkCheckScope> {
    const root = await this.store.establishRoot(delegation.root);
    const files: string[] = [];
    const issues: LinkCheckScopeIssue[] = [];
    const accepted = new Set<string>();

    for (const documentPath of delegation.files) {
      const resolvedPath = this.store.resolvePath(root, documentPath);
      const issueType = await this.findIssue(root, resolvedPath);
      if (issueType) {
        issues.push({ path: documentPath, resolvedPath, issueType });
        continue;
      }

      const identity = this.store.toProjectRelative(root, resolvedPath);
      if (!accepted.has(identity)) {
        accepted.add(identity);
        files.push(identity);
      }
    }

    return new LinkCheckScope(files, issues);
  }

  private async findIssue(
    root: string,
    resolvedPath: string,
  ): Promise<LinkCheckScopeIssueType | undefined> {
    if (!this.store.isWithinRoot(root, resolvedPath)) {
      return LinkCheckScopeIssueType.DocumentOutsideProjectRoot;
    }
    if (!(await this.store.exists(resolvedPath))) {
      return LinkCheckScopeIssueType.DocumentNotFound;
    }
    if (!(await this.store.isFile(resolvedPath)) || !this.store.isMarkdown(resolvedPath)) {
      return LinkCheckScopeIssueType.DocumentNotMarkdown;
    }
    return undefined;
  }
}
