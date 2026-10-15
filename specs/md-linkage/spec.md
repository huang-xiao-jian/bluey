# Markdown Linkage Specification

This document maps the use cases and business concepts for detecting dead links in Markdown specification documents.

## Use Cases

- [Check Specification Documents for Dead Links](use-case/check-specification-documents-for-dead-links.md) describes how a maintainer selects documents, checks their links, and obtains a traceable report.

## Concepts

- [Link Check Request](glossary/LinkCheckRequest.md) defines the project boundary, document selectors, exclusions, and traversal mode for a check.
- [Link Check Scope](glossary/LinkCheckScope.md) defines the selected starting documents and non-fatal selector issues.
- [Specification Link](glossary/SpecificationLink.md) defines the supported Markdown link forms extracted for validation.
- [Dead Link Record](glossary/DeadLinkRecord.md) defines the traceable result for one invalid link.
- [Link Check Report](glossary/LinkCheckReport.md) defines the raw result of one completed link check.
