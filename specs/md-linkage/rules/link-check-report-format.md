# Link Check Report Rules

These rules define the raw link check report produced by a link check. The raw report is a business result for subsequent delivery, presentation, storage, and other processes. Selection problems are reportable monitoring results rather than reasons to suppress the report.

## Data Model

The following TypeScript type definitions describe the structure of a raw link check report. The field names are report field names used externally; this is the only section in this document that uses TypeScript.

```ts
/** A non-fatal problem encountered while resolving an include selector. */
type LinkCheckScopeIssueType =
  | 'selector-outside-project-root'
  | 'literal-file-not-found'
  | 'literal-file-not-markdown'
  | 'glob-no-match'
  | 'invalid-glob';

interface LinkCheckScopeIssue {
  /** The include selector exactly as supplied in the request. */
  selector: string;
  /** The reason the selector did not contribute files to the check scope. */
  issueType: LinkCheckScopeIssueType;
}

/** The files covered by this check and non-fatal issues found while selecting them. */
interface LinkCheckScope {
  /** Checked file paths, relative to the project root. */
  files: string[];
  /** Problems encountered while resolving include selectors. */
  issues: LinkCheckScopeIssue[];
}

/** The raw result produced by one link check. */
interface LinkCheckReport {
  scope: LinkCheckScope;
  deadLinks: DeadLinkRecord[];
}
```

## Field Descriptions

- **Check scope**: The set of files actually covered by this check.

- **Scope issues**: Non-fatal problems encountered while resolving `include` selectors. Each issue preserves the original selector and identifies why it did not contribute files to the scope.

- **Dead link records**: All dead link records produced by this check. Every record must comply with the [Dead Link Record Reporting Rules](dead-link-record-format.md).

## Business Rules

- A raw link check report records only the check scope, which contains files and selector issues, and dead link records. Subsequent processing derives information such as totals, conclusions, grouping, sorting, and summaries.

- Scope issues do not stop selection or detection. Process every usable include selector and generate a report even when `scope.files` is empty.

- Do not generate a raw report only when the request cannot establish a valid project context or an unexpected failure prevents the check from producing a trustworthy result.

## JSON Example

The following report shows an absolute file selected inside the project root and two non-fatal selector issues.

```json
{
  "scope": {
    "files": ["specs/a.md"],
    "issues": [
      {
        "selector": "/workspace/other/*.md",
        "issueType": "selector-outside-project-root"
      },
      {
        "selector": "specs/missing/*.md",
        "issueType": "glob-no-match"
      }
    ]
  },
  "deadLinks": []
}
```
