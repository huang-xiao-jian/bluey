# Dead Link Detection Requirements for Specification Documents

## Context

In a **Specification-Driven Development** workflow, business documents are the team's shared single source of truth. Documents reference one another through links, forming a complete document network that connects the system's overall structural design. When links break because files move or headings are renamed, document readability is seriously degraded. These issues are often hidden during execution until they appear as business exceptions during system acceptance, making delayed remediation expensive.

## Goal

**Quickly detect dead links in specification documents, generate a raw report that can be located and traced, and output the report on demand** so that authors and maintainers can promptly discover and repair invalid references.

## References

- [Dead Link Detection Technical Design](design.md) defines the implementation architecture and package selections for these requirements.

## Epic Story

**As a** specification document author and maintainer
**I want** to check the Markdown files I choose, optionally follow their file references, and output a report on demand
**So that** I can promptly discover and repair invalid references

## Business Metrics

### Consistent Dead Link Reporting Format

Dead link records produced by all detection sub-stories must comply with the [Dead Link Record Reporting Rules](rules/dead-link-record-format.md), so downstream report generation can consume data consistently without structural differences caused by different sources.

### Traceable Dead Link Locations

Every dead link record must be traceable to its source file, original link text, link target, link scenario, and dead link reason, enabling maintainers to locate and repair the link quickly.

### Extensible Raw Check Reports

Raw link check reports must comply with the [Link Check Report Rules](rules/link-check-report-format.md) and retain only the check scope and dead link record collection. Subsequent stages handle derived statistics, content organization, and output methods.

## User Story Journey

### Journey Overview

Trigger a check → Detect dead links → Generate a raw report → Format the report → Output the report → Locate and repair

Maintainers select one or more Markdown files and choose whether to follow references to other Markdown files. After detection succeeds, the system generates a raw link check report and proceeds to formatting and output. If detection does not succeed, the system discards the result. The current formatting stage outputs the raw report directly; its capabilities can be extended later. Maintainers can view the report in the terminal or save it to a specified path before locating and repairing issues.

### Journey Stages

1. **Trigger a check**
   - User action: Choose the Markdown files to check and whether to follow their references.
   - System response: Determine which Markdown files to check.
   - System output: A list of Markdown files actually checked.

2. **Detect dead links**
   - System response: Categorize and validate links in the files.
   - System output: Dead link records in a consistent format.

3. **Generate a raw report**
   - Prerequisite: Dead link detection has completed successfully.
   - System response: Aggregate the check scope and dead link record collection.
   - System output: A raw link check report that complies with the [Link Check Report Rules](rules/link-check-report-format.md).
   - Alternate flow: If dead link detection does not complete successfully, the system discards the result, does not generate a raw report, and does not proceed to formatting or output.

4. **Format the report**
   - Prerequisite: A raw link check report has been generated.
   - System response: Currently, output the raw link check report directly without derived processing.
   - System output: Report content for the output stage.
   - Extension point: Add formatting capabilities later, such as statistics, grouping, sorting, and summaries, without changing the raw-report facts.

5. **Output the report**
   - User action: Choose to output the report directly in the terminal or save it to a file and provide a save path.
   - System response: Output the formatted report content using the selected method.
   - Alternate flow: If no file save path is provided, the system asks the user to provide one. If output fails, the system explains why, does not automatically switch output methods, and discards the raw and formatted reports from this run.

6. **Locate and repair**
   - User action: Review the output report and locate the issue.

## User Stories

- [Detect dead links in a single file](stories/detect-links-in-single-file.md)
  - [Detect dead local file links](stories/detect-local-file-links.md)
  - [Detect dead in-file anchor links](stories/detect-in-file-anchor-links.md)
  - [Detect dead cross-file anchor links](stories/detect-cross-file-anchor-links.md)
- [Detect dead links recursively through file references](stories/detect-links-in-reference-chain.md)
- [Detect dead links in a file collection](stories/detect-links-in-file-collection.md)
- [Generate a raw link check report](stories/generate-link-check-report.md)
- [Format a link check report](stories/format-link-check-report.md)
- [Output a link check report](stories/output-link-check-report.md)
