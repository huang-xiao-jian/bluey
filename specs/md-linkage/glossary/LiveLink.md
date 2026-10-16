# Live Link

## 1. Definition

A **Live Link** is the traceable result produced for one valid
[Specification Link](./SpecificationLink.md). It preserves the authored link
and identifies the resolved target that satisfied validation.

## 2. Synonyms and Aliases

- Valid link
- Resolved live link

## 3. Key Attributes

- **Location:** The project boundary and project-relative path of the Markdown
  document containing the link.
- **Link:** The original **Specification Link** that passed validation.
- **Target:** The resolved target file and, when applicable, the validated
  anchor.

### 3.1 Data Model

```ts
interface LiveLink {
  readonly location: {
    readonly root: string;
    readonly filePath: string;
  };
  readonly link: SpecificationLink;
  readonly target: {
    readonly filePath: string;
    readonly anchorId?: string;
    readonly anchorName?: string;
  };
}
```

## 4. Rules and Constraints

1. Each valid **Specification Link** produces exactly one **Live Link**.
2. `target.filePath` identifies an existing target at validation time.
3. When the authored link specifies an anchor, `target.anchorId` identifies a
   supported heading in the target document.
4. A **Live Link** preserves its **Specification Link** unchanged.
5. A **Live Link** remains unchanged after it has been established.

## 5. Relationships

- **Transformation:** A valid **Specification Link** produces one **Live Link**.
- **Aggregation:** A [Link Check Result](./LinkCheckResult.md) aggregates zero
  or more **Live Links**.

## 6. Scope Boundaries

- **Includes:** Source location, original link, and resolved valid target.
- **Excludes:** Scope expansion, traversal decisions, report construction, and
  output presentation.
