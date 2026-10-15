# Link Check Scope Builder

## 1. Role

A **Link Check Scope Builder** interprets one
[Link Check Delegation](../glossary/LinkCheckDelegation.md) and establishes one
[Link Check Scope](../glossary/LinkCheckScope.md). It is the authoritative
definition of the exceptions and algorithm involved in scope construction.

## 2. Inputs and Outcomes

- **Input:** One complete **Link Check Delegation**.
- **Successful Outcome:** One **Link Check Scope**, which may contain no files
  and may contain document-path issues.
- **Exceptional Outcome:** A delegation exception prevents a scope from being
  established, while a path exception contributes an issue to the resulting
  scope and does not stop evaluation of the remaining paths.

## 3. Exceptions

### 3.1 Delegation Exceptions

- **Missing Document Paths:** The delegation provides no document path.
- **Unsupported Document Path:** A document path is neither relative nor
  absolute, or it is a glob or another match pattern rather than a concrete
  path.
- **Invalid Project Root:** The project root cannot establish a stable project
  boundary for the check.

A delegation exception prevents the builder from establishing a scope.

### 3.2 Path Exceptions

- **Document Outside Project Root:** The delegated path resolves outside the
  project boundary and contributes a `DocumentOutsideProjectRoot` issue.
- **Document Not Found:** The delegated path does not identify an existing
  document and contributes a `DocumentNotFound` issue.
- **Document Not Markdown:** The delegated path identifies an existing target
  that is not a Markdown document and contributes a `DocumentNotMarkdown`
  issue.

A path exception does not prevent other delegated paths from contributing
documents or issues to the scope.

## 4. Scope Construction Algorithm

1. Confirm that the delegation provides at least one document path. Otherwise,
   produce the **Missing Document Paths** exception.
2. Confirm that every document path is a concrete relative or absolute path.
   Otherwise, produce the **Unsupported Document Path** exception.
3. Establish the stable project boundary from the delegated project root.
   Otherwise, produce the **Invalid Project Root** exception.
4. Begin with an empty file collection and an empty issue collection.
5. Evaluate each delegated document path independently and in its supplied
   order:
   1. Resolve a relative path from the project root; preserve an absolute path
      for containment evaluation.
   2. If the resolved path is outside the project boundary, add a
      `DocumentOutsideProjectRoot` issue and continue with the next path.
   3. If the resolved path identifies no existing document, add a
      `DocumentNotFound` issue and continue with the next path.
   4. If the resolved target is not a Markdown document, add a
      `DocumentNotMarkdown` issue and continue with the next path.
   5. Derive the document's project-relative identity and add it to the file
      collection if it is not already present.
6. Establish the **Link Check Scope** from the collected files and issues,
   including when the file collection is empty.

## 5. Scope Boundaries

- **Includes:** Delegation validation, project-boundary establishment, starting
  document selection, path-exception classification, and scope construction.
- **Excludes:** Recursive reference traversal, dead-link detection, report
  creation, and report delivery.
