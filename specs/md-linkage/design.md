# Technical Design

## Workflow Coverage

- [Dead Link Detection Requirements for Specification Documents](spec.md)
- [Link Check Delegation](glossary/LinkCheckDelegation.md)
- [Resolved Specification Link](glossary/ResolvedSpecificationLink.md)
- [Link Check Report](glossary/LinkCheckReport.md)
- [Detect Dead Links in a Single File](stories/detect-links-in-single-file.md)
- [Detect Dead Local File Links](stories/detect-local-file-links.md)
- [Detect Dead In-File Anchor Links](stories/detect-in-file-anchor-links.md)
- [Detect Dead Cross-File Anchor Links](stories/detect-cross-file-anchor-links.md)
- [Detect Dead Links in a File Collection](stories/detect-links-in-file-collection.md)
- [Detect Dead Links Recursively Through File References](stories/detect-links-in-reference-chain.md)
- [Generate a Raw Link Check Report](stories/generate-link-check-report.md)
- [Output a Link Check Report](stories/output-link-check-report.md)

## Package Selections

- **`mdast-util-from-markdown`**: Parses CommonMark into a syntax tree so links
  and headings can be detected without fragile regular expressions. The
  higher-level `remark` processing pipeline is unnecessary for this use case.
- **`unist-util-visit`**: Traverses link and heading nodes in the Markdown
  syntax tree without requiring a custom recursive walker.
- **`mdast-util-to-string`**: Extracts visible heading text, including headings
  containing nested Markdown formatting, for anchor generation.
- **`github-slugger`**: Generates the GitHub-compatible heading identifiers and
  duplicate-heading suffixes required by the anchor detection stories.
- **`@types/mdast`**: Provides TypeScript types for Markdown document roots,
  links, and headings. This is a development dependency.
- **`inversify`**: Provides the dependency injection container used to bind and
  resolve application services and their collaborators by constructor token.
- **`commander`**: Parses the CLI commands and options. This dependency already
  exists in the package.
- **`zod`**: Validates shared request and response contracts and provides
  inferred TypeScript types. This dependency already exists in the package.
- **`@modelcontextprotocol/sdk`**: Provides MCP tool registration and transport
  support. This dependency already exists in the package.

## CRC Model

### LinkCheckFacade

- **Role:** Boundary(Driving Port).
- **Purpose:** Represent the author or maintainer's interaction with a link check.
- **Responsibilities:** Receive a complete `LinkCheckDelegation`, the output choice, and the save path; pass the delegation to the link-check workflow without reconstructing its project root, document paths, or mode; present delivered reports, requests for a missing save path, and failure reasons.
- **Collaborators:** `LinkCheckDelegation`, `LinkChecker`.

### LinkChecker

- **Role:** Control.
- **Purpose:** Coordinate the complete specification-document link-check journey.
- **Responsibilities:** Coordinate project-context establishment, scope selection, dead link checking, raw-report creation, and selected report delivery; own the raw report throughout the run; prevent report creation or output after an untrustworthy check; retain the raw report while a missing save path is requested; discard the run's raw report after delivery failure.
- **Collaborators:** `LinkCheckFacade`, `LinkCheckDelegation`, `LinkCheckScopeBuilder`, `DeadLinkInspector`, `RawLinkCheckReport`, `LinkCheckReportDispatcher`.

### LinkCheckDelegation

- **Role:** Entity.
- **Purpose:** Represent the link-check work delegated by a maintainer.
- **Responsibilities:** Preserve the project root, explicit document paths, and the shallow or recursive choice; provide the root used to establish `ProjectContext`; determine whether reference traversal is delegated.
- **Business concept:** [Link Check Delegation](glossary/LinkCheckDelegation.md).
- **Collaborators:** None.

### ProjectContext

- **Role:** Entity.
- **Purpose:** Represent the fixed project boundary for one link check.
- **Responsibilities:**
  - Resolve and preserve the project root supplied by `LinkCheckDelegation`;
  - determine whether selected or discovered documents remain within that root;
  - provide project-relative identities for checked documents.
