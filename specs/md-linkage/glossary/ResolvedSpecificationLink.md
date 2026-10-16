# Resolved Specification Link

## Prerequities

- [Specification Link](./SpecificationLink.md)

## 1. Definition

A **Resolved Specification Link** is the traceable result of validating one
supported **Specification Link**. It preserves the authored link and identifies
the resolved target. Its `status` discriminates between the live and dead
variants.

## 2. Synonyms and Aliases

- Resolved link
- Link validation result

## 3. Key Attributes

- **Status:** Whether the resolved link is live or dead.
- **Location:** The project boundary and project-relative path of the Markdown
  document containing the link.
- **Link:** The original **Specification Link** that was validated.
- **Target:** The resolved target file and, when applicable, the anchor used
  for validation and its known heading name.
- **Dead Reason:** For the dead variant only, the reason the target is invalid.

### 3.1 Data Model

- `DeadReason.FileNotFound` means the resolved target file does not exist.
- `DeadReason.AnchorNotFound` applies only when the resolved target file exists
  but the specified anchor does not identify a supported heading in that file.
- `DeadReason.TargetOutsideProjectRoot` means the resolved target path is
  outside the project boundary established by `location.root`.
- Target containment is checked before file or anchor existence. When the
  target is outside the project root, validation stops with
  `DeadReason.TargetOutsideProjectRoot`.
- When a cross-file target does not exist, validation stops with
  `DeadReason.FileNotFound`; it does not also produce an anchor-missing result.

```ts
enum DeadReason {
  FileNotFound = "file-not-found",
  AnchorNotFound = "anchor-not-found",
  TargetOutsideProjectRoot = "target-outside-project-root",
}

enum ResolvedSpecificationLinkStatus {
  Live = "live",
  Dead = "dead",
}

interface ResolvedSpecificationLinkBase {
  /** Identifies the Markdown document that contains the link. */
  readonly location: {
    /** Absolute project boundary established for the link check. */
    readonly root: string;
    /** Path of the source Markdown document, relative to root. */
    readonly filePath: string;
  };
  /** Preserves the original specification link that was validated. */
  readonly link: SpecificationLink;
  /** Identifies the destination used during link validation. */
  readonly target: {
    /** Fully resolved path; resolves to the source file for an in-file anchor. */
    readonly filePath: string;
    /** Normalized anchor ID used when the link specifies an anchor. */
    readonly anchorId?: string;
    /** Human-readable heading name when known without inference. */
    readonly anchorName?: string;
  };
}

interface LiveResolvedSpecificationLink extends ResolvedSpecificationLinkBase {
  readonly status: ResolvedSpecificationLinkStatus.Live;
}

interface DeadResolvedSpecificationLink extends ResolvedSpecificationLinkBase {
  readonly status: ResolvedSpecificationLinkStatus.Dead;
  readonly reason: DeadReason;
}

type ResolvedSpecificationLink =
  | LiveResolvedSpecificationLink
  | DeadResolvedSpecificationLink;
```

#### Example

The following dead variant represents a cross-file link whose target file
exists but whose requested heading does not:

```ts
const example: DeadResolvedSpecificationLink = {
  status: ResolvedSpecificationLinkStatus.Dead,
  location: {
    root: "/workspace/bluey",
    filePath: "specs/md-linkage/spec.md",
  },
  link: {
    type: SpecificationLinkType.CrossFileAnchor,
    text: "[Resolved link](glossary/ResolvedSpecificationLink.md#missing-section)",
    name: "Resolved link",
    path: "glossary/ResolvedSpecificationLink.md",
    anchor: "missing-section",
  },
  target: {
    filePath:
      "/workspace/bluey/specs/md-linkage/glossary/ResolvedSpecificationLink.md",
    anchorId: "missing-section",
  },
  reason: DeadReason.AnchorNotFound,
};
```

## 4. Rules and Constraints

1. Each **Specification Link** produces exactly one **Resolved Specification Link**.
2. Each **Resolved Specification Link** remain unchanged after established.

## 5. Relationships

- **Transformation:** Validation transforms one **Specification Link** into one
  live or dead **Resolved Specification Link** variant.
- **Aggregation:** A [Link Check Report](./LinkCheckReport.md) aggregates zero
  or more dead variants.
