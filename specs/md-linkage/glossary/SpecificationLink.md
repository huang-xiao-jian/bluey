# Specification Link

## 1. Definition

A **Specification Link** is an original link extracted from a specific markdown document. It preserves what the author wrote and identifies the supported link form before any target is resolved or validated.

## 2. Key Attributes

- **Type:** Identifies whether the link targets a local file, an anchor in its source document, or an anchor in another file.
- **Text:** The complete Markdown link exactly as authored.
- **Name:** The visible link text.
- **Path:** The authored target-file path for a local-file or cross-file-anchor link.
- **Anchor:** The authored anchor for an in-file-anchor or cross-file-anchor link.

### 3.1 Data Model

```ts
enum SpecificationLinkType {
  LocalFile = "local-file",
  InFileAnchor = "in-file-anchor",
  CrossFileAnchor = "cross-file-anchor",
}

interface LocalFileSpecificationLink {
  type: SpecificationLinkType.LocalFile;
  /** Complete Markdown link exactly as authored. */
  text: string;
  /** Visible link text. */
  name: string;
  /** Authored target-file path. */
  path: string;
}

interface InFileAnchorSpecificationLink {
  type: SpecificationLinkType.InFileAnchor;
  /** Complete Markdown link exactly as authored. */
  text: string;
  /** Visible link text. */
  name: string;
  /** Authored anchor in the source document. */
  anchor: string;
}

interface CrossFileAnchorSpecificationLink {
  type: SpecificationLinkType.CrossFileAnchor;
  /** Complete Markdown link exactly as authored. */
  text: string;
  /** Visible link text. */
  name: string;
  /** Authored target-file path. */
  path: string;
  /** Authored anchor in the target file. */
  anchor: string;
}

type SpecificationLink =
  | LocalFileSpecificationLink
  | InFileAnchorSpecificationLink
  | CrossFileAnchorSpecificationLink;
```

### Data Model Examples

```ts
const localFileLink: LocalFileSpecificationLink = {
  type: SpecificationLinkType.LocalFile,
  text: "[Technical design](../design.md)",
  name: "Technical design",
  path: "../design.md",
};

const inFileAnchorLink: InFileAnchorSpecificationLink = {
  type: SpecificationLinkType.InFileAnchor,
  text: "[Business rules](#business-rules)",
  name: "Business rules",
  anchor: "business-rules",
};

const crossFileAnchorLink: CrossFileAnchorSpecificationLink = {
  type: SpecificationLinkType.CrossFileAnchor,
  text: "[Data model](./ResolvedSpecificationLink.md#31-data-model)",
  name: "Data model",
  path: "./ResolvedSpecificationLink.md",
  anchor: "31-data-model",
};
```

## 3. Rules and Constraints

1. A supported link extracted from a specification document is represented by exactly one **Specification Link**.
2. A **Specification Link** remain unchanged after established
3. A **Specification Link** exists before validation and represents the same authored material whether its target is valid or invalid.

## 4. Relationships

- **Aggregation:** A Markdown specification document contains zero or more **Specification Links**.
- **Transformation:** Validation transforms a **Specification Link** into one
  live or dead [Resolved Specification Link](./ResolvedSpecificationLink.md)
  variant.

## References

- [Specification Link Material](./assets/SpecificationLinkMaterial.md) A simple markdown material that includes links