- **Business constraints:** [Link Check Delegation](glossary/LinkCheckDelegation.md#4-rules-and-constraints).
- **Collaborators:** None.

### LinkCheckScope

- **Role:** Entity.
- **Purpose:** Represent the documents actually checked and the non-fatal issues encountered while selecting them.
- **Responsibilities:** Retain each checked document once; retain every document-path issue with its original path and reason; prevent duplicate and cyclic checking; preserve an empty scope as a valid result.
- **Data contract:** [`LinkCheckScope` and `LinkCheckScopeIssue`](glossary/LinkCheckReport.md#31-data-model).
- **Collaborators:** `ProjectContext`.

### LinkCheckScopeBuilder

- **Role definition:** [Link Check Scope Builder](roles/LinkCheckScopeBuilder.md).

### SpecificationDocumentRepository

- **Role:** Boundary(Driven Port).
- **Purpose:** Represent access to specification documents and their filesystem context.
- **Responsibilities:** Resolve project roots and explicit document paths; report document existence and kind; provide delegated and referenced Markdown documents; determine resolved containment without changing original paths or link targets.
- **Collaborators:** `LinkCheckScopeBuilder`, `DeadLinkInspector`.

### DeadLinkInspector

- **Role:** Control.
- **Purpose:** Coordinate dead link detection across the documents in one check.
- **Responsibilities:** Check every in-scope document at most once; classify and validate each supported link; reject a resolved target outside the project root before checking its existence or anchor; follow eligible Markdown references only in recursive mode; stop traversal at outside-root, non-Markdown, or missing targets; retain one resolved-link variant for each supported link.
- **Collaborators:** `LinkCheckDelegation`, `ProjectContext`, `LinkCheckScope`, `SpecificationDocumentRepository`, `SpecificationDocument`, `SpecificationLink`, `ResolvedSpecificationLink`.

### SpecificationDocument

- **Role:** Entity.
- **Purpose:** Represent one Markdown specification document being checked.
- **Responsibilities:** Preserve the document's project-relative identity and links; recognize standard Markdown headings; determine GitHub-compatible heading anchors in document order, including duplicate-heading suffixes; exclude custom anchors from valid heading targets.
- **Collaborators:** `SpecificationLink`.

### SpecificationLink

- **Role:** Entity.
- **Purpose:** Represent one supported local Markdown link in its source-document context.
- **Responsibilities:** Preserve the complete original link text and expose its parsed name, path, and anchor; determine whether the link is a local-file, in-file-anchor, or cross-file-anchor link; derive the resolved target file path and normalized anchor ID by resolving relative paths, decoding URL-encoded paths, and ignoring query parameters.
- **Scope:** Only the supported link types defined by the [single-file detection epic](stories/detect-links-in-single-file.md) are represented. Other link forms are outside this model and are not validated by `DeadLinkInspector`.
- **Collaborators:** None.

### ResolvedSpecificationLink

- **Role:** Entity.
- **Purpose:** Represent the traceable live or dead result of validating one specification link.
- **Responsibilities:** Preserve the project boundary and source document path, the original and parsed link, and the resolved target file path and anchor details; discriminate live and dead outcomes; retain exactly one reason for a dead outcome; classify an outside-root target before file or anchor existence; prevent a missing cross-file target from also producing an anchor-missing reason.
- **Data contract:** [`ResolvedSpecificationLink`](glossary/ResolvedSpecificationLink.md#31-data-model).
- **Collaborators:** `SpecificationLink`.

### RawLinkCheckReport

- **Role:** Entity.
- **Purpose:** Represent the unprocessed business result of one trustworthy link check.
- **Responsibilities:** Aggregate only the check scope and every dead resolved-link variant; preserve empty collections and document-path issues; exclude totals, conclusions, grouping, sorting, summaries, and delivery concerns.
- **Data contract:** [`LinkCheckReport`](glossary/LinkCheckReport.md#31-data-model).
- **Collaborators:** `LinkCheckScope`, `DeadResolvedSpecificationLink`.

### LinkCheckReportDispatcher

- **Role:** Control.
- **Purpose:** Coordinate final delivery of a generated raw report by the user's selected method.
- **Responsibilities:** Receive the raw report from `LinkChecker` without taking ownership; preserve it without transformation during delivery; require a save path for file delivery; use only the selected output method; return delivery success, a missing-save-path request, or delivery failure and its reason without fallback.
- **Collaborators:** `RawLinkCheckReport`, `TerminalLinkCheckReporter`, `FileLinkCheckReporter`.

### TerminalLinkCheckReporter

- **Role:** Boundary(Driven Port).
- **Purpose:** Represent terminal delivery of a raw link check report.
- **Responsibilities:** Emit the raw report content to the terminal unchanged; report terminal-output success or failure.
- **Collaborators:** `LinkCheckReportDispatcher`.

### FileLinkCheckReporter

- **Role:** Boundary(Driven Port).
- **Purpose:** Represent file delivery of a raw link check report.
- **Responsibilities:** Save the raw report content unchanged at the provided path; report file-output success or failure and its reason.
- **Collaborators:** `LinkCheckReportDispatcher`.

## Class Diagram

```mermaid
classDiagram
    direction LR

    class LinkCheckFacade {
        <<Boundary>>
    }
    note for LinkCheckFacade "Role: Boundary(Driving Port)"

    class LinkChecker {
        <<Control>>
    }
    class LinkCheckDelegation {
        <<Entity>>
    }
    class ProjectContext {
        <<Entity>>
    }
    class LinkCheckScope {
        <<Entity>>
    }
    class LinkCheckScopeBuilder {
        <<Control>>
    }
    class SpecificationDocumentRepository {
        <<Boundary>>
    }
    note for SpecificationDocumentRepository "Role: Boundary(Driven Port)"

    class DeadLinkInspector {
        <<Control>>
    }
    class SpecificationDocument {
        <<Entity>>
    }
    class SpecificationLink {
        <<Entity>>
    }
    class ResolvedSpecificationLink {
        <<Entity>>
    }
    class LiveResolvedSpecificationLink {
        <<Variant>>
    }
    class DeadResolvedSpecificationLink {
        <<Variant>>
    }
    class RawLinkCheckReport {
        <<Entity>>
    }
    class LinkCheckReportDispatcher {
        <<Control>>
    }
    class TerminalLinkCheckReporter {
        <<Boundary>>
    }
    note for TerminalLinkCheckReporter "Role: Boundary(Driven Port)"

    class FileLinkCheckReporter {
        <<Boundary>>
    }
    note for FileLinkCheckReporter "Role: Boundary(Driven Port)"

    LinkCheckFacade ..> LinkChecker : initiates and receives outcomes
    LinkCheckFacade ..> LinkCheckDelegation : accepts as input
    LinkChecker ..> LinkCheckDelegation : coordinates delegated check
    LinkChecker ..> LinkCheckScopeBuilder : delegates starting-scope creation
    LinkChecker ..> DeadLinkInspector : delegates link checking
    LinkChecker *-- RawLinkCheckReport : creates and owns for the run
    LinkChecker ..> LinkCheckReportDispatcher : delegates selected delivery
    LinkCheckScopeBuilder ..> LinkCheckDelegation : interprets document paths
    LinkCheckScopeBuilder ..> ProjectContext : establishes fixed root
    LinkCheckScopeBuilder ..> LinkCheckScope : records files and issues
    LinkCheckScopeBuilder ..> SpecificationDocumentRepository : resolves context and paths
    ProjectContext ..> LinkCheckDelegation : resolves the owned project root
    LinkCheckScope --> ProjectContext : records project-relative scope
    DeadLinkInspector ..> LinkCheckDelegation : follows delegated traversal mode
    DeadLinkInspector ..> ProjectContext : bounds recursive traversal
    DeadLinkInspector ..> LinkCheckScope : expands and deduplicates checked files
    DeadLinkInspector ..> SpecificationDocumentRepository : obtains documents and target facts
    DeadLinkInspector ..> SpecificationDocument : coordinates document checks
    DeadLinkInspector ..> SpecificationLink : coordinates classification and validation
    DeadLinkInspector ..> ResolvedSpecificationLink : retains validation outcomes
    SpecificationDocument --> SpecificationLink : contains
    ResolvedSpecificationLink --> SpecificationLink : resolves
    ResolvedSpecificationLink <|-- LiveResolvedSpecificationLink : live variant
    ResolvedSpecificationLink <|-- DeadResolvedSpecificationLink : dead variant
    RawLinkCheckReport o-- LinkCheckScope : aggregates scope
    RawLinkCheckReport o-- DeadResolvedSpecificationLink : aggregates
    LinkCheckReportDispatcher ..> RawLinkCheckReport : borrows for unchanged delivery
    LinkCheckReportDispatcher ..> TerminalLinkCheckReporter : requests terminal delivery
    LinkCheckReportDispatcher ..> FileLinkCheckReporter : requests file delivery
```

## Workflow Sequence Diagrams

### Dead Link Detection Requirements for Specification Documents

**Workflow Source:** [Dead Link Detection Requirements for Specification Documents](spec.md)

#### Terminal Output Journey

The maintainer selects the documents and traversal mode, the system completes a trustworthy check, and the unchanged raw report is displayed in the terminal for review.

```mermaid
sequenceDiagram
    autonumber
    actor Maintainer as Specification Document Maintainer
    participant Submission as LinkCheckFacade
    participant Check as LinkChecker
    participant Selection as LinkCheckScopeBuilder
    participant Detection as DeadLinkInspector
    participant Report as RawLinkCheckReport
    participant Delivery as LinkCheckReportDispatcher
    participant Terminal as TerminalLinkCheckReporter

    Maintainer->>Submission: Provide LinkCheckDelegation and terminal output
    Submission->>Check: Submit delegation and output choice
    Check->>Selection: Establish starting check scope
    Selection-->>Check: Provide scope and document-path issues
    Check->>Detection: Detect dead links in scope
    Detection-->>Check: Provide trustworthy detection result
    Check->>Report: Aggregate scope and dead links only
    Check->>Delivery: Deliver raw report by selected method
    Delivery->>Terminal: Emit raw report unchanged
    Terminal-->>Delivery: Confirm terminal output
    Delivery-->>Check: Provide delivered report outcome
    Check-->>Submission: Return delivered report outcome
    Submission-->>Maintainer: Present raw report for issue location and repair
```

#### File Output Journey

The maintainer selects the documents and traversal mode and supplies a save path, after which the system checks the documents and saves the unchanged raw report to that path.

```mermaid
sequenceDiagram
    autonumber
    actor Maintainer as Specification Document Maintainer
    participant Submission as LinkCheckFacade
    participant Check as LinkChecker
    participant Selection as LinkCheckScopeBuilder
    participant Detection as DeadLinkInspector
    participant Report as RawLinkCheckReport
    participant Delivery as LinkCheckReportDispatcher
    participant File as FileLinkCheckReporter

    Maintainer->>Submission: Provide LinkCheckDelegation, file output, and save path
    Submission->>Check: Initiate link check with delegation
    Check->>Selection: Establish starting check scope
    Selection-->>Check: Provide scope and document-path issues
    Check->>Detection: Detect dead links in scope
    Detection-->>Check: Provide trustworthy detection result
    Check->>Report: Aggregate scope and dead links only
    Check->>Delivery: Deliver raw report to the chosen file path
    Delivery->>File: Save raw report unchanged
    File-->>Delivery: Confirm file output
    Delivery-->>Check: Provide saved-report outcome
    Check-->>Submission: Return saved-report outcome
    Submission-->>Maintainer: Identify saved report for issue location and repair
```

#### Detection Does Not Complete Successfully

The check cannot produce a trustworthy detection result, so the system discards the partial result and stops before raw-report generation or delivery.

```mermaid
sequenceDiagram
    autonumber
    actor Maintainer as Specification Document Maintainer
    participant Submission as LinkCheckFacade
    participant Check as LinkChecker
    participant Selection as LinkCheckScopeBuilder
    participant Detection as DeadLinkInspector

    Maintainer->>Submission: Submit a LinkCheckDelegation
    Submission->>Check: Initiate link check with delegation
    Check->>Selection: Establish starting check scope
    Selection-->>Check: Provide starting outcome
    Check->>Detection: Detect dead links
    Detection-->>Check: Report unsuccessful or untrustworthy detection
    Note over Check: Discard the result and do not generate or output a raw report
```

#### File Output Without a Save Path

The maintainer chooses file output but omits the required path, so the system requests the missing path and does not save the report.

```mermaid
sequenceDiagram
    autonumber
    actor Maintainer as Specification Document Maintainer
    participant Submission as LinkCheckFacade
    participant Check as LinkChecker
    participant Delivery as LinkCheckReportDispatcher

    Maintainer->>Submission: Choose file output without a save path
    Submission->>Check: Submit output choice for a generated raw report
    Check->>Delivery: Provide the owned raw report for file delivery
    Delivery-->>Check: Report the missing save path
    Check-->>Submission: Request the required save path
    Submission-->>Maintainer: Ask for a report save path
    Note over Check: Retain ownership of the raw report while requesting the path
    Note over Maintainer,Delivery: No file is saved
```

#### Report Output Fails

The selected file destination cannot accept the report, so the system explains the failure, does not switch destinations, and discards this run's raw report.

```mermaid
sequenceDiagram
    autonumber
    actor Maintainer as Specification Document Maintainer
    participant Submission as LinkCheckFacade
    participant Check as LinkChecker
    participant Delivery as LinkCheckReportDispatcher
    participant File as FileLinkCheckReporter

    Maintainer->>Submission: Choose file output and provide a save path
    Submission->>Check: Submit output choice for a generated raw report
    Check->>Delivery: Coordinate selected file delivery
    Delivery->>File: Save raw report unchanged
    File-->>Delivery: Report output failure and reason
    Delivery-->>Check: Report failure without changing output method
    Check-->>Submission: Explain the output failure
    Submission-->>Maintainer: Present output failure and reason
    Note over Check: Discard the owned raw report after delivery failure
```

### Detect Dead Links in a Single File (Epic)

**Workflow Source:** [Detect Dead Links in a Single File](stories/detect-links-in-single-file.md)

#### Single-File Detection

The author selects one Markdown document, and the system examines its supported links and headings to retain one traceable record for every invalid link.

```mermaid
sequenceDiagram
    autonumber
    actor Author as Specification Document Author
    participant Submission as LinkCheckFacade
    participant Check as LinkChecker
    participant Detection as DeadLinkInspector
    participant Document as SpecificationDocument
    participant Link as SpecificationLink
    participant Record as DeadResolvedSpecificationLink

    Author->>Submission: Choose one Markdown file for checking
    Submission->>Check: Initiate single-file check
    Check->>Detection: Check the selected document
    Detection->>Document: Examine document links and headings
    Document-->>Detection: Provide contained links and heading anchors
    Detection->>Link: Classify each supported link
    Detection->>Record: Retain one record for each invalid link
    Detection-->>Check: Provide all single-file resolved-link variants
```

### Detect Dead Local File Links

**Workflow Source:** [Detect Dead Local File Links](stories/detect-local-file-links.md)

#### Scenario 1: The target local file exists

The link resolves to an existing local file, so validation produces a live
resolved-link variant.

```mermaid
sequenceDiagram
    autonumber
    actor Author as Specification Document Author
    participant Submission as LinkCheckFacade
    participant Check as LinkChecker
    participant Detection as DeadLinkInspector
    participant Link as SpecificationLink
    participant Access as SpecificationDocumentRepository

    Author->>Submission: Check a document containing a local file link
    Submission->>Check: Initiate link check
    Check->>Detection: Validate document links
    Detection->>Link: Classify and resolve the local-file validation location
    Detection->>Access: Determine whether the resolved target remains inside the project root
    Access-->>Detection: Target remains inside the project root
    Detection->>Access: Determine whether the local target exists
    Access-->>Detection: Target exists
    Note over Detection: Produce one live resolved-link variant
```

#### Scenario 2: The target local file does not exist

The link resolves to a missing local file, so the system records the `file-not-found` reason together with the source location, original and parsed link, and resolved target file path.

```mermaid
sequenceDiagram
    autonumber
    actor Author as Specification Document Author
    participant Submission as LinkCheckFacade
    participant Check as LinkChecker
    participant Detection as DeadLinkInspector
    participant Link as SpecificationLink
    participant Access as SpecificationDocumentRepository
    participant Record as DeadResolvedSpecificationLink

    Author->>Submission: Check a document containing a missing local target
    Submission->>Check: Initiate link check
    Check->>Detection: Validate document links
    Detection->>Link: Classify and resolve the local-file validation location
    Detection->>Access: Determine whether the resolved target remains inside the project root
    Access-->>Detection: Target remains inside the project root
    Detection->>Access: Determine whether the local target exists
    Access-->>Detection: Target does not exist
    Detection->>Record: Preserve location, link, resolved target, and file-not-found reason
```

#### Scenario 3: Fragment-only links are not handled by this story

The link contains only a fragment, so it is classified for in-file anchor validation rather than local-file validation.

```mermaid
sequenceDiagram
    autonumber
    actor Author as Specification Document Author
    participant Submission as LinkCheckFacade
    participant Check as LinkChecker
    participant Detection as DeadLinkInspector
    participant Link as SpecificationLink

    Author->>Submission: Check a document containing a fragment-only link
    Submission->>Check: Initiate link check
    Check->>Detection: Validate document links
    Detection->>Link: Classify the link as an in-file anchor
    Note over Detection,Link: Exclude the link from local-file validation and route it to in-file-anchor validation
```

#### Scenario 4: Links containing a file path and anchor are not handled by this story

The link contains both a file path and an anchor, so it is classified for cross-file anchor validation rather than local-file validation.

```mermaid
sequenceDiagram
    autonumber
    actor Author as Specification Document Author
    participant Submission as LinkCheckFacade
    participant Check as LinkChecker
    participant Detection as DeadLinkInspector
    participant Link as SpecificationLink

    Author->>Submission: Check a document containing a file-and-anchor link
    Submission->>Check: Initiate link check
    Check->>Detection: Validate document links
    Detection->>Link: Classify the link as a cross-file anchor
    Note over Detection,Link: Exclude the link from local-file validation and route it to cross-file-anchor validation
```

#### Scenario 5: URL-encoded paths and query parameters do not change file-existence validation

The system decodes the local path and ignores query parameters for validation
while preserving the original target for reporting; because the resolved file
remains inside the project root and exists, validation produces a live
resolved-link variant.

```mermaid
sequenceDiagram
    autonumber
    actor Author as Specification Document Author
    participant Submission as LinkCheckFacade
    participant Check as LinkChecker
    participant Detection as DeadLinkInspector
    participant Link as SpecificationLink
    participant Access as SpecificationDocumentRepository

    Author->>Submission: Check a URL-encoded local link with query parameters
    Submission->>Check: Initiate link check
    Check->>Detection: Validate document links
    Detection->>Link: Decode the path, ignore query parameters, and preserve the original target
    Detection->>Access: Determine whether the resolved target remains inside the project root
    Access-->>Detection: Target remains inside the project root
    Detection->>Access: Determine whether the resolved local target exists
    Access-->>Detection: Target exists
    Note over Detection: Produce one live resolved-link variant
```

#### Scenario 6: The target resolves outside the project root

The resolved target path crosses the project boundary, so validation records
the `target-outside-project-root` reason without checking whether the target
file or anchor exists.

```mermaid
sequenceDiagram
    autonumber
    actor Author as Specification Document Author
    participant Submission as LinkCheckFacade
    participant Check as LinkChecker
    participant Detection as DeadLinkInspector
    participant Link as SpecificationLink
    participant Access as SpecificationDocumentRepository
    participant Record as DeadResolvedSpecificationLink

    Author->>Submission: Check a link whose target crosses the project root
    Submission->>Check: Initiate link check
    Check->>Detection: Validate document links
    Detection->>Link: Resolve the target file path
    Detection->>Access: Determine whether the resolved target remains inside the project root
    Access-->>Detection: Target is outside the project root
    Detection->>Record: Preserve location, link, target, and target-outside-project-root reason
    Note over Detection,Record: Do not check file or anchor existence
```

### Detect Dead In-File Anchor Links

**Workflow Source:** [Detect Dead In-File Anchor Links](stories/detect-in-file-anchor-links.md)

#### Scenario 1: The target in-file anchor exists

The fragment matches a standard Markdown heading in the current document, so
validation produces a live resolved-link variant.

```mermaid
sequenceDiagram
    autonumber
    actor Author as Specification Document Author
    participant Submission as LinkCheckFacade
    participant Check as LinkChecker
    participant Detection as DeadLinkInspector
    participant Document as SpecificationDocument
    participant Link as SpecificationLink

    Author->>Submission: Check a document containing a fragment-only link
    Submission->>Check: Initiate link check
    Check->>Detection: Validate document links
    Detection->>Link: Classify the link as an in-file anchor
    Detection->>Document: Determine whether the standard-heading anchor exists in this document
    Document-->>Detection: Target heading anchor exists
    Note over Detection: Produce one live resolved-link variant
```

#### Scenario 2: The target in-file anchor does not exist

The fragment does not match a standard Markdown heading in the current document, so the system records the `anchor-not-found` reason with the source location, original and parsed link, resolved source-file target, and normalized anchor ID.

```mermaid
sequenceDiagram
    autonumber
    actor Author as Specification Document Author
    participant Submission as LinkCheckFacade
    participant Check as LinkChecker
    participant Detection as DeadLinkInspector
    participant Document as SpecificationDocument
    participant Link as SpecificationLink
    participant Record as DeadResolvedSpecificationLink

    Author->>Submission: Check a document containing a missing fragment target
    Submission->>Check: Initiate link check
    Check->>Detection: Validate document links
    Detection->>Link: Classify the link as an in-file anchor
    Detection->>Document: Determine whether the standard-heading anchor exists in this document
    Document-->>Detection: Target heading anchor does not exist
    Detection->>Record: Preserve location, link, resolved target, and anchor-not-found reason
```

#### Scenario 3: Validation does not read other files

The fragment is evaluated only against headings in its source document; no other document participates in the validation decision.

```mermaid
sequenceDiagram
    autonumber
    actor Author as Specification Document Author
    participant Submission as LinkCheckFacade
    participant Check as LinkChecker
    participant Detection as DeadLinkInspector
    participant Document as SpecificationDocument
    participant Link as SpecificationLink

    Author->>Submission: Check a document containing a fragment-only link
    Submission->>Check: Initiate link check
    Check->>Detection: Validate document links
    Detection->>Link: Classify the link as an in-file anchor
    Detection->>Document: Validate the anchor using only the current document
    Document-->>Detection: Provide the current document's standard-heading anchors
    Note over Detection,Document: Do not consult any other document
```

#### Scenario 4: Custom anchors are not valid targets

Only a custom anchor matches the fragment, so the target is treated as missing because this workflow recognizes standard Markdown headings only.

```mermaid
sequenceDiagram
    autonumber
    actor Author as Specification Document Author
    participant Submission as LinkCheckFacade
    participant Check as LinkChecker
    participant Detection as DeadLinkInspector
    participant Document as SpecificationDocument
    participant Record as DeadResolvedSpecificationLink

    Author->>Submission: Check a fragment supported only by a custom anchor
    Submission->>Check: Initiate link check
    Check->>Detection: Validate document links
    Detection->>Document: Seek a corresponding standard Markdown heading
    Document-->>Detection: No standard-heading anchor exists
    Detection->>Record: Preserve location, link, resolved target, and anchor-not-found reason
```

#### Scenario 5: Duplicate headings use GitHub-compatible suffixes

The document assigns GitHub-compatible suffixes in heading order, allowing `#rules-1` to resolve to the second heading named `Rules`.

```mermaid
sequenceDiagram
    autonumber
    actor Author as Specification Document Author
    participant Submission as LinkCheckFacade
    participant Check as LinkChecker
    participant Detection as DeadLinkInspector
    participant Document as SpecificationDocument

    Author->>Submission: Check a link to the second duplicate Rules heading
    Submission->>Check: Initiate link check
    Check->>Detection: Validate document links
    Detection->>Document: Determine anchors from headings in document order
    Document-->>Detection: Match rules-1 to the second Rules heading
    Note over Detection: Produce one live resolved-link variant
```

### Detect Dead Cross-File Anchor Links

**Workflow Source:** [Detect Dead Cross-File Anchor Links](stories/detect-cross-file-anchor-links.md)

#### Scenario 1: The target file does not exist

The file portion of the cross-file anchor is missing, so the system records only the `file-not-found` reason and does not attempt anchor validation.

```mermaid
sequenceDiagram
    autonumber
    actor Author as Specification Document Author
    participant Submission as LinkCheckFacade
    participant Check as LinkChecker
    participant Detection as DeadLinkInspector
    participant Link as SpecificationLink
    participant Access as SpecificationDocumentRepository
    participant Record as DeadResolvedSpecificationLink

    Author->>Submission: Check a cross-file anchor whose file is missing
    Submission->>Check: Initiate link check
    Check->>Detection: Validate document links
    Detection->>Link: Parse the original link and resolve the target file path
    Detection->>Access: Determine whether the resolved target remains inside the project root
    Access-->>Detection: Target remains inside the project root
    Detection->>Access: Determine whether the target file exists
    Access-->>Detection: Target file does not exist
    Detection->>Record: Preserve location, link, resolved target, and file-not-found reason
    Note over Detection,Record: Do not validate the target anchor or add a second reason
```

#### Scenario 2: The target file exists but the target anchor does not

The target document exists but contains no matching standard-heading anchor, so the system records the `anchor-not-found` reason with the normalized target anchor ID.

```mermaid
sequenceDiagram
    autonumber
    actor Author as Specification Document Author
    participant Submission as LinkCheckFacade
    participant Check as LinkChecker
    participant Detection as DeadLinkInspector
    participant Access as SpecificationDocumentRepository
    participant Target as SpecificationDocument
    participant Record as DeadResolvedSpecificationLink

    Author->>Submission: Check a cross-file anchor whose heading is missing
    Submission->>Check: Initiate link check
    Check->>Detection: Validate document links
    Detection->>Access: Determine whether the resolved target remains inside the project root
    Access-->>Detection: Target remains inside the project root
    Detection->>Access: Determine whether the target file exists
    Access-->>Detection: Provide existing target document
    Detection->>Target: Determine whether the standard-heading anchor exists
    Target-->>Detection: Target heading anchor does not exist
    Detection->>Record: Preserve location, link, resolved target, and anchor-not-found reason
```

#### Scenario 3: Both the target file and target anchor exist

Both the referenced document and its standard-heading anchor exist, so
validation produces a live resolved-link variant.

```mermaid
sequenceDiagram
    autonumber
    actor Author as Specification Document Author
    participant Submission as LinkCheckFacade
    participant Check as LinkChecker
    participant Detection as DeadLinkInspector
    participant Access as SpecificationDocumentRepository
    participant Target as SpecificationDocument

    Author->>Submission: Check a valid cross-file anchor
    Submission->>Check: Initiate link check
    Check->>Detection: Validate document links
    Detection->>Access: Determine whether the resolved target remains inside the project root
    Access-->>Detection: Target remains inside the project root
    Detection->>Access: Determine whether the target file exists
    Access-->>Detection: Provide existing target document
    Detection->>Target: Determine whether the standard-heading anchor exists
    Target-->>Detection: Target heading anchor exists
    Note over Detection: Produce one live resolved-link variant
```

#### Scenario 4: Relative paths, URL encoding, and query parameters

The system resolves the relative path from the source document, decodes it, and ignores query parameters for validation while preserving the original target; the resolved document and heading are valid.

```mermaid
sequenceDiagram
    autonumber
    actor Author as Specification Document Author
    participant Submission as LinkCheckFacade
    participant Check as LinkChecker
    participant Detection as DeadLinkInspector
    participant Link as SpecificationLink
    participant Access as SpecificationDocumentRepository
    participant Target as SpecificationDocument

    Author->>Submission: Check an encoded relative cross-file anchor with query parameters
    Submission->>Check: Initiate link check
    Check->>Detection: Validate document links
    Detection->>Link: Resolve relative path, decode it, ignore query parameters, and preserve original target
    Detection->>Access: Determine whether the resolved target remains inside the project root
    Access-->>Detection: Target remains inside the project root
    Detection->>Access: Obtain the resolved target document
    Access-->>Detection: Provide existing target document
    Detection->>Target: Determine whether the standard-heading anchor exists
    Target-->>Detection: Target heading anchor exists
    Note over Detection: Produce one live resolved-link variant
```

#### Scenario 5: Duplicate target headings use GitHub-compatible suffixes

The target document assigns duplicate-heading suffixes in document order, allowing `#rules-1` to resolve to its second `Rules` heading.

```mermaid
sequenceDiagram
    autonumber
    actor Author as Specification Document Author
    participant Submission as LinkCheckFacade
    participant Check as LinkChecker
    participant Detection as DeadLinkInspector
    participant Access as SpecificationDocumentRepository
    participant Target as SpecificationDocument

    Author->>Submission: Check a cross-file link to the second duplicate Rules heading
    Submission->>Check: Initiate link check
    Check->>Detection: Validate document links
    Detection->>Access: Determine whether the resolved target remains inside the project root
    Access-->>Detection: Target remains inside the project root
    Detection->>Access: Obtain the target document
    Access-->>Detection: Provide existing target document
    Detection->>Target: Determine anchors from headings in document order
    Target-->>Detection: Match rules-1 to the second Rules heading
    Note over Detection: Produce one live resolved-link variant
```

### Detect Dead Links in a File Collection

**Workflow Source:** [Detect Dead Links in a File Collection](stories/detect-links-in-file-collection.md)

#### Scenario 1: Check explicitly named Markdown files

The maintainer names two Markdown documents directly, and the shallow check includes both documents and reports invalid links from each one.

```mermaid
sequenceDiagram
    autonumber
    actor Maintainer as Specification Document Maintainer
    participant Submission as LinkCheckFacade
    participant Check as LinkChecker
    participant Selection as LinkCheckScopeBuilder
    participant Scope as LinkCheckScope
    participant Detection as DeadLinkInspector
    participant Report as RawLinkCheckReport

    Maintainer->>Submission: Delegate a.md and b.md in shallow mode
    Submission->>Check: Pass the delegation unchanged
    Check->>Selection: Resolve the delegated document paths
    Selection->>Scope: Retain a.md and b.md once
    Check->>Detection: Check both selected documents
    Detection-->>Check: Provide one invalid-link outcome from each document
    Check->>Report: Aggregate both files and both dead resolved-link variants
```

#### Scenario 2: An absolute path identifies a file inside the project root

The absolute path resolves to an existing Markdown document inside the fixed
project root, so the document is checked and identified by its project-relative
path.

```mermaid
sequenceDiagram
    autonumber
    actor Maintainer as Specification Document Maintainer
    participant Submission as LinkCheckFacade
    participant Check as LinkChecker
    participant Selection as LinkCheckScopeBuilder
    participant Context as ProjectContext
    participant Access as SpecificationDocumentRepository
    participant Scope as LinkCheckScope

    Maintainer->>Submission: Select an absolute Markdown path inside the project root
    Submission->>Check: Initiate collection check
    Check->>Selection: Resolve the absolute document path
    Selection->>Access: Resolve document and project containment
    Access-->>Selection: Report existing in-root Markdown document
    Selection->>Context: Obtain project-relative document identity
    Selection->>Scope: Retain project-relative file without a scope issue
```

#### Scenario 3: A document path resolves outside the project root

The document path points outside the project boundary, so no outside document
is checked; the original path is retained as a non-fatal scope issue while
resolution continues.

```mermaid
sequenceDiagram
    autonumber
    actor Maintainer as Specification Document Maintainer
    participant Submission as LinkCheckFacade
    participant Check as LinkChecker
    participant Selection as LinkCheckScopeBuilder
    participant Context as ProjectContext
    participant Scope as LinkCheckScope

    Maintainer->>Submission: Delegate a document path outside the project root
    Submission->>Check: Initiate collection check
    Check->>Selection: Resolve delegated paths independently
    Selection->>Context: Determine whether the path remains in the project
    Context-->>Selection: Path is outside the project root
    Selection->>Scope: Retain original path with document-outside-project-root reason
    Note over Selection,Scope: Do not check outside files and continue remaining paths
```

#### Scenario 4: A delegated path identifies a missing file

The delegated path identifies no existing Markdown document, so the system
records a `document-not-found` scope issue and continues resolving other paths.

```mermaid
sequenceDiagram
    autonumber
    actor Maintainer as Specification Document Maintainer
    participant Submission as LinkCheckFacade
    participant Check as LinkChecker
    participant Selection as LinkCheckScopeBuilder
    participant Access as SpecificationDocumentRepository
    participant Scope as LinkCheckScope

    Maintainer->>Submission: Delegate a path to a missing Markdown file
    Submission->>Check: Initiate collection check
    Check->>Selection: Resolve delegated paths independently
    Selection->>Access: Determine whether the document exists
    Access-->>Selection: Document does not exist
    Selection->>Scope: Retain original path with document-not-found reason
    Note over Selection,Scope: Continue resolving remaining paths
```

### Detect Dead Links Recursively Through File References

**Workflow Source:** [Detect Dead Links Recursively Through File References](stories/detect-links-in-reference-chain.md)

#### Scenario 1: Check every reachable Markdown file in recursive mode

Recursive mode begins with the selected document, follows every eligible Markdown reference, and reports invalid links using the document that actually contains each link as its source.

```mermaid
sequenceDiagram
    autonumber
    actor Maintainer as Specification Document Maintainer
    participant Submission as LinkCheckFacade
    participant Check as LinkChecker
    participant Scope as LinkCheckScope
    participant Detection as DeadLinkInspector
    participant Access as SpecificationDocumentRepository
    participant Record as DeadResolvedSpecificationLink

    Maintainer->>Submission: Delegate a starting document in recursive mode
    Submission->>Check: Pass the delegation unchanged
    Check->>Detection: Check the starting scope and follow eligible references
    Detection->>Access: Obtain each reachable in-root Markdown document
    Detection->>Scope: Retain starting and reachable documents once
    Detection->>Record: Preserve invalid link from the indirectly reached document
    Detection-->>Check: Provide scope and traceable dead resolved-link variants
```

#### Scenario 2: Shallow mode checks only selected files

Shallow mode checks only the initially selected document and does not inspect referenced documents or report invalid links found only within them.

```mermaid
sequenceDiagram
    autonumber
    actor Maintainer as Specification Document Maintainer
    participant Submission as LinkCheckFacade
    participant Check as LinkChecker
    participant Scope as LinkCheckScope
    participant Detection as DeadLinkInspector

    Maintainer->>Submission: Delegate the starting document in shallow mode
    Submission->>Check: Pass the delegation unchanged
    Check->>Detection: Check selected documents only
    Detection->>Scope: Retain only the starting document
    Note over Detection,Scope: Do not inspect file A or file B and do not report file B's invalid link
```

#### Scenario 3: Recursive mode follows indirect references

Recursive mode follows references beyond the first level, adds indirectly reached Markdown documents to the scope, and reports their invalid links against their own paths.

```mermaid
sequenceDiagram
    autonumber
    actor Maintainer as Specification Document Maintainer
    participant Submission as LinkCheckFacade
    participant Check as LinkChecker
    participant Detection as DeadLinkInspector
    participant Access as SpecificationDocumentRepository
    participant Scope as LinkCheckScope
    participant Record as DeadResolvedSpecificationLink

    Maintainer->>Submission: Select the starting document in recursive mode
    Submission->>Check: Initiate recursive check
    Check->>Detection: Follow eligible references without a depth limit
    Detection->>Access: Obtain file A and then file B
    Detection->>Scope: Retain file B as checked
    Detection->>Record: Preserve file B as the invalid link's source
```

#### Scenario 4: The same file is reached through multiple reference paths

When multiple reference paths reach the same document, the scope recognizes that it was already checked and prevents duplicate checking and duplicate records.

```mermaid
sequenceDiagram
    autonumber
    actor Maintainer as Specification Document Maintainer
    participant Submission as LinkCheckFacade
    participant Check as LinkChecker
    participant Detection as DeadLinkInspector
    participant Scope as LinkCheckScope
    participant Record as DeadResolvedSpecificationLink

    Maintainer->>Submission: Request recursive checking with converging references
    Submission->>Check: Initiate recursive check
    Check->>Detection: Follow both reference paths
    Detection->>Scope: Determine whether the reached document was already checked
    Scope-->>Detection: Document already retained
    Note over Detection,Scope: Do not check the document again
    Detection->>Record: Retain the invalid link only once
```

#### Scenario 5: The reference chain contains a cycle

When traversal returns to a document already checked, the scope stops the cycle so each document and each invalid link are processed at most once.

```mermaid
sequenceDiagram
    autonumber
    actor Maintainer as Specification Document Maintainer
    participant Submission as LinkCheckFacade
    participant Check as LinkChecker
    participant Detection as DeadLinkInspector
    participant Scope as LinkCheckScope
    participant Record as DeadResolvedSpecificationLink

    Maintainer->>Submission: Request recursive checking of a cyclic reference chain
    Submission->>Check: Initiate recursive check
    Check->>Detection: Follow eligible references
    Detection->>Scope: Determine whether the next document was already checked
    Scope-->>Detection: Document already retained in this check
    Note over Detection,Scope: Stop repeating the cycle
    Detection->>Record: Retain each encountered invalid link at most once
```

#### Scenario 6: The reference chain contains a link to a non-existent file

The missing reference is reported under its applicable single-file rule, but the nonexistent target cannot be added to or expanded through the recursive scope.

```mermaid
sequenceDiagram
    autonumber
    actor Maintainer as Specification Document Maintainer
    participant Submission as LinkCheckFacade
    participant Check as LinkChecker
    participant Detection as DeadLinkInspector
    participant Access as SpecificationDocumentRepository
    participant Scope as LinkCheckScope
    participant Record as DeadResolvedSpecificationLink

    Maintainer->>Submission: Request recursive checking with a missing referenced file
    Submission->>Check: Initiate recursive check
    Check->>Detection: Validate and follow eligible references
    Detection->>Access: Determine whether the referenced target exists
    Access-->>Detection: Target does not exist
    Detection->>Record: Preserve the applicable single-file dead link outcome
    Note over Detection,Scope: Do not add the missing target to the check scope
```

### Generate a Raw Link Check Report

**Workflow Source:** [Generate a Raw Link Check Report](stories/generate-link-check-report.md)

#### Scenario 1: Detection succeeds with no dead links

The check completes successfully without document-path issues or invalid links,
so the raw report preserves the checked scope and empty issue and dead-link
collections.

```mermaid
sequenceDiagram
    autonumber
    actor Maintainer as Specification Document Maintainer
    participant Submission as LinkCheckFacade
    participant Check as LinkChecker
    participant Scope as LinkCheckScope
    participant Report as RawLinkCheckReport

    Maintainer->>Submission: Request a link check
    Submission->>Check: Initiate link check
    Scope-->>Check: Provide successful scope with no issues
    Note over Check: Detection succeeds with no dead links
    Check->>Report: Aggregate scope, empty issues, and empty dead links
```

#### Scenario 2: Detection succeeds with dead links

The check completes successfully with an invalid link, so the raw report
combines the check scope with the compliant dead resolved-link variant.

```mermaid
sequenceDiagram
    autonumber
    actor Maintainer as Specification Document Maintainer
    participant Submission as LinkCheckFacade
    participant Check as LinkChecker
    participant Scope as LinkCheckScope
    participant Record as DeadResolvedSpecificationLink
    participant Report as RawLinkCheckReport

    Maintainer->>Submission: Request a link check
    Submission->>Check: Initiate link check
    Scope-->>Check: Provide successful check scope
    Record-->>Check: Provide one compliant dead resolved-link variant
    Check->>Report: Aggregate scope and the dead resolved-link variant
```

#### Scenario 3: The report retains multiple dead resolved-link variants

The check produces records from multiple documents, and the raw report retains every original fact without calculating totals or reorganizing the results.

```mermaid
sequenceDiagram
    autonumber
    actor Maintainer as Specification Document Maintainer
    participant Submission as LinkCheckFacade
    participant Check as LinkChecker
    participant Scope as LinkCheckScope
    participant Record as DeadResolvedSpecificationLink
    participant Report as RawLinkCheckReport

    Maintainer->>Submission: Request a multi-document link check
    Submission->>Check: Initiate link check
    Scope-->>Check: Provide successful multi-document scope
    Record-->>Check: Provide every traceable dead resolved-link variant
    Check->>Report: Aggregate scope and every record unchanged
    Note over Report: Do not derive totals, grouping, sorting, or summaries
```

#### Scenario 4: Selection produces issues and no files

Selection contributes no documents but does produce non-fatal issues, so the system generates a raw report containing the empty file scope, all issues, and no dead links.

```mermaid
sequenceDiagram
    autonumber
    actor Maintainer as Specification Document Maintainer
    participant Submission as LinkCheckFacade
    participant Check as LinkChecker
    participant Scope as LinkCheckScope
    participant Report as RawLinkCheckReport

    Maintainer->>Submission: Delegate paths that contribute no files
    Submission->>Check: Initiate link check
    Scope-->>Check: Provide empty files and all document-path issues
    Check->>Report: Aggregate empty files, document-path issues, and empty dead links
```

#### Scenario 5a: The project context is invalid

The delegation cannot establish a valid project boundary, so the system
discards the check result and does not create a raw report.

```mermaid
sequenceDiagram
    autonumber
    actor Maintainer as Specification Document Maintainer
    participant Submission as LinkCheckFacade
    participant Check as LinkChecker
    participant Selection as LinkCheckScopeBuilder

    Maintainer->>Submission: Request a link check
    Submission->>Check: Initiate link check
    Check->>Selection: Establish valid project context and scope
    Selection-->>Check: Report invalid project context
    Note over Check: Do not generate a raw report and discard the check result
```

#### Scenario 5b: Detection cannot produce a trustworthy result

An unexpected failure prevents trustworthy detection despite a valid project context, so the system discards the result and does not create a raw report.

```mermaid
sequenceDiagram
    autonumber
    actor Maintainer as Specification Document Maintainer
    participant Submission as LinkCheckFacade
    participant Check as LinkChecker
    participant Detection as DeadLinkInspector

    Maintainer->>Submission: Request a link check with valid project context
    Submission->>Check: Initiate link check
    Check->>Detection: Coordinate dead link detection
    Detection-->>Check: Report an unexpected failure preventing a trustworthy result
    Note over Check: Do not generate a raw report and discard the check result
```

### Output a Link Check Report

**Workflow Source:** [Output a Link Check Report](stories/output-link-check-report.md)

#### Scenario 1: Output the report directly in the terminal

The maintainer selects terminal delivery, and the system emits the generated raw report unchanged without adding derived content.

```mermaid
sequenceDiagram
    autonumber
    actor Maintainer as Specification Document Maintainer
    participant Submission as LinkCheckFacade
    participant Check as LinkChecker
    participant Delivery as LinkCheckReportDispatcher
    participant Terminal as TerminalLinkCheckReporter

    Maintainer->>Submission: Choose terminal output for the generated report
    Submission->>Check: Submit selected output method
    Check->>Delivery: Deliver the raw report in the terminal
    Delivery->>Report: Obtain unchanged raw report facts
    Delivery->>Terminal: Emit the raw report without derived content
    Terminal-->>Delivery: Confirm terminal output
    Delivery-->>Check: Provide successful output outcome
    Check-->>Submission: Return successful output outcome
    Submission-->>Maintainer: Present the unchanged raw report
```

#### Scenario 2: Save the report to a file

The maintainer selects file delivery and provides a path, and the system saves the generated raw report there without changing its content.

```mermaid
sequenceDiagram
    autonumber
    actor Maintainer as Specification Document Maintainer
    participant Submission as LinkCheckFacade
    participant Check as LinkChecker
    participant Report as RawLinkCheckReport
    participant Delivery as LinkCheckReportDispatcher
    participant File as FileLinkCheckReporter

    Maintainer->>Submission: Choose file output and provide a save path
    Submission->>Check: Submit selected output method and path
    Check->>Delivery: Deliver the raw report to the provided path
    Delivery->>Report: Obtain unchanged raw report facts
    Delivery->>File: Save the raw report without derived content
    File-->>Delivery: Confirm file output
    Delivery-->>Check: Provide successful save outcome
    Check-->>Submission: Return successful save outcome
    Submission-->>Maintainer: Identify the saved raw report
```

#### Scenario 3: Save to a file without providing a save path

The maintainer selects file delivery without the required path, so the system asks for that path and does not save the report.

```mermaid
sequenceDiagram
    autonumber
    actor Maintainer as Specification Document Maintainer
    participant Submission as LinkCheckFacade
    participant Check as LinkChecker
    participant Report as RawLinkCheckReport
    participant Delivery as LinkCheckReportDispatcher

    Maintainer->>Submission: Choose file output without a save path
    Submission->>Check: Submit selected output method
    Check->>Delivery: Provide the owned raw report for file delivery
    Delivery-->>Check: Report the missing save path
    Check-->>Submission: Request the required save path
    Submission-->>Maintainer: Ask for a report save path
    Note over Check: Retain ownership of the raw report while requesting the path
    Note over Maintainer,Delivery: Do not save the report
```

#### Scenario 4: Report output fails

The selected destination fails, so the system explains the reason, does not fall back to another output method, and discards the raw report from this run.

```mermaid
sequenceDiagram
    autonumber
    actor Maintainer as Specification Document Maintainer
    participant Submission as LinkCheckFacade
    participant Check as LinkChecker
    participant Delivery as LinkCheckReportDispatcher
    participant File as FileLinkCheckReporter

    Maintainer->>Submission: Choose file output and provide a save path
    Submission->>Check: Submit selected output method and path
    Check->>Delivery: Coordinate selected file delivery
    Delivery->>File: Save the raw report unchanged
    File-->>Delivery: Report failure and reason
    Delivery-->>Check: Report failure without fallback
    Check-->>Submission: Explain the output failure
    Submission-->>Maintainer: Present output failure and reason
    Note over Check: Discard the owned raw report after delivery failure
```
