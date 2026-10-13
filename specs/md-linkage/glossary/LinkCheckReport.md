# Link Check Report

## Prerequisite Dependencies

- [Link Check Request](./LinkCheckRequest.md)
- [Dead Link Record](./DeadLinkRecord.md)

## 1. Business Definition

A **Link Check Report** is the raw business result of one completed link check. It records which Markdown files were actually checked, any non-fatal problems encountered while selecting those files, and every dead link found. The report provides stable facts for later delivery, presentation, storage, or analysis.

## 2. Synonyms and Aliases

- Raw link check report
- Dead link report
- Check result

## 3. Key Attributes

- **Check Scope:** The files covered by the check together with any non-fatal selector issues.
- **Checked Files:** The project-relative paths of Markdown files that were actually checked.
- **Scope Issues:** Problems that prevented individual include selectors from contributing files while allowing the check to continue. Each issue preserves the original selector and its stable reason.
- **Dead Link Records:** The complete collection of **Dead Link Records** produced by the check.

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

interface LinkCheckReport {
  scope: LinkCheckScope;
  deadLinks: DeadLinkRecord[];
}
```

## 4. Business Rules and Constraints

1. A **Link Check Report** contains only the check scope and the dead link record collection.
2. The check scope contains every file actually checked and every non-fatal selector issue produced while resolving the request's include selectors.
3. Each scope issue preserves the original selector and uses the issue reason defined by the **Link Check Request** selection rules.
4. Scope issues do not stop file selection or dead link detection. Every usable include selector is processed.
5. An empty checked-file collection is a valid result and still produces a report, including when selectors produce issues or exclusions remove every selected file.
6. Every item in the dead link collection conforms to the **Dead Link Record** definition.
7. The raw report does not derive totals, conclusions, grouping, sorting, or summaries. Those belong to subsequent processing.
8. A report is not produced when the request cannot establish a valid project context or an unexpected failure prevents the check from producing a trustworthy result.

## 5. Relationships

- **Association:** A **Link Check Report** is the result of one successfully completed **Link Check Request**.
- **Aggregation:** A **Link Check Report** aggregates zero or more **Dead Link Records** without changing their contents.

## 6. Scope Boundaries

- **Includes:** Checked-file identities, selector issues, and raw dead link records from one check.
- **Excludes:** Request construction, link repair, output destination, storage behavior, totals, conclusions, grouping, sorting, and summaries.
