# Object-Oriented Design Analysis: Check Specification Documents for Dead Links

## Document Information

- **Use-Case Name:** Check Specification Documents for Dead Links
- **Document Version:** 1.0
- **Authoring Date:** 2026-10-20

## Prerequities

- [Markdown Linkage Specification](spec.md)
- [Check Specification Documents for Dead Links](use-case/check-specification-documents-for-dead-links.md)
- [Single-Document Check](use-case/workflows/single-document-check-workflow.md)
- [Multiple-Document Check](use-case/workflows/multiple-document-check-workflow.md)
- [Link Check Scope Builder](roles/LinkCheckScopeBuilder.md)

## Step 1: Extract Nouns

### Candidate Nouns

| Candidate Noun                    |       Recognized Business Meaning       |           Independent Existence            |        Lifecycle         | Conclusion                                               |
| --------------------------------- | :-------------------------------------: | :----------------------------------------: | :----------------------: | -------------------------------------------------------- |
| Specification document maintainer |                   Yes                   |                    Yes                     |    No, this is a role    | External actor                                           |
| Link check delegation             |                   Yes                   |                    Yes                     |           Yes            | Candidate class                                          |
| Link check scope                  |                   Yes                   |                    Yes                     |           Yes            | Candidate class                                          |
| Scope issue                       |                   Yes                   |         No, it belongs to a scope          | No independent lifecycle | Part of `LinkCheckScope`                                 |
| Specification document collection |                   Yes                   |         Yes within one batch check         |           Yes            | Candidate class                                          |
| Specification document            |                   Yes                   |                    Yes                     |           Yes            | Candidate class                                          |
| Specification link                |                   Yes                   |        Yes within a source document        |           Yes            | Candidate class                                          |
| Resolved specification link       |                   Yes                   |           Yes as a check outcome           |           Yes            | Candidate class                                          |
| Live link                         |                   Yes                   |     No, it is one resolved-link status     | No independent lifecycle | Variant of `ResolvedSpecificationLink`                   |
| Dead link                         |                   Yes                   |     No, it is one resolved-link status     | No independent lifecycle | Variant of `ResolvedSpecificationLink`                   |
| Dead reason                       |                   Yes                   |      No, it qualifies a dead outcome       | No independent lifecycle | Part of `ResolvedSpecificationLink`                      |
| Link check report                 |                   Yes                   |                    Yes                     |           Yes            | Candidate class                                          |
| Project root                      |                   Yes                   | No, it defines a boundary for a delegation | No independent lifecycle | Part of `LinkCheckDelegation` and resolved-link location |
| Document path                     |                   Yes                   |        No, it identifies a document        | No independent lifecycle | Value within delegation, scope, document, or issue       |
| Check mode                        |                   Yes                   |      No, it selects traversal policy       | No independent lifecycle | Value within `LinkCheckDelegation`                       |
| Atomic link check task            | No, this is a workflow input structure  |                     No                     |            No            | Not a business class                                     |
| Atomic link check artifact        | No, this is a workflow output structure |                     No                     |            No            | Outcomes belong to the checking workflow                 |
| Pending collection                |  No, this is transient workflow state   |                     No                     |            No            | State within `SpecificationDocumentRepository`           |

### Confirmed Candidate Classes

1. **LinkCheckDelegation:** Carries the maintainer's complete intent and remains traceable in the final report.
2. **LinkCheckScope:** Carries the accepted starting documents and tolerated path issues established from the delegation.
3. **SpecificationDocumentRepository:** Preserves the ordered pending and checked documents throughout one batch check.
4. **SpecificationDocument:** Gives link extraction and heading derivation a business object with a stable project-relative identity.
5. **SpecificationLink:** Preserves each supported authored link before validation.
6. **ResolvedSpecificationLink:** Preserves the unique live or dead result produced for a specification link.
7. **LinkCheckReport:** Captures the completed delegation, its scope, and all dead outcomes.

## Step 2: Identify Verbs

### Extracted Verbs

