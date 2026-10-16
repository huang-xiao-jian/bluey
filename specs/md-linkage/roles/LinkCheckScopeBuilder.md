# Link Check Scope Builder

## Prerequities

- [Link Check Scope](../glossary/LinkCheckScope.md)

## 1. Definition

A **Link Check Scope Builder** should:

- interprets [Link Check Delegation](../glossary/LinkCheckDelegation.md)
- establishes [Link Check Scope](../glossary/LinkCheckScope.md).

## 2. Inputs and Outcomes

- **Input:** One established **Link Check Delegation**
- **Successful Outcome:** One **Link Check Scope**, which may contain no files and may contain document-path issues.
- **Exceptional Outcome:** A FATAL exception prevents a scope from being established

## 3. Exception

The builder obtains project and document facts through its repository boundary.
The builder does not duplicate the **Link Check Delegation**'s data validation.

### 3.1 Fatal Exceptions

- **Invalid Project Root:** The delegated root cannot be resolved into a stable project boundary.

### 3.2 Tolerant Exceptions

- **Document Outside Project Root:** The delegated path resolves outside the
  project boundary and contributes a `DocumentOutsideProjectRoot` issue.
- **Document Not Found:** The delegated path does not identify an existing
  document and contributes a `DocumentNotFound` issue.
- **Document Not Markdown:** The delegated path identifies an existing target
  that is not a Markdown document and contributes a `DocumentNotMarkdown`
  issue.

The builder records the corresponding issue and continues evaluating the remaining delegated paths in their supplied order.

## 4. Scope Construction Algorithm

1. Establish the stable project boundary from the delegated project root.
   Otherwise, produce the **Invalid Project Root** exception.
2. Start with an empty file collection and an empty issue collection.
3. Evaluate each delegated document path independently and in its supplied order:
   1. Resolve a relative path from the project root; preserve an absolute pathfor containment evaluation.
   2. If the resolved path is outside the project boundary, add a
      `DocumentOutsideProjectRoot` issue and continue with the next path.
   3. If the resolved path identifies no existing document, add a
      `DocumentNotFound` issue and continue with the next path.
   4. If the resolved target is not a Markdown document, add a
      `DocumentNotMarkdown` issue and continue with the next path.
   5. Derive the document's project-relative identity and add it to the file
      collection if it is not already present.
4. Establish the **Link Check Scope** from the collected files and issues,
   including when the file collection is empty.
