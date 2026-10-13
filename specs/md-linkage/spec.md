# Dead Link Detection Requirements for Specification Documents

## Context

In a **Specification Driven Development** workflow, business documents are the team's shared single source of truth. Documents reference one another through links, forming a complete document network that connects the system's overall structural design. When links break since sorts of reasons, document readability is seriously degraded. These issues are often hidden during execution until business exceptions captured during system acceptance, making delayed remediation expensive.

## Goal

**Quickly detect dead links in specification documents, generate a diagnose report that can be located and traced** so that maintainers can promptly discover and repair invalid references.

## Epic Story

**As a** specification document author and maintainer
**I want** to check specific Markdown files, optionally follow their file references, and inspect final report
**So that** I can promptly discover and repair invalid references

## Business Metrics

### Consistent Dead Link Format

Dead link records produced by all detection sub-stories must conform to the [Dead Link Record](glossary/DeadLinkRecord.md) concept, so downstream report generators can consume data consistently without structural differences caused by different sources.

### Traceable Dead Link Locations

Every dead link record must identify the project and source file containing the link, preserve the original link and its parsed components, identify the resolved target file and anchor when applicable, and state whether the target file or anchor could not be found.

### Extensible Link Check Report

The core provides a raw report that conforms to the [Link Check Report](glossary/LinkCheckReport.md) concept. The output stage handles derived statistics, content organization, and output methods.

## User Story Journey

### Journey Overview

Trigger a check → Detect dead links → Generate a raw report → Output the report → Locate and repair

Maintainers select one or more Markdown files and choose whether to follow references recursively. After detection succeeds, the system generates a raw link check report and proceeds to output. If detection does not succeed, the system discards the result. The output stage currently emits the raw report without derived processing; Maintainers can view the report save the report before locating and repairing issues.

### Journey Stages

1. **Trigger a check**
   - User action: Choose the Markdown files to check and whether to follow their references recursively.
   - System response: Determine which Markdown files to check and retain non-fatal selector issues.
   - System output: A list of Markdown files actually checked and any scope issues. An empty file list still proceeds through the journey.

2. **Detect dead links**
   - System response: Categorize and validate links in the files.
   - System output: Dead link records in a consistent format.

3. **Generate a raw report**
   - Prerequisite: Dead link detection has completed successfully.
   - System response: Aggregate the check scope, including selector issues, and the dead link record collection.
   - System output: A raw report that conforms to the [Link Check Report](glossary/LinkCheckReport.md) concept even when no files or links are processed.

4. **Output the report**
   - Prerequisite: A raw link check report has been generated.
   - System response: Prepare and output the report using the selected method. Currently, the system supports Terminal or File Persistance.
   - Extension point: Add formatting capabilities later, such as statistics, grouping, sorting, and summaries, without changing the raw-report facts.

5. **Locate and repair**
   - User action: Review the output report and locate the issue.

## User Stories

- [Detect dead links in a single file](stories/detect-links-in-single-file.md)
  - [Detect dead local file links](stories/detect-local-file-links.md)
  - [Detect dead in-file anchor links](stories/detect-in-file-anchor-links.md)
  - [Detect dead cross-file anchor links](stories/detect-cross-file-anchor-links.md)
- [Detect dead links recursively through file references](stories/detect-links-in-reference-chain.md)
- [Detect dead links in a file collection](stories/detect-links-in-file-collection.md)
- [Generate a raw link check report](stories/generate-link-check-report.md)
- [Output a link check report](stories/output-link-check-report.md)

## References

- [Dead Link Detection Technical Design](design.md) defines the implementation architecture and package selections for these requirements.
