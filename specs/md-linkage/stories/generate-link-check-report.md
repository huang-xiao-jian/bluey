# Generate a Raw Link Check Report

**As a** specification document maintainer
**I want** to aggregate dead link detection results into a raw link check report
**So that** subsequent processes can deliver, present, or store the results as needed

## Acceptance Criteria

### Scenario 1: Detection succeeds with no dead links

**Given** this link check completes successfully and produces no dead link records

**When** a raw link check report is generated

**Then** the report records this check's scope

**And** the report's scope issue collection is empty

**And** the report's dead link record collection is empty

### Scenario 2: Detection succeeds with dead links

**Given** this link check completes successfully and produces one dead link record that complies with the [Dead Link Record Reporting Rules](../rules/dead-link-record-format.md)

**When** a raw link check report is generated

**Then** the report records this check's scope

**And** the report's dead link record collection contains that record

### Scenario 3: The report retains multiple raw dead link records

**Given** this link check completes successfully and produces multiple dead link records from multiple files

**When** a raw link check report is generated

**Then** the report's dead link record collection contains every input record

**And** every record retains its source file, original link text, link target, link scenario, and dead link reason

**And** the report does not precompute a total number of dead links, grouping, sorting, or summaries

### Scenario 4: Selection produces issues and no files

**Given** include selectors produce scope issues and select no files

**When** a raw link check report is generated

**Then** the report's file scope is empty

**And** the report contains every scope issue

**And** the report's dead link record collection is empty

### Scenario 5: The check cannot produce a trustworthy result

**Given** the request cannot establish a valid project context or an unexpected failure prevents the check from producing a trustworthy result

**When** a raw link check report is generated

**Then** the system does not generate a raw link check report

**And** the system discards the result of this check

## Business Rules

- A raw link check report must comply with the [Link Check Report Rules](../rules/link-check-report-format.md).

- A raw link check report aggregates only the check scope, which contains files and selector issues, and the dead link record collection. It does not reevaluate selector or link validity or determine how results are presented, stored, or delivered.

- Selector issues and an empty file scope are valid monitoring results and always produce a raw report. Discard the result only when the check cannot establish a valid project context or cannot produce a trustworthy result because of an unexpected failure.

- Every record in the dead link record collection must comply with the [Dead Link Record Reporting Rules](../rules/dead-link-record-format.md).
