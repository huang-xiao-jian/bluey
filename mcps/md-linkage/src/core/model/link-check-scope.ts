export enum LinkCheckScopeIssueSubjectType {
  Path = "path",
  GlobPattern = "glob-pattern",
  GlobMatch = "glob-match",
}

export enum LinkCheckScopeIssueType {
  PathOutsideProjectRoot = "path-outside-project-root",
  PathNotFound = "path-not-found",
  FileNotMarkdown = "file-not-markdown",
  DirectoryContainsNoMarkdown = "directory-contains-no-markdown",
  GlobPatternInvalid = "glob-pattern-invalid",
  GlobPatternNotMatched = "glob-pattern-not-matched",
  GlobPatternMatchedNoMarkdown = "glob-pattern-matched-no-markdown",
}

export interface LinkCheckScopePathIssue {
  readonly subjectType: LinkCheckScopeIssueSubjectType.Path;
  readonly path: string;
  readonly resolvedPath: string;
  readonly issueType:
    | LinkCheckScopeIssueType.PathOutsideProjectRoot
    | LinkCheckScopeIssueType.PathNotFound
    | LinkCheckScopeIssueType.FileNotMarkdown
    | LinkCheckScopeIssueType.DirectoryContainsNoMarkdown;
}

export interface LinkCheckScopeGlobPatternIssue {
  readonly subjectType: LinkCheckScopeIssueSubjectType.GlobPattern;
  readonly base: string;
  readonly pattern: string;
  readonly issueType:
    | LinkCheckScopeIssueType.GlobPatternInvalid
    | LinkCheckScopeIssueType.GlobPatternNotMatched
    | LinkCheckScopeIssueType.GlobPatternMatchedNoMarkdown;
}

export interface LinkCheckScopeGlobMatchIssue {
  readonly subjectType: LinkCheckScopeIssueSubjectType.GlobMatch;
  readonly base: string;
  readonly pattern: string;
  readonly matchedPath: string;
  readonly issueType: LinkCheckScopeIssueType.PathOutsideProjectRoot;
}

export type LinkCheckScopeIssue =
  | LinkCheckScopePathIssue
  | LinkCheckScopeGlobPatternIssue
  | LinkCheckScopeGlobMatchIssue;

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
