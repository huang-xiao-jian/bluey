# Specification Link

## 1. Business Definition

A **Specification Link** is an original Markdown link extracted from a specification document for link checking. It preserves what the author wrote and identifies the supported link form before any target is resolved or validated.

## 2. Synonyms and Aliases

- Source link
- Authored link
- Specification document link

## 3. Key Attributes

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

#### Examples

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
  text: "[Data model](./DeadLinkRecord.md#31-data-model)",
  name: "Data model",
  path: "./DeadLinkRecord.md",
  anchor: "31-data-model",
};
```

## 4. Business Rules and Constraints

1. Each supported Markdown link extracted from a specification document is represented by exactly one **Specification Link**.
2. The complete link text is preserved exactly as authored. Its name, path, and anchor are parsed from that text without replacing the original text.
3. A **Specification Link** exists before validation and represents the same authored material whether its target is valid or invalid.
4. Target resolution, anchor normalization, and validity determination do not change the **Specification Link**.

## 5. Relationships

- **Aggregation:** A Markdown specification document contains zero or more **Specification Links**.
- **Transformation:** An invalid **Specification Link** produces one [Dead Link Record](./DeadLinkRecord.md). A valid **Specification Link** does not produce a dead link record.

## 6. Scope Boundaries

- **Includes:** Original supported Markdown links and their authored name, path, and anchor components.
- **Excludes:** Unsupported link forms, source-document selection, resolved target paths, normalized anchors, validity results, failure reasons, and report presentation.
