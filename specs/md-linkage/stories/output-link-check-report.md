# Output a Link Check Report

**As a** specification document maintainer
**I want** to output a raw link check report using my chosen method
**So that** I can view, store, or use the report content in a location that suits my current work

## Acceptance Criteria

### Scenario 1: Output the report directly in the terminal

**Given** a raw report that conforms to the [Link Check Report](../glossary/LinkCheckReport.md) concept has been generated

**And** the user chooses to output the report in the terminal

**When** the link check report is output

**Then** the system outputs the report in the terminal

**And** the output content matches the raw link check report

**And** the output does not add, remove, or rewrite report content

**And** the output does not derive a total number of dead links, grouping, sorting, or summaries

### Scenario 2: Save the report to a file

**Given** a raw report that conforms to the [Link Check Report](../glossary/LinkCheckReport.md) concept has been generated

**And** the user chooses to save the report to a file

**And** the user provides a report save path

**When** the link check report is output

**Then** the system saves the report to the path provided by the user

**And** the saved content matches the raw link check report

**And** the saved content does not add, remove, or rewrite report content

**And** the saved content does not derive a total number of dead links, grouping, sorting, or summaries

### Scenario 3: Save to a file without providing a save path

**Given** a raw link check report has been generated

**And** the user chooses to save the report to a file

**And** the user does not provide a report save path

**When** the link check report is output

**Then** the system does not save the report

**And** the system clearly asks the user to provide a report save path

### Scenario 4: Report output fails

**Given** a raw link check report has been generated

**And** the user has selected a report output method

**And** that output method cannot complete

**When** the link check report is output

**Then** the system clearly explains the output failure and its reason

**And** the system does not automatically use a different output method

**And** the system discards this run's raw link check report

## Business Rules

- The output stage handles only a raw link check report that has already been generated.

- The output stage currently does not transform the raw link check report. It does not add, remove, or rewrite content or derive totals, grouping, sorting, or summaries.

- The output stage is an extension point. It can later add derived processing such as total dead link counts, grouping, sorting, and summaries without changing the facts in the raw link check report.

- The system currently supports outputting a report directly in the terminal or saving it to a file.

- When saving a report to a file, the user must provide a save path. If no save path is provided, do not save the report and ask the user to provide one.

- If report output fails, the system must explain the failure reason, must not automatically fall back to another output method, and must discard this run's raw link check report.
