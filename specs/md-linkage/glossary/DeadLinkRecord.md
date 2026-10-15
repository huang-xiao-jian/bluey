# Dead Link Record

## Prerequisite Dependencies

- [Specification Link](./SpecificationLink.md)
- [Link Check Report](./LinkCheckReport.md)

## 1. Business Definition

A **Dead Link Record** is the traceable business result produced for one invalid **Specification Link** during a link check. It tells a maintainer where the link exists, what the author wrote, where the link resolves, and which part of that destination could not be found.

## 2. Synonyms and Aliases

- Dead link
- Invalid link record
- Broken link record

## 3. Key Attributes

- **Location:** The project boundary and the path of the Markdown file that contains the invalid link.
- **Link:** The original [Specification Link](./SpecificationLink.md) that failed validation.
- **Target:** The resolved target file path and, when applicable, the anchor ID used for validation and its known heading name.
- **Dead Reason:** The reason the link is invalid: its target file or target anchor could not be found.

### 3.1 Data Model

```ts
enum DeadReason {
  FileNotFound = "file-not-found",
  AnchorNotFound = "anchor-not-found",
}

interface DeadLinkRecord {
  /** Identifies the Markdown document that contains the invalid link. */
  location: {
    /** Absolute project boundary established for the link check. */
    root: string;
    /** Path of the source Markdown document, relative to root. */
    filePath: string;
  };
  /** Preserves the original specification link that failed validation. */
  link: SpecificationLink;
  /** Identifies the destination used during link validation. */
  target: {
    /** Fully resolved filesystem path; resolves to the source file for an in-file anchor. */
    filePath: string;
    /** Normalized anchor ID used for validation when the link specifies an anchor. */
    anchorId?: string;
    /** Human-readable heading name when known without inference. */
    anchorName?: string;
  };
  /** The reason the link is invalid. */
  reason: DeadReason;
}
```

#### Example

The following record represents a cross-file link whose target file exists but whose requested heading does not:

```ts
const example: DeadLinkRecord = {
  location: {
    root: "/workspace/bluey",
    filePath: "specs/md-linkage/spec.md",
  },
  link: {
    type: SpecificationLinkType.CrossFileAnchor,
    text: "[Dead link record](glossary/DeadLinkRecord.md#missing-section)",
    name: "Dead link record",
    path: "glossary/DeadLinkRecord.md",
    anchor: "missing-section",
  },
  target: {
    filePath: "/workspace/bluey/specs/md-linkage/glossary/DeadLinkRecord.md",
    anchorId: "missing-section",
  },
  reason: DeadReason.AnchorNotFound,
};
```

## 4. Business Rules and Constraints

1. Each invalid **Specification Link** produces exactly one **Dead Link Record**.
2. When the resolved target file does not exist, the record uses `DeadReason.FileNotFound`.
3. The record uses `DeadReason.AnchorNotFound` only when the resolved target file exists but the specified anchor does not identify a supported heading in that file.
4. When a cross-file link's target file does not exist, the record uses only `DeadReason.FileNotFound`; anchor validation does not continue and the record does not also use `DeadReason.AnchorNotFound`.

## 5. Relationships

- **Aggregation:** A **Link Check Report** aggregates zero or more **Dead Link Records** produced by its link check.
- **Transformation:** A **Dead Link Record** is produced from one invalid **Specification Link** and preserves that link unchanged.

## 6. Scope Boundaries

- **Includes:** The source location, original and parsed Markdown link, resolved target, and reason for one invalid link.
- **Excludes:** Delegated document-path problems, valid links, repair
  instructions, derived statistics, grouping, sorting, and presentation
  details.
