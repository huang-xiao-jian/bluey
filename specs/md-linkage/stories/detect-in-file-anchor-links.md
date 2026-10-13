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

**And** the record's reason is `anchor-not-found`

**And** the record conforms to the [Dead Link Record](../glossary/DeadLinkRecord.md) concept

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

**And** the record's reason is `anchor-not-found`

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

- A dead link record for a missing in-file anchor must resolve the target file to the source file, identify the normalized target anchor ID, and use the `anchor-not-found` reason.

- A dead link record must preserve the original link and its parsed name and anchor. All other content must conform to the [Dead Link Record](../glossary/DeadLinkRecord.md) concept.
