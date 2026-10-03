# Detect Dead Links in a File Collection

**As a** specification document maintainer
**I want** to check a chosen collection of Markdown files for dead links
**So that** I can find issues across the files relevant to my work

## Acceptance Criteria

### Scenario 1: Check explicitly named Markdown files

**Given** `a.md` and `b.md` exist and each contains an invalid link

**And** the maintainer has selected `a.md` and `b.md` without following file references

**When** the link check runs

**Then** the report's check scope contains `a.md` and `b.md`

**And** the report contains a dead link record from each file

### Scenario 2: Check files matched by a pattern

**Given** `specs/a.md` and `specs/b.md` each contain an invalid link

**And** `notes/c.md` also contains an invalid link

**And** the maintainer has selected files matching `specs/*.md` without following file references

**When** the link check runs

**Then** the report's check scope contains `specs/a.md` and `specs/b.md`, but not `notes/c.md`

**And** the report contains dead link records from the two checked files, but not from `notes/c.md`

### Scenario 3: Exclude named files and files matched by a pattern

**Given** `specs/a.md`, `specs/draft.md`, and `specs/archive/old.md` each contain an invalid link

**And** the maintainer has selected Markdown files under `specs/` without following file references

**And** has excluded `specs/draft.md` and files under `specs/archive/`

**When** the link check runs

**Then** the report's check scope contains only `specs/a.md`

**And** the report contains a dead link record only from `specs/a.md`

### Scenario 4: No files are selected

**Given** no Markdown files match the maintainer's selection after exclusions

**When** the link check runs

**Then** the maintainer receives an error explaining that no files were selected

**And** no report is generated

## Business Rules

- A collection can contain explicitly named Markdown files, files matched by a pattern, or both. Exclusions remove matching files from the collection. A file selected more than once is checked once.

- This story covers checking the selected collection. Following links to additional Markdown files is covered by [Detect Dead Links Recursively Through File References](detect-links-in-reference-chain.md).

- The request fields, selector syntax, and project-root rules are defined by the [Link Check Request Rules](../rules/link-check-request-format.md).