| Verb                                              | Business Function                                    | Candidate Class                     |
| ------------------------------------------------- | ---------------------------------------------------- | ----------------------------------- |
| Delegate a check                                  | Preserve the maintainer's check intent               | `LinkCheckDelegation`               |
| Establish a stable project boundary               | Determine whether checking can begin                 | `LinkCheckScopeBuilder`             |
| Evaluate delegated document paths                 | Select valid starting documents and record issues    | `LinkCheckScopeBuilder`             |
| Maintain pending and checked documents            | Preserve ordered batch-check progress and uniqueness | `SpecificationDocumentRepository`   |
| Check an ordered document collection              | Coordinate multiple-document checking                | `SpecificationDocumentBatchChecker` |
| Check whether a document was already processed    | Prevent duplicate and cyclic work                    | `SpecificationDocumentBatchChecker` |
| Check one document                                | Coordinate link checking within one document         | `SpecificationDocumentChecker`      |
| Extract supported links                           | Identify authored links eligible for validation      | `SpecificationLinkExtractor`        |
| Derive heading identifiers                        | Establish valid anchor targets in a document         | `SpecificationHeadingCataloger`     |
| Resolve a link target                             | Determine the target file and anchor                 | `SpecificationLinkChecker`          |
| Check containment, existence, and anchor identity | Determine whether one link is live or dead           | `SpecificationLinkChecker`          |
| Follow live Markdown references                   | Discover additional documents in recursive mode      | `ReferencedDocumentDiscoverer`      |
| Aggregate dead outcomes                           | Preserve all dead results from checked documents     | `SpecificationDocumentBatchChecker` |
| Prepare a report                                  | Establish the raw result of a completed check        | `LinkCheckReportFabricator`         |
| Obtain a report                                   | Receive the use-case outcome                         | `SpecificationDocumentMaintainer`   |

### Functional Clustering Results

1. **LinkCheckWorkflowScheduler:** Connects scope construction, collection checking, and report preparation into the complete use case.
2. **LinkCheckScopeBuilder:** Owns the decisions required to transform a valid delegation into a scope.
3. **SpecificationDocumentBatchChecker:** Coordinates collection traversal, result aggregation, and traversal-mode application.
4. **SpecificationDocumentChecker:** Owns the complete single-document subprocess without absorbing the specialized link and heading responsibilities.
5. **SpecificationLinkExtractor:** Identifies the three supported link forms and preserves authored material.
6. **SpecificationHeadingCataloger:** Establishes heading identifiers for anchor checks.
7. **SpecificationLinkChecker:** Applies target-resolution and validation precedence to one link.
8. **ReferencedDocumentDiscoverer:** Applies recursive discovery only to eligible live outcomes.
9. **LinkCheckReportFabricator:** Establishes the traceable raw report after checking completes.

## Step 3: Assign Responsibilities

### Responsibility Questions for Key Actions

| Action                      | Question                                                         | Responsible Class                   | Responsibility                                                                         |
| --------------------------- | ---------------------------------------------------------------- | ----------------------------------- | -------------------------------------------------------------------------------------- |
| Begin a check               | Who preserves exactly what the maintainer delegated?             | `LinkCheckDelegation`               | Preserve root, starting paths, and traversal mode                                      |
| Coordinate the use case     | Who connects delegation, scope, checking, and reporting?         | `LinkCheckWorkflowScheduler`        | Coordinate the end-to-end business workflow                                            |
| Establish the scope         | Who interprets the delegation and evaluates paths?               | `LinkCheckScopeBuilder`             | Produce the ordered valid scope and tolerated issues                                   |
| Maintain batch progress     | Who preserves the ordered pending and checked documents?         | `SpecificationDocumentRepository`   | Admit each starting or discovered document once and supply the next unchecked document |
| Process multiple documents  | Who coordinates the pending and checked collections?             | `SpecificationDocumentBatchChecker` | Check each document at most once and aggregate outcomes                                |
| Process one document        | Who ensures every supported link receives one result?            | `SpecificationDocumentChecker`      | Coordinate extraction, heading cataloging, and per-link checking                       |
| Recognize supported links   | Who turns authored Markdown links into specification links?      | `SpecificationLinkExtractor`        | Identify supported forms without changing authored material                            |
| Establish valid headings    | Who supplies the anchor identities used during checking?         | `SpecificationHeadingCataloger`     | Catalog the document's heading identifiers                                             |
| Classify one link           | Who applies containment and target checks in the required order? | `SpecificationLinkChecker`          | Establish exactly one live or dead resolved-link outcome                               |
| Expand a recursive check    | Who selects newly reached Markdown documents?                    | `ReferencedDocumentDiscoverer`      | Discover eligible targets not already pending or checked                               |
| Produce the use-case result | Who combines delegation, scope, and dead outcomes?               | `LinkCheckReportFabricator`         | Prepare the raw `LinkCheckReport`                                                      |
| Receive the result          | Who consumes the traceable report?                               | `SpecificationDocumentMaintainer`   | Receive the completed report for repair work                                           |

