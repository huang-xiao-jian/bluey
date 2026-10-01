# Dead Link Record Reporting Rules

These rules apply to every dead link record produced by dead link detection user stories and serve as input to the link check report.

## Design Principles

- Each invalid link corresponds to one dead link record.

- For a cross-file anchor link, if the target file does not exist, record only `cross-file-not-found`; do not also record `cross-file-anchor-not-found`.

- Preserve the target exactly as written in the link. Even when the target does not exist, do not rewrite, normalize, or split it into strategy-specific fields.

## Data Model

The following TypeScript type definitions describe the structure of a dead link record. The field names are the JSON field names reported externally; this is the only section in this document that uses TypeScript.

```ts
/** The business type of a link, determined by its validation method. */
type LinkType = 'local-file' | 'in-file-anchor' | 'cross-file-anchor';

/** Recognized dead link scenarios and their failure reasons. */
type DeadLinkErrorType =
  | 'local-file-not-found'
  | 'in-file-anchor-not-found'
  | 'cross-file-not-found'
  | 'cross-file-anchor-not-found';

/**
 * The detection result for one invalid Markdown link.
 * Paths are relative to the project root.
 */
interface DeadLinkRecord {
  /** The path of the file that contains the original link. */
  sourceFile: string;
  /** The complete original Markdown link as written in the document. */
  linkText: string;
  /** The link's business type, which determines the validation scope. */
  linkType: LinkType;
  /**
   * The original target portion of the Markdown link, excluding its display text.
   * All link types use this field, for example ../guide.md, #overview, and ../guide.md#overview.
   */
  target: string;
  /** The single reason this link is invalid. */
  errorType: DeadLinkErrorType;
}
```

## Field Descriptions

- **Source file**: The path of the file that contains the original reference.

- **Original link text**: The complete Markdown link written by the user in the document.

- **Link scenario**: A local file link, an in-file anchor link, or a cross-file anchor link.

- **Link target**: The original target portion of the Markdown link, excluding its display text.

- **Dead link reason**: The link scenario and its corresponding failure reason. See the following table for values.

The link target is stable information shared by every link detection strategy: local file links use a file target, in-file anchor links use an anchor target, and cross-file anchor links use the complete file-and-anchor target. New detection strategies can extend the link scenario and dead link reason values without changing the top-level dead link record structure or the definition of a link target.

| Link scenario | Dead link reason | Business meaning |
| --- | --- | --- |
| Local file link | Local file not found | The target file of a local file link does not exist. |
| In-file anchor link | In-file anchor not found | The target anchor does not exist in the current file. |
| Cross-file anchor link | Cross-file target file not found | The target file of a cross-file anchor link does not exist. |
| Cross-file anchor link | Cross-file target anchor not found | The target file of a cross-file anchor link exists, but the target anchor does not. |

## JSON Example

The following example shows three different dead link records.

```json
[
  {
    "sourceFile": "specs/stories/create-order.md",
    "linkText": "[Payment flow](../flows/payment.md)",
    "linkType": "local-file",
    "target": "../flows/payment.md",
    "errorType": "local-file-not-found"
  },
  {
    "sourceFile": "specs/stories/create-order.md",
    "linkText": "[Exception handling](#exception-handling)",
    "linkType": "in-file-anchor",
    "target": "#exception-handling",
    "errorType": "in-file-anchor-not-found"
  },
  {
    "sourceFile": "specs/stories/create-order.md",
    "linkText": "[Refund rules](../rules/refund.md#refund-period)",
    "linkType": "cross-file-anchor",
    "target": "../rules/refund.md#refund-period",
    "errorType": "cross-file-anchor-not-found"
  }
]
```
