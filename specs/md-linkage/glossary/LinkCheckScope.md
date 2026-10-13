# Link Check Scope

## Prerequisite Dependencies

- [Link Check Request](./LinkCheckRequest.md)

## 1. Business Definition

A **Link Check Scope** is the formal internal representation of the initial
documents supplied to one link check and the include selectors that could not
contribute documents.

It represents both outcomes of interpreting the request: eligible selector
matches become starting files, while unusable or unmatched include selectors
become scope issues. Once established, the scope provides the materials from
which link checking begins.

## 2. Synonyms and Aliases

- Check scope
- Effective link check scope
- Document check scope

## 3. Key Attributes

- **Files:** Project-relative identities of the starting documents supplied to
  the check.
- **Issues:** Include selectors that contributed no documents because they
  could not be interpreted or satisfied, together with their reasons.

### 3.1 Data Model

```ts
type LinkCheckScopeIssueType =
  | "selector-outside-project-root"
  | "literal-file-not-found"
  | "literal-file-not-markdown"
  | "glob-no-match"
  | "invalid-glob";

interface LinkCheckScopeIssue {
  selector: string;
  issueType: LinkCheckScopeIssueType;
}

interface LinkCheckScope {
  files: string[];
  issues: LinkCheckScopeIssue[];
}
```

## 4. Business Rules and Constraints

1. Each include selector is evaluated independently.
2. Every eligible Markdown document matched by an include selector contributes
   its project-relative identity to `files`.
3. An include selector that cannot contribute a document produces an issue
   that preserves the original selector and its stable reason.
4. A selector issue does not prevent other selectors from contributing
   documents.
5. Excluded documents do not enter the scope and do not produce scope issues
   merely because they were excluded.
6. Multiple selectors that identify the same document contribute one file.
7. A document outside the project boundary cannot enter the scope.
8. An empty file collection is a valid scope.
9. Every file identity is relative to the resolved project root.
10. The scope remains unchanged after it has been established.

## 5. Relationships

- **Transformation:** One **Link Check Request** is interpreted to establish
  one **Link Check Scope**.
- **Input:** A link check uses one **Link Check Scope** as its initial material.
- **Aggregation:** One [Link Check Report](./LinkCheckReport.md) contains the
  scope without changing it.

## 6. Scope Boundaries

- **Includes:** Selector outcomes, starting-document membership, deduplication,
  and non-fatal selection issues.
- **Excludes:** External request construction, recursive document discovery,
  link validation, the complete set of checked documents, dead link records,
  report delivery, and report presentation.