### Additional Coordination Classes

- **LinkCheckWorkflowScheduler:** Required because no entity or subprocess-level class should coordinate the complete use case.
- **SpecificationDocumentBatchChecker:** Required to keep ordering, deduplication, traversal policy, and aggregation out of the single-document subprocess.
- **SpecificationDocumentChecker:** Required to keep the single-document workflow separate from both collection traversal and individual-link decisions.

## Step 4: Handle Exceptions

### Exception Scenarios

| Exception Scenario                                        |                             Removal Test                             |               Business-Stakeholder Involvement Test               | Conclusion                                             |
| --------------------------------------------------------- | :------------------------------------------------------------------: | :---------------------------------------------------------------: | ------------------------------------------------------ |
| Delegated project root cannot establish a stable boundary |       The check cannot establish trustworthy paths or continue       |         Maintainers define the intended project boundary          | Fatal business exception                               |
| Delegated document is outside the project root            |             That document cannot safely enter the check              |            Maintainers must correct the delegated path            | Tolerated business exception recorded in scope         |
| Delegated document is missing                             |                   That document cannot be checked                    |         Maintainers must restore or correct the document          | Tolerated business exception recorded in scope         |
| Delegated target is not Markdown                          |           That target is outside the stated document kind            | Maintainers decide which specification documents belong in scope  | Tolerated business exception recorded in scope         |
| Link target is outside the project root                   |      The link cannot be validated within the delegated boundary      | Maintainers must repair the authored reference or boundary choice | Dead-link business outcome                             |
| Link target file is missing                               |                The link cannot be classified as live                 |    Maintainers must repair the reference or restore the target    | Dead-link business outcome                             |
| Link anchor does not identify a heading                   |            The anchored link cannot be classified as live            |           Maintainers must repair the anchor or heading           | Dead-link business outcome                             |
| Document is already checked                               |               The main flow can finish by skipping it                |                 No business decision is required                  | Normal duplicate or cycle prevention, not an exception |
| No supported links exist                                  |          The main flow still finishes with an empty result           |                No business resolution is required                 | Normal empty outcome, not an exception                 |
| Document access fails for a technical reason              | This concerns infrastructure availability rather than link semantics |    No business interpretation is defined by the specification     | Technical exception outside this design stage          |

### Exception Responsibility Assignment

**Invalid Project Root**

- Observer: `LinkCheckScopeBuilder`
- Decision-maker: `LinkCheckScopeBuilder`
- Executor: `LinkCheckWorkflowScheduler`, which stops the workflow without preparing a report

**Delegated Document Path Issue**

- Observer: `LinkCheckScopeBuilder`
- Decision-maker: `LinkCheckScopeBuilder`
- Executor: `LinkCheckScopeBuilder`, which records the issue in `LinkCheckScope` and continues

**Dead Link Target**

- Observer: `SpecificationLinkChecker`
- Decision-maker: `SpecificationLinkChecker`
- Executor: `SpecificationLinkChecker`, which establishes the applicable dead `ResolvedSpecificationLink` variant

### Additional Exception-Handling Classes

No additional exception-handling class is justified. The specification assigns invalid-root and delegated-path decisions to the scope-building role, while dead-target decisions are the primary responsibility of individual-link checking. Creating separate handlers would split responsibilities without adding business meaning.

### Relationship Between the Exception Flow and Main Flow

- Main flow: `LinkCheckWorkflowScheduler` → `LinkCheckScopeBuilder` → `SpecificationDocumentBatchChecker` → `SpecificationDocumentChecker` → `SpecificationLinkChecker` → `LinkCheckReportFabricator`
- Invalid-root flow: `LinkCheckScopeBuilder` stops `LinkCheckWorkflowScheduler` before collection checking or report preparation.
- Tolerated-path flow: `LinkCheckScopeBuilder` records the issue in `LinkCheckScope` and evaluates the next delegated path.
- Dead-link flow: `SpecificationLinkChecker` returns a dead `ResolvedSpecificationLink`; `SpecificationDocumentBatchChecker` aggregates it and continues the check.

## Step 5: Refine Boundaries

### Functional-Boundary Categories

