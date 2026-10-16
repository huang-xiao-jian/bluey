# Link Check Delegation

## 1. Definition

A **Link Check Delegation** expresses a maintainer's intent to have Markdown
documents checked for dead links. It is a self-validating data structure used to
assign work to the internal workflow.

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
  readonly root: string;
  /** A collection of explicit document paths. */
  readonly files: readonly string[];
  /** Check mode for internal file derivation. */
  readonly mode: LinkCheckMode;
}
```

## 4. Rules and Constraints

1. `root` must be a non-empty absolute path.
2. `files` must contain at least one document path, each document path must be a non-empty, concrete path string, not a glob.

### 4.1 Exceptions

- **Unsupported Root:**
- **Missing Document Paths:**
- **Unsupported Document Path:**

### 4.2 Exception Strategy

FATAL! BLOCK!

## 5. Relationships

- **Transformation:** The [Link Check Scope Builder](../roles/LinkCheckScopeBuilder.md) interprets **Link Check Delegation** to establish [Link Check Scope](./LinkCheckScope.md).

## 6. Extension Points

None
