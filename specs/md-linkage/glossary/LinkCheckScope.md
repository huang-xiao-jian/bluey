# Link Check Scope

## Prerequisites

- [Link Check Delegation](./LinkCheckDelegation.md)

## 1. Definition

A **Link Check Scope** is the formal internal representation for internal link check workflow .

## 2. Synonyms and Aliases

- Check scope
- Effective link check scope
- Document check scope

## 3. Key Attributes

- **Files:** Project-relative identities of the starting documents supplied to
  the check.
- **Issues:** Delegated document paths that encountered a path exception
  defined by the
  [Link Check Scope Builder](../roles/LinkCheckScopeBuilder.md#32-path-exceptions).

### 3.1 Data Model

```ts
enum LinkCheckScopeIssueType {
  DocumentOutsideProjectRoot = "document-outside-project-root",
  DocumentNotFound = "document-not-found",
  DocumentNotMarkdown = "document-not-markdown",
}

interface LinkCheckScopeIssue {
  // the original document path
  path: string;
  // the resolved absolute path
  resolvedPath: string;
  // the cause for issue
  issueType: LinkCheckScopeIssueType;
}

interface LinkCheckScope {
  readonly files: readonly string[];
  readonly issues: Readonly<LinkCheckScopeIssue>[];
}
```

## 4. Rules and Constraints

1. The scope remains unchanged after it has been established.
2. A resolved path with issues should not appear in `files`.
3. The resolved path in `files` is unique

## 5. Relationships

- **Aggregation:** [Link Check Report](./LinkCheckReport.md) contains the scope as one task descriptor.