| Category           | Class                               | Functional Role                                                        |
| ------------------ | ----------------------------------- | ---------------------------------------------------------------------- |
| Entity class       | `LinkCheckDelegation`               | Preserve the maintainer's check intent                                 |
| Entity class       | `LinkCheckScope`                    | Preserve accepted starting documents and path issues                   |
| Entity class       | `SpecificationDocumentRepository`   | Preserve the ordered pending and checked documents for one batch check |
| Entity class       | `SpecificationDocument`             | Represent one checked specification document                           |
| Entity class       | `SpecificationLink`                 | Preserve one supported authored link                                   |
| Entity class       | `ResolvedSpecificationLink`         | Preserve one immutable validation outcome                              |
| Entity class       | `LinkCheckReport`                   | Preserve the raw result of one completed delegation                    |
| Decision class     | `LinkCheckScopeBuilder`             | Decide which delegated documents enter the scope                       |
| Decision class     | `SpecificationLinkChecker`          | Decide whether one resolved link is live or dead                       |
| Decision class     | `ReferencedDocumentDiscoverer`      | Decide which live targets extend a recursive check                     |
| Execution class    | `SpecificationLinkExtractor`        | Extract supported authored links                                       |
| Execution class    | `SpecificationHeadingCataloger`     | Establish heading identifiers for anchor checks                        |
| Execution class    | `LinkCheckReportFabricator`         | Prepare the completed raw report                                       |
| Coordination class | `LinkCheckWorkflowScheduler`        | Coordinate the complete use case                                       |
| Coordination class | `SpecificationDocumentBatchChecker` | Coordinate the multiple-document subprocess                            |
| Coordination class | `SpecificationDocumentChecker`      | Coordinate the single-document subprocess                              |

### Hierarchical Boundaries

**Use-case level:**

- `LinkCheckDelegation` — Represents the maintainer's requested check.
- `LinkCheckScope` — Represents the accepted starting documents and path issues.
- `LinkCheckReport` — Represents the traceable result.
- `LinkCheckWorkflowScheduler` — Coordinates the complete use case.
- `LinkCheckScopeBuilder` — Establishes the scope.
- `LinkCheckReportFabricator` — Prepares the final raw report.

**Specification Document Batch Check:**

- `SpecificationDocumentBatchChecker` — Coordinates ordered, deduplicated document checking.
- `SpecificationDocumentRepository` — Preserves the ordered pending and checked working set.
- `ReferencedDocumentDiscoverer` — Extends recursive checks through eligible live references.

**Single-document subprocess:**

- `SpecificationDocument` — Represents the current document.
- `SpecificationLink` — Represents an authored supported link.
- `ResolvedSpecificationLink` — Represents a checked link outcome.
- `SpecificationDocumentChecker` — Coordinates one document check.
- `SpecificationLinkExtractor` — Identifies supported links.
- `SpecificationHeadingCataloger` — Establishes valid heading identifiers.
- `SpecificationLinkChecker` — Resolves and classifies one link.

## Step 6: Define Class Relationships

The class model distinguishes stable object structure from temporary use. No
relationship label is required because the UML line type and multiplicity carry
the relationship meaning.

### Composition

- One `SpecificationDocument` composes zero or more `SpecificationLink`
  instances. An authored link belongs to one source document and has no useful
  identity outside that document.

### Aggregation

- One `LinkCheckScope` aggregates zero or more `SpecificationDocument`
  instances accepted as starting documents. The documents remain meaningful
  independently of the scope.
- One `SpecificationDocumentRepository` aggregates zero or more
  `SpecificationDocument` instances as its pending and checked working set. The
  repository manages membership without owning document identity.
- One `LinkCheckReport` aggregates one `LinkCheckDelegation`, one
  `LinkCheckScope`, and zero or more dead `ResolvedSpecificationLink`
  instances. Each object exists before report fabrication and remains a
  traceable result object rather than a report-owned part.

### Association

- Each `ResolvedSpecificationLink` has a navigable association to exactly one
  `SpecificationLink`, preserving the authored link behind the outcome.
- Each `SpecificationDocumentBatchChecker` has a navigable association to one
  `SpecificationDocumentRepository`, whose changing state spans the batch
  check.

### Dependency

- The external maintainer, coordinators, builders, checkers, discoverer,
  extractor, cataloger, and fabricator depend on the objects they consume or
  create during an operation.
- Dependencies do not imply ownership, persistent fields, or call sequence.
  They record only that a class requires another class to fulfill its
  responsibility.

