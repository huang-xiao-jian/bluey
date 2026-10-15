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
  filepath: string;
  issueType: LinkCheckScopeIssueType;
}

interface LinkCheckScope {
  files: string[];
  issues: LinkCheckScopeIssue[];
}
```

## 4. Business Rules and Constraints

1. Every file is an eligible Markdown document identified relative to the
   resolved project root.
2. Each document appears at most once in `files`.
3. Each issue preserves the original delegated path and a stable issue type.
4. A document outside the project boundary cannot appear in `files`.
5. The file and issue collections may be empty.
6. The scope remains unchanged after it has been established.

## 5. Relationships

- **Construction:** The
  [Link Check Scope Builder](../roles/LinkCheckScopeBuilder.md) establishes one
  **Link Check Scope** from one **Link Check Delegation**.
- **Issue Semantics:** The **Link Check Scope Builder** defines the path
  exceptions represented by `issues`.
- **Aggregation:** One [Link Check Report](./LinkCheckReport.md) contains the scope as one task descriptor.
