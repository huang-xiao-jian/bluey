# Link Check Request

## Prerequisite Dependencies

## 1. Business Definition

A **Link Check Request** expresses the intended boundary and breadth of one
Markdown link check. It identifies the project in which document identities
have meaning, the documents from which checking begins, the documents omitted
from the check, and whether checking may expand through references between
documents.

The request describes what belongs to the check. It does not describe how a
particular interface obtains that intent or how the outcome is presented.

## 2. Synonyms and Aliases

- Check request
- Link check specification

## 3. Key Attributes

- **Project Root:** The stable frame of reference and containment boundary for
  documents in the check.
- **Include Selectors:** Declarations that identify the candidate documents
  from which checking begins.
- **Exclude Selectors:** Declarations that remove documents from both the
  starting scope and any scope discovered through traversal.
- **Check Mode:** The policy that determines whether the scope is limited to
  the selected starting documents or may expand through eligible Markdown
  references.

### 3.1 Data Model

```ts
type LinkCheckMode = "shallow" | "recursive";

interface LinkCheckRequest {
  /** Stable project boundary and frame of reference for the check. */
  projectRoot: string;
  /** Non-empty selectors that identify the starting document candidates. */
  include: string[];
  /** Optional selectors; omission or an empty collection excludes nothing. */
  exclude?: string[];
  /**
   * `shallow` limits scope to selected starting documents; `recursive`
   * expands scope through eligible local Markdown references.
   */
  mode: LinkCheckMode;
}
```

## 4. Business Rules and Constraints

## 5. Relationships

- **Transformation:** One **Link Check Request** is interpreted to establish
  one [Link Check Scope](./LinkCheckScope.md).

## 6. Scope Boundaries

- **Includes:** Project boundary, starting-scope intent, exclusion intent, and
  traversal intent.
- **Excludes:** Interface-specific defaults, request parsing, concrete selector
  syntax, link-validation rules, check results, and report delivery or
  presentation.