## Final Candidate-Class List

1. **`LinkCheckDelegation`:** Represents the maintainer's instruction to check documents within a project boundary. Collaborates with `SpecificationDocumentMaintainer`, `LinkCheckWorkflowScheduler`, `LinkCheckScopeBuilder`, `SpecificationDocumentBatchChecker`, and `LinkCheckReport`.
2. **`LinkCheckScope`:** Represents accepted starting documents and tolerated path issues. Collaborates with `LinkCheckScopeBuilder`, `SpecificationDocumentRepository`, `SpecificationDocumentBatchChecker`, and `LinkCheckReport`.
3. **`SpecificationDocumentRepository`:** Represents the ordered pending and checked documents for one batch check. Collaborates with `LinkCheckScope`, `SpecificationDocument`, `SpecificationDocumentBatchChecker`, and `ReferencedDocumentDiscoverer`.
4. **`SpecificationDocument`:** Represents one Markdown specification document being checked. Collaborates with `SpecificationDocumentRepository`, `SpecificationDocumentChecker`, `SpecificationLinkExtractor`, and `SpecificationHeadingCataloger`.
5. **`SpecificationLink`:** Represents one supported link exactly as authored. Collaborates with `SpecificationLinkExtractor`, `SpecificationLinkChecker`, and `ResolvedSpecificationLink`.
6. **`ResolvedSpecificationLink`:** Represents one traceable live or dead link-check outcome. Collaborates with `SpecificationLink`, `SpecificationLinkChecker`, `SpecificationDocumentChecker`, `ReferencedDocumentDiscoverer`, `SpecificationDocumentBatchChecker`, and `LinkCheckReport`.
7. **`LinkCheckReport`:** Represents the raw result of one completed delegation. Collaborates with `LinkCheckDelegation`, `LinkCheckScope`, `ResolvedSpecificationLink`, `LinkCheckReportFabricator`, and `SpecificationDocumentMaintainer`.
8. **`LinkCheckWorkflowScheduler`:** Coordinates the complete use case. Collaborates with `SpecificationDocumentMaintainer`, `LinkCheckDelegation`, `LinkCheckScopeBuilder`, `SpecificationDocumentBatchChecker`, `LinkCheckReportFabricator`, and `LinkCheckReport`.
9. **`LinkCheckScopeBuilder`:** Establishes a scope or stops for an invalid project root. Collaborates with `LinkCheckDelegation`, `LinkCheckScope`, and `LinkCheckWorkflowScheduler`.
10. **`SpecificationDocumentBatchChecker`:** Coordinates ordered multi-document checking and outcome aggregation. Collaborates with `LinkCheckDelegation`, `LinkCheckScope`, `SpecificationDocumentRepository`, `SpecificationDocumentChecker`, `ReferencedDocumentDiscoverer`, `ResolvedSpecificationLink`, and `LinkCheckWorkflowScheduler`.
11. **`SpecificationDocumentChecker`:** Coordinates checking every supported link in one document. Collaborates with `SpecificationDocument`, `SpecificationLinkExtractor`, `SpecificationHeadingCataloger`, `SpecificationLinkChecker`, `ResolvedSpecificationLink`, and `SpecificationDocumentBatchChecker`.
12. **`SpecificationLinkExtractor`:** Identifies supported links while preserving authored material. Collaborates with `SpecificationDocument`, `SpecificationLink`, and `SpecificationDocumentChecker`.
13. **`SpecificationHeadingCataloger`:** Establishes heading identifiers used for anchor checks. Collaborates with `SpecificationDocument`, `SpecificationDocumentChecker`, and `SpecificationLinkChecker`.
14. **`SpecificationLinkChecker`:** Resolves and classifies one specification link. Collaborates with `SpecificationLink`, `SpecificationHeadingCataloger`, `ResolvedSpecificationLink`, and `SpecificationDocumentChecker`.
15. **`ReferencedDocumentDiscoverer`:** Selects unchecked Markdown targets reached in recursive mode. Collaborates with `LinkCheckDelegation`, `ResolvedSpecificationLink`, `SpecificationDocumentRepository`, and `SpecificationDocumentBatchChecker`.
16. **`LinkCheckReportFabricator`:** Prepares the completed raw report. Collaborates with `LinkCheckDelegation`, `LinkCheckScope`, `ResolvedSpecificationLink`, `LinkCheckReport`, and `LinkCheckWorkflowScheduler`.
