import { isAbsolute } from "node:path";
import { injectable } from "inversify";
import type { LinkCheckDelegation } from "../model/link-check-delegation";
import {
  LinkCheckScope,
  LinkCheckScopeIssueSubjectType,
  LinkCheckScopeIssueType,
  type LinkCheckScopeGlobMatchIssue,
  type LinkCheckScopeGlobPatternIssue,
  type LinkCheckScopeIssue,
  type LinkCheckScopePathIssue,
} from "../model/link-check-scope";
import { SpecificationDocumentStore } from "../ports/specification-document-store";

interface ScopeAccumulator {
  readonly files: string[];
  readonly issues: LinkCheckScopeIssue[];
  readonly accepted: Set<string>;
}

@injectable()
export class LinkCheckScopeBuilder {
  public constructor(
    private readonly store: SpecificationDocumentStore,
  ) {}

  public async build(delegation: LinkCheckDelegation): Promise<LinkCheckScope> {
    const root = await this.store.establishRoot(delegation.root);
    const base = await this.store.establishBase(delegation.base);
    const scope: ScopeAccumulator = {
      files: [],
      issues: [],
      accepted: new Set<string>(),
    };

    for (const input of delegation.files) {
      let isGlobPattern: boolean;
      try {
        isGlobPattern = this.store.isGlobPattern(input);
      } catch {
        scope.issues.push(
          this.globPatternIssue(
            base,
            input,
            LinkCheckScopeIssueType.GlobPatternInvalid,
          ),
        );
        continue;
      }

      if (isGlobPattern) {
        await this.expandGlob(root, base, input, scope);
      } else {
        await this.expandPath(root, base, input, scope);
      }
    }

    return new LinkCheckScope(scope.files, scope.issues);
  }

  private async expandPath(
    root: string,
    base: string,
    input: string,
    scope: ScopeAccumulator,
  ): Promise<void> {
    const resolvedPath = this.store.resolvePath(
      base,
      this.store.unescapePath(input),
    );
    const canonicalPath = await this.store.canonicalize(resolvedPath);
    if (!this.store.isWithinRoot(root, canonicalPath)) {
      scope.issues.push(
        this.pathIssue(
          input,
          canonicalPath,
          LinkCheckScopeIssueType.PathOutsideProjectRoot,
        ),
      );
      return;
    }
    if (!(await this.store.exists(resolvedPath))) {
      scope.issues.push(
        this.pathIssue(input, canonicalPath, LinkCheckScopeIssueType.PathNotFound),
      );
      return;
    }

    if (await this.store.isDirectory(resolvedPath)) {
      const candidates = this.sorted(
        await this.store.listMarkdownFiles(resolvedPath),
      );
      if (candidates.length === 0) {
        scope.issues.push(
          this.pathIssue(
            input,
            resolvedPath,
            LinkCheckScopeIssueType.DirectoryContainsNoMarkdown,
          ),
        );
        return;
      }
      await this.acceptCandidates(root, candidates, scope, (candidate) =>
        this.pathIssue(
          input,
          candidate.canonicalPath,
          LinkCheckScopeIssueType.PathOutsideProjectRoot,
        ),
      );
      return;
    }

    if (
      !(await this.store.isFile(resolvedPath)) ||
      !this.store.isMarkdown(resolvedPath)
    ) {
      scope.issues.push(
        this.pathIssue(
          input,
          resolvedPath,
          LinkCheckScopeIssueType.FileNotMarkdown,
        ),
      );
      return;
    }

    await this.acceptCandidates(root, [resolvedPath], scope, (candidate) =>
      this.pathIssue(
        input,
        candidate.canonicalPath,
        LinkCheckScopeIssueType.PathOutsideProjectRoot,
      ),
    );
  }

  private async expandGlob(
    root: string,
    base: string,
    pattern: string,
    scope: ScopeAccumulator,
  ): Promise<void> {
    if (isAbsolute(pattern)) {
      scope.issues.push(
        this.globPatternIssue(
          base,
          pattern,
          LinkCheckScopeIssueType.GlobPatternInvalid,
        ),
      );
      return;
    }

    let matches: string[];
    try {
      matches = this.sorted(await this.store.matchGlob(base, pattern));
    } catch (error) {
      if (!(error instanceof TypeError || error instanceof RangeError)) {
        throw error;
      }
      scope.issues.push(
        this.globPatternIssue(
          base,
          pattern,
          LinkCheckScopeIssueType.GlobPatternInvalid,
        ),
      );
      return;
    }
    if (matches.length === 0) {
      scope.issues.push(
        this.globPatternIssue(
          base,
          pattern,
          LinkCheckScopeIssueType.GlobPatternNotMatched,
        ),
      );
      return;
    }

    const candidates: string[] = [];
    for (const match of matches) {
      if ((await this.store.isFile(match)) && this.store.isMarkdown(match)) {
        candidates.push(match);
      }
    }
    if (candidates.length === 0) {
      scope.issues.push(
        this.globPatternIssue(
          base,
          pattern,
          LinkCheckScopeIssueType.GlobPatternMatchedNoMarkdown,
        ),
      );
      return;
    }

    await this.acceptCandidates(root, candidates, scope, (candidate) => ({
      subjectType: LinkCheckScopeIssueSubjectType.GlobMatch,
      base,
      pattern,
      matchedPath: candidate.path,
      issueType: LinkCheckScopeIssueType.PathOutsideProjectRoot,
    }));
  }

  private async acceptCandidates(
    root: string,
    candidates: readonly string[],
    scope: ScopeAccumulator,
    outsideIssue: (candidate: { path: string; canonicalPath: string }) =>
      | LinkCheckScopePathIssue
      | LinkCheckScopeGlobMatchIssue,
  ): Promise<void> {
    for (const path of candidates) {
      const canonicalPath = await this.store.canonicalize(path);
      if (!this.store.isWithinRoot(root, canonicalPath)) {
        scope.issues.push(outsideIssue({ path, canonicalPath }));
        continue;
      }
      if (scope.accepted.has(canonicalPath)) continue;

      scope.accepted.add(canonicalPath);
      scope.files.push(this.store.toProjectRelative(root, canonicalPath));
    }
  }

  private pathIssue(
    path: string,
    resolvedPath: string,
    issueType: LinkCheckScopePathIssue["issueType"],
  ): LinkCheckScopePathIssue {
    return {
      subjectType: LinkCheckScopeIssueSubjectType.Path,
      path,
      resolvedPath,
      issueType,
    };
  }

  private globPatternIssue(
    base: string,
    pattern: string,
    issueType: LinkCheckScopeGlobPatternIssue["issueType"],
  ): LinkCheckScopeGlobPatternIssue {
    return {
      subjectType: LinkCheckScopeIssueSubjectType.GlobPattern,
      base,
      pattern,
      issueType,
    };
  }

  private sorted(paths: readonly string[]): string[] {
    return [...paths].sort();
  }
}
