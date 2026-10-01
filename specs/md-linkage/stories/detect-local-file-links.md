# Detect Dead Local File Links

**As a** specification document author
**I want** to determine whether links to local files in a specified file are valid
**So that** I can find dead links caused by incorrect paths, deleted files, or moved files

## Acceptance Criteria

### Scenario 1: The target local file exists

**Given** a specified Markdown file contains a link to an existing local file

**When** dead link detection runs for that file

**Then** the link does not produce a dead link record

### Scenario 2: The target local file does not exist

**Given** a specified Markdown file contains a link to a non-existent local file

**When** dead link detection runs for that file

**Then** the link produces one dead link record

**And** the record's link type is `local-file`

**And** the record's dead link reason is `local-file-not-found`

**And** the record complies with the [Dead Link Record Reporting Rules](../rules/dead-link-record-format.md)

### Scenario 3: Fragment-only links are not handled by this story

**Given** a specified Markdown file contains a fragment-only link

**When** local file links are detected according to this story

**Then** the link is not validated as a local file link and does not produce a dead link record

**And** the link is handled by the “Detect Dead In-File Anchor Links” story

### Scenario 4: Links containing a file path and anchor are not handled by this story

**Given** a specified Markdown file contains a link to both a local file and an anchor in that file

**When** local file links are detected according to this story

**Then** the link is not validated as a local file link and does not produce a dead link record

**And** the link is handled by the “Detect Dead Cross-File Anchor Links” story

### Scenario 5: URL-encoded paths and query parameters do not change file-existence validation

**Given** a specified Markdown file contains a URL-encoded local file path whose decoded path points to an existing file

**And** the link contains query parameters

**When** dead link detection runs for that file

**Then** the link does not produce a dead link record

## Business Rules

- This story handles only Markdown links to local files that do not contain an anchor. The “Detect Dead In-File Anchor Links” story handles fragment-only links; the “Detect Dead Cross-File Anchor Links” story handles links that contain both a file path and an anchor.

- When validating whether a file exists, resolve relative paths from the directory that contains the source Markdown file. Resolve URL-encoded paths after decoding them, and exclude query parameters from file-existence validation.

- When the target file exists, do not produce a dead link record. Otherwise, each invalid link produces one dead link record.

- A dead link record for a local file link must identify the `local-file` scenario and the `local-file-not-found` reason.

- A dead link record's target must preserve the target exactly as written in the link. All other content must comply with the [Dead Link Record Reporting Rules](../rules/dead-link-record-format.md).
