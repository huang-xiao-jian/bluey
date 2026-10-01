# Detect Dead Links in a Single File (Epic)

**As a** specification document author
**I want** to run dead link detection for a specified file
**So that** I can quickly determine whether the file contains invalid links

## Scope

This epic covers local file links, in-file anchor links, and cross-file anchor links in a specified Markdown file. Each link type is defined and accepted by a separate user story:

- [Detect dead local file links](detect-local-file-links.md)
- [Detect dead in-file anchor links](detect-in-file-anchor-links.md)
- [Detect dead cross-file anchor links](detect-cross-file-anchor-links.md)

All dead link records produced by these stories must comply with the [Dead Link Record Reporting Rules](../rules/dead-link-record-format.md).
