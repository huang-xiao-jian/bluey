# Detect Dead In-File Anchor Links

**As a** specification document author
**I want** to determine whether anchor links within a specified file point to actual headings or anchors
**So that** I avoid navigating to locations that do not exist on the page

## Acceptance Criteria

### Scenario 1: The target in-file anchor exists

**Given** a specified Markdown file contains a fragment-only link to a standard Markdown heading in the current file

**When** dead link detection runs for that file

**Then** the link does not produce a dead link record

### Scenario 2: The target in-file anchor does not exist

**Given** a specified Markdown file contains a fragment-only link to an anchor that does not exist in the current file

**When** dead link detection runs for that file

**Then** the link produces one dead link record

**And** the record's link type is `in-file-anchor`

**And** the record's dead link reason is `in-file-anchor-not-found`

**And** the record complies with the [Dead Link Record Reporting Rules](../rules/dead-link-record-format.md)

### Scenario 3: Validation does not read other files

**Given** a specified Markdown file contains a fragment-only link

**When** the link is validated according to this story

**Then** validation uses only the current file's contents

**And** it does not read other files to determine whether the anchor exists

### Scenario 4: Custom anchors are not valid targets

**Given** a specified Markdown file contains a fragment-only link

**And** the current file contains only a custom anchor corresponding to the link, with no corresponding standard Markdown heading

**When** dead link detection runs for that file

**Then** the link produces one dead link record

**And** the record's dead link reason is `in-file-anchor-not-found`

### Scenario 5: Duplicate headings use GitHub-compatible suffixes

**Given** a specified Markdown file contains two standard Markdown headings whose visible text is `Rules`

**And** the file contains a fragment-only link to `#rules-1`

**When** dead link detection runs for that file

**Then** the link resolves to the second `Rules` heading

**And** the link does not produce a dead link record

## Business Rules

- This story handles only fragment-only links: links whose target contains an anchor but no target file.

- For a fragment-only link, look for the corresponding standard Markdown heading only in the current file that contains the link. Do not read other files, and do not support custom anchors such as HTML `id` attributes.

- Generate heading anchors from the visible plain text of standard Markdown headings using GitHub-compatible slugging rules. Process headings in document order so duplicate headings receive GitHub-compatible numeric suffixes, such as `rules` and `rules-1`.

- When the current file contains the corresponding standard Markdown heading, do not produce a dead link record. Otherwise, each invalid link produces one dead link record.

- A dead link record for an in-file anchor link must identify the `in-file-anchor` scenario and the `in-file-anchor-not-found` reason.

- A dead link record's target must preserve the target exactly as written in the link. All other content must comply with the [Dead Link Record Reporting Rules](../rules/dead-link-record-format.md).
