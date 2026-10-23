export enum LinkCheckScopeIssueType {
  DocumentOutsideProjectRoot = "document-outside-project-root",
  DocumentNotFound = "document-not-found",
  DocumentNotMarkdown = "document-not-markdown",
}

export interface LinkCheckScopeIssue {
  readonly path: string;
  readonly resolvedPath: string;
  readonly issueType: LinkCheckScopeIssueType;
}

export class LinkCheckScope {
  public readonly files: readonly string[];
  public readonly issues: readonly LinkCheckScopeIssue[];

  public constructor(
    files: readonly string[],
    issues: readonly LinkCheckScopeIssue[],
  ) {
    this.files = Object.freeze([...files]);
    this.issues = Object.freeze(issues.map((issue) => Object.freeze({ ...issue })));
  }
}
