# Format a Link Check Report

**As a** specification document maintainer
**I want** to pass a raw link check report to the formatting stage
**So that** report formatting can evolve independently of the final output method

## Acceptance Criteria

### Scenario 1: The current formatting stage outputs the raw report directly

**Given** a raw link check report that complies with the [Link Check Report Rules](../rules/link-check-report-format.md) has been generated

**When** the link check report is formatted

**Then** the formatting stage outputs that raw link check report

**And** the output does not add, remove, or rewrite report content

**And** the output does not derive a total number of dead links, grouping, sorting, or summaries

## Business Rules

- The formatting stage handles only a raw link check report that has already been generated.

- The current formatting stage does not transform the raw link check report; it outputs the raw report directly.

- The formatting stage is an extension point. It can later add derived processing such as total dead link counts, grouping, sorting, and summaries without changing the facts in the raw link check report.

- Formatting does not determine the final destination or channel for report output.
