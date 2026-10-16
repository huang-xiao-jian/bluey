# Single-Document Check

## Prerequities

- [Specification Link](../../glossary/SpecificationLink.md)
- [Live Link](../../glossary/LiveLink.md)
- [Dead Link Record](../../glossary/DeadLinkRecord.md)

## Brief Description

Validate every **Specification Link** in one document and classify
each link as either a **Live Link** or a **Dead Link Record**.

## Input

```ts
interface AtomicLinkCheckTask {
  /** Absolute project boundary and frame of reference for link resolution. */
  readonly root: string;
  /** Project-relative path of the specification document. */
  readonly filePath: string;
  /** Raw content of the specification document. */
  readonly content: string;
}
```

## Output

```ts
interface AtomicLinkCheckArtifact {
  readonly liveLinks: readonly LiveLink[];
  readonly deadLinks: readonly DeadLinkRecord[];
}
```

## Steps

1. Initialize empty live-link and dead-link result collections.
2. Extract **Specification Link** from the supplied content in authored order.
3. Derive the source document's supported heading anchors from the supplied content.
4. Filter supported **Specification Link** for the remaining steps.
5. For each established **Specification Link**, apply the branch for its type:
   1. For an in-file anchor link, resolve the target to the source document:
      1. If the anchor identifies a derived source-document heading, append one
         **Live Link**.
      2. Otherwise, append one **Dead Link Record** with
         `DeadReason.AnchorNotFound`.
      3. Continue with the next link.
   2. For a local-file or cross-file anchor link, :
      1. resolve the target path relative to the source document and within the project root
      2. If the link is a local-file link:
         1. If the target file does not exist, append one **Dead Link Record** with
            `DeadReason.FileNotFound`, then continue with the next link.
         2. Otherwise Append one **Live Link**
         3. Then continue with the next link.
      3. If the link is a cross-file anchor link:
         1. obtain the target content through the read-only target-access boundary
         2. derive its supported heading anchors.
         3. If the anchor identifies a derived target-document heading, append one **Live Link**.
         4. Otherwise, append one **Dead Link Record** with `DeadReason.AnchorNotFound`.
6. Fabricate the **Atomic Link Check Artifact** after every established **Specification Link** has produced exactly one outcome.
