# Markdown Linkage Specification

This document maps the use cases and business concepts for detecting dead links in Markdown specification documents.

## Use Cases

- [Check Specification Documents for Dead Links](use-case/check-specification-documents-for-dead-links.md) describes how a maintainer selects documents, checks their links, and obtains a traceable report.

## Receptionist Layer

- [CLI and MCP Receptionist Layer](receptionist-layer.md) defines how terminal
  consumers and AI clients invoke the shared link-checking workflow and receive
  its report.

## Concepts

- [Link Check Delegation](glossary/LinkCheckDelegation.md) defines the project boundary, explicitly delegated document paths, and traversal mode for a check.
- [Link Check Scope](glossary/LinkCheckScope.md) defines the resulting starting
  documents and recorded document-path issues.
- [Specification Link](glossary/SpecificationLink.md) defines the supported Markdown link forms extracted for validation.
- [Resolved Specification Link](glossary/ResolvedSpecificationLink.md) defines
  the traceable live and dead variants produced by link validation.
- [Link Check Report](glossary/LinkCheckReport.md) defines the raw result of one completed link check.

## Roles

- [Link Check Scope Builder](roles/LinkCheckScopeBuilder.md) defines the
  exceptions and algorithm for transforming a delegation into a scope.
