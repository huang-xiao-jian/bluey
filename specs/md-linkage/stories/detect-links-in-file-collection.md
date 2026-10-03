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

### Scenario 4: An include glob matches no files

**Given** an include glob matches no Markdown files

**When** the link check runs

**Then** the report's check scope contains no files

**And** the report's scope issues contain the original glob with the `glob-no-match` reason

**And** the report is generated with no dead link records

### Scenario 5: Exclusions remove every selected file

**Given** valid include selectors select Markdown files

**And** exclusions remove every selected file

**When** the link check runs

**Then** the report's check scope contains no files

**And** the report's scope issue collection is empty

**And** the report is generated with no dead link records

### Scenario 6: An absolute selector identifies a file inside the project root

**Given** an absolute include selector identifies an existing Markdown file inside the project root

**When** the link check runs

**Then** the file is checked

**And** the report records the file in the check scope using its project-relative path

**And** the selector does not produce a scope issue

### Scenario 7: A selector resolves outside the project root

**Given** an include selector resolves outside the project root

**When** the link check runs

**Then** no file outside the project root is checked

**And** the report's scope issues contain the original selector with the `selector-outside-project-root` reason

**And** the system continues resolving the remaining include selectors

### Scenario 8: A literal include selector identifies a missing file

**Given** a literal include selector identifies a Markdown file that does not exist

**When** the link check runs

**Then** the report's scope issues contain the original selector with the `literal-file-not-found` reason

**And** the system continues resolving the remaining include selectors

## Business Rules

- A collection can contain explicitly named Markdown files, files matched by a pattern, or both. Exclusions remove matching files from the collection. A file selected more than once is checked once.

- A problem with one include selector does not prevent other selectors from contributing files. Selection problems are retained in `scope.issues`, and an empty file scope still produces a report.

- This story covers checking the selected collection. Following links to additional Markdown files is covered by [Detect Dead Links Recursively Through File References](detect-links-in-reference-chain.md).

- The request fields, selector syntax, and project-root rules are defined by the [Link Check Request Rules](../rules/link-check-request-format.md).
