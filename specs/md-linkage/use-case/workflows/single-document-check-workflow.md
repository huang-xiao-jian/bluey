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

## Workflow

```mermaid
flowchart TD
    Start([Start]) --> Initialize["Initialize link check context"]

    subgraph Setup ["Setup"]
        Initialize --> Extract["Extract Specification Links"]
        Extract --> DeriveSourceAnchors["Derive heading anchors"]
        DeriveSourceAnchors --> Filter["Filter supported<br/>Specification Links"]
    end

    Setup --> HasLink{"Has Specification Link?"}

    subgraph Loop ["Link Processing"]
        HasLink -- Yes --> TakeLink["Take the next<br/>Specification Link"]
        TakeLink --> LinkType{"Link type?"}

        subgraph InFile ["In-file Anchor"]
            LinkType -- In-file anchor --> SourceAnchorExists{"Anchor identifies<br/>a derived heading?"}
            SourceAnchorExists -- Yes --> AppendLive["Append one Live Link"]
            SourceAnchorExists -- No --> AppendAnchorDead["Append one Dead Link Record<br/>AnchorNotFound"]
        end

        subgraph LocalFile ["Local File"]
            LinkType -- Local file --> ResolveLocal["Resolve final target path"]
            ResolveLocal --> LocalFileExists{"Target file exists?"}
            LocalFileExists -- Yes --> AppendLive
            LocalFileExists -- No --> AppendFileDead["Append one Dead Link Record<br/>FileNotFound"]
        end

        subgraph CrossFile ["Cross-file Anchor"]
            LinkType -- Cross-file anchor --> ResolveCrossFile["Resolve final target path"]
            ResolveCrossFile --> ReadTarget["Obtain target content"]
            ReadTarget --> DeriveTargetAnchors["Derive target-document heading anchors"]
            DeriveTargetAnchors --> TargetAnchorExists{"Anchor identifies<br/>a target-document heading?"}
            TargetAnchorExists -- Yes --> AppendLive
            TargetAnchorExists -- No --> AppendAnchorDead
        end
    end

    subgraph Result ["Result Generation"]
        AppendLive --> HasLink
        AppendAnchorDead --> HasLink
        AppendFileDead --> HasLink
        HasLink -- No --> Fabricate["Fabricate Atomic Link<br/>Check Artifact"]
    end

    Fabricate --> End([End])
```
