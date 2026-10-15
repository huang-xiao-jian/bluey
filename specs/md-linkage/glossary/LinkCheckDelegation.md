# Link Check Delegation

## 1. Definition

A **Link Check Delegation** expresses a maintainer's intent to have Markdown
documents checked for dead links. It is used to assign work to internal workflow.

## 2. Synonyms and Aliases

- Check delegation
- Delegated link check

## 3. Key Attributes

- **Project Root:** The stable frame of reference and containment boundary for
  documents in the check.
- **Document Paths:** The explicit Markdown document paths from which checking
  begins. Each path may be absolute or relative to the project root.
- **Check Mode:** The policy that determines whether the scope is limited to
  the delegated starting documents or may expand through eligible Markdown
  references.

### 3.1 Data Model

```ts
enum LinkCheckMode {
  // limits scope to delegated starting documents;
  Shallow = "shallow",
  // expands scope through eligible local Markdown references.
  Recursive = "recursive",
}

interface LinkCheckDelegation {
  /** Stable project boundary and frame of reference for the check. */
  root: string;
  /** A collection of explicit document paths. */
  files: string[];
  /** Check mode for internal file derivation */
  mode: LinkCheckMode;
}
```

## 4. Rules and Constraints

1. A delegation must provide at least one document path.
2. A delegated document path must be a concrete relative or absolute path, not
   a glob or another match pattern.
3. A relative document path is resolved from `root`.
4. The project root must establish a stable project boundary for the check.

## 5. Relationships

- **Transformation:** The
  [Link Check Scope Builder](../roles/LinkCheckScopeBuilder.md) interprets one
  **Link Check Delegation** to establish one
  [Link Check Scope](./LinkCheckScope.md).
- **Exceptions:** The **Link Check Scope Builder** defines the exceptions
  produced when a delegation cannot satisfy these rules.

## 6. Extension Points

- Support more flexable document match pattern
