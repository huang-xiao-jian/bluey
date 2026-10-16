# Multiple-Document Check

## Prerequities

- [Single-Document Check](./single-document-check.md)
- [Link Check Delegation](../../glossary/LinkCheckDelegation.md)
- [Link Check Scope](../../glossary/LinkCheckScope.md)
- [Live Link](../../glossary/LiveLink.md)

## Brief Description

Check an ordered collection of documents and optionally follow live Markdown
links to additional documents, aggregating every single-document outcome.

## Input

```ts
interface BatchLinkCheckTask {
  /** Absolute project boundary and frame of reference for link resolution. */
  readonly root: string;
  /** Project-relative path of the specification document. */
  readonly scope: LinkCheckScope;
  /** Check mode for further files. */
  readonly mode: LinkCheckMode;
}
```

## Output

```ts
interface AtomicLinkCheckArtifact {
  readonly deadLinks: readonly DeadLinkRecord[];
}
```

## Workflow

```mermaid
flowchart TD
    Start([Start]) --> Initialize["Initialize link check context"]
    Initialize --> MainLoop

    subgraph MainLoop ["Main Loop: Process Pending Documents"]
        direction TB
        HasPending{"Is pendings empty?"}
        HasPending -- Yes --> ProduceResult["Fabricate link check artifact"]
        HasPending -- No --> TakeDocument["Take the first pending document"]
        TakeDocument --> AlreadyChecked{"Document already checked?"}
        AlreadyChecked -- Yes --> HasPending
        AlreadyChecked -- No --> CheckDocument["Perform<br/>Single-Document Check"]
        CheckDocument --> Aggregate["Mark the document and<br/>append its outcomes"]
    end

    Aggregate --> CheckMode{"LinkCheckMode?"}
    CheckMode -- Shallow --> HasPending
    CheckMode -- Recursive --> RecursiveDiscovery

    subgraph RecursiveDiscovery ["Recursive Discovery: Enqueue New Targets"]
        direction TB
        HasLiveLink{"Has more Live Link?"}
        HasLiveLink -- No --> HasPending
        HasLiveLink -- Yes --> TakeLiveLink["Take the first live link"]
        TakeLiveLink --> EligibleTarget{"Target satisfy root constraint?"}
        EligibleTarget -- No --> HasLiveLink
        EligibleTarget -- Yes --> KnownTarget{"Target already pending<br/>or checked?"}
        KnownTarget -- Yes --> HasLiveLink
        KnownTarget -- No --> EnqueueTarget["Append target to the pending collection"]
        EnqueueTarget --> HasLiveLink
    end

    ProduceResult --> End([End])
```
