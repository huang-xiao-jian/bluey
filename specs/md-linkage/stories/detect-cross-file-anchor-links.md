# Detect Dead Cross-File Anchor Links

**As a** specification document author
**I want** to determine whether anchors referenced across files in a specified file are valid
**So that** I avoid navigating to locations that do not exist in other files

## Acceptance Criteria

### Scenario 1: The target file does not exist

**Given** a specified Markdown file contains a cross-file anchor link to a non-existent target file and its anchor

**When** dead link detection runs for that file

**Then** the link produces one dead link record

**And** the record's link type is `cross-file-anchor`

**And** the record's dead link reason is `cross-file-not-found`

**And** the target anchor is not validated

**And** the record complies with the [Dead Link Record Reporting Rules](../rules/dead-link-record-format.md)

### Scenario 2: The target file exists but the target anchor does not

**Given** a specified Markdown file contains a cross-file anchor link and the target file exists

**And** the target file does not contain the anchor specified by the link

**When** dead link detection runs for that file

**Then** the link produces one dead link record

**And** the record's link type is `cross-file-anchor`

**And** the record's dead link reason is `cross-file-anchor-not-found`

**And** the record complies with the [Dead Link Record Reporting Rules](../rules/dead-link-record-format.md)

### Scenario 3: Both the target file and target anchor exist

**Given** a specified Markdown file contains a cross-file anchor link

**And** the target file exists

**And** the target file contains the anchor specified by the link

**When** dead link detection runs for that file

**Then** the link does not produce a dead link record

### Scenario 4: Relative paths, URL encoding, and query parameters

**Given** a specified Markdown file contains a cross-file anchor link to a standard Markdown heading in another file

**And** the link uses a relative path, a URL-encoded path, and query parameters

**And** after resolving the path relative to the source Markdown file, URL-decoding it, and ignoring query parameters, both the target file and target heading exist

**When** dead link detection runs for that file

**Then** the link does not produce a dead link record

### Scenario 5: Duplicate target headings use GitHub-compatible suffixes

**Given** a target Markdown file contains two standard Markdown headings whose visible text is `Rules`

**And** a specified Markdown file contains a cross-file anchor link to `#rules-1` in that target file

**When** dead link detection runs for the specified file

**Then** the link resolves to the second `Rules` heading in the target file

**And** the link does not produce a dead link record

## Business Rules

- This story handles only cross-file anchor links that contain both a target file and an anchor.

- When validating a cross-file anchor link, resolve relative paths from the directory that contains the source Markdown file. Resolve URL-encoded paths after decoding them, and exclude query parameters from target-file and target-anchor validation.

- Target anchors support only standard Markdown headings in the target file, not custom anchors such as HTML `id` attributes.

- Generate target heading anchors from the visible plain text of standard Markdown headings using GitHub-compatible slugging rules. Process headings in document order so duplicate headings receive GitHub-compatible numeric suffixes, such as `rules` and `rules-1`.

- Always confirm that the target file exists before validating a cross-file anchor link. If the target file does not exist, do not continue to validate the target anchor.

- When the target file does not exist, each invalid link produces one dead link record with the `cross-file-anchor` scenario and the `cross-file-not-found` reason.

- Only when the target file exists, find the target anchor that corresponds to a standard Markdown heading in that file. When the target anchor does not exist, each invalid link produces one dead link record with the `cross-file-anchor` scenario and the `cross-file-anchor-not-found` reason.

- When both the target file and target anchor exist, do not produce a dead link record.

- A dead link record's target must preserve the target exactly as written in the link. All other content must comply with the [Dead Link Record Reporting Rules](../rules/dead-link-record-format.md).
