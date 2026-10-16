# Link Check Report

## Prerequities

- [Link Check Delegation](./LinkCheckDelegation.md)
- [Link Check Scope](./LinkCheckScope.md)
- [Dead Link Record](./DeadLinkRecord.md)

## 1. Definition

A **Link Check Report** is the raw business result of one completed link check.
It records the initial Markdown documents delegated to the check, any non-fatal
problems encountered while resolving those documents, every document actually
checked, and every dead link found. The report provides stable facts for later
delivery, presentation, storage, or analysis.

## 2. Synonyms and Aliases

- Raw link check report
- Dead link report
- Check result

## 3. Key Attributes

- **Check Scope:** The starting files supplied to the check together with any
  non-fatal document-path issues.
- **Starting Files:** The project-relative paths of Markdown files from which
  checking began.
- **Checked Files:** The project-relative paths of every Markdown file whose
  contents were checked.
- **Scope Issues:** The document-path issues preserved from the established
  **Link Check Scope**.
- **Dead Link Records:** The complete collection of **Dead Link Records** produced by the check.

### 3.1 Data Model

```ts
interface LinkCheckReport {
  scope: LinkCheckScope;
  /** Project-relative identities of all documents actually checked. */
  checkedFiles: string[];
  deadLinks: DeadLinkRecord[];
}
```

## 4. Business Rules and Constraints

1. A **Link Check Report** contains only the check scope, the checked-file
   collection, and the dead link record collection.
2. The check scope conforms to the [Link Check Scope](./LinkCheckScope.md)
   concept.
3. Each scope issue preserves the original document path and uses the reason
   defined by the
   [Link Check Scope Builder](../roles/LinkCheckScopeBuilder.md#32-path-exceptions).
4. The report preserves every scope issue unchanged.
5. An empty starting-file collection is a valid result and still produces a
   report, including when every delegated path produces an issue.
6. Every starting file appears in the checked-file collection.
7. In `shallow` mode, the checked-file collection contains exactly the
   starting files.
8. In `recursive` mode, the checked-file collection also contains every
   eligible Markdown document discovered and checked through local references.
9. Each checked file appears once and is identified relative to the resolved
   project root.
10. Every item in the dead link collection conforms to the **Dead Link Record**
    definition.
11. The raw report does not derive totals, conclusions, grouping, sorting, or
    summaries. Those belong to subsequent processing.
12. A report is not produced when the delegation cannot establish a valid
    project context or an unexpected failure prevents the check from producing
    a trustworthy result.

## 5. Relationships

- **Association:** A **Link Check Report** is the result of one successfully
  completed **Link Check Delegation**.
- **Aggregation:** A **Link Check Report** contains one **Link Check Scope**
  without changing its contents.
- **Aggregation:** A **Link Check Report** aggregates zero or more **Dead Link Records** without changing their contents.

## 6. Scope Boundaries

- **Includes:** Starting-file identities, document-path issues, checked-file
  identities, and raw dead link records from one check.
- **Excludes:** Delegation construction, link repair, output destination,
  storage behavior, totals, conclusions, grouping, sorting, and summaries.
