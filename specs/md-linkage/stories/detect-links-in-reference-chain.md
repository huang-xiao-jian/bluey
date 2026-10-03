# Detect Dead Links Recursively Through File References

**As a** specification document maintainer
**I want** to follow local Markdown file references from my selected files
**So that** I can find issues that occur only in indirectly referenced documents

## Acceptance Criteria

### Scenario 1: Check every reachable Markdown file in recursive mode

**Given** a selected Markdown file references an existing local Markdown file

**And** that referenced file references another existing local Markdown file

**And** the latter referenced file contains an invalid link

**When** the check runs with `mode: "recursive"`

**Then** the selected file and all eligible reachable Markdown files are included in the check scope

**And** the invalid link in the latter referenced file produces one dead link record

**And** the record's source file is the latter referenced file that contains the invalid link

**And** the record complies with the [Dead Link Record Reporting Rules](../rules/dead-link-record-format.md)

### Scenario 2: Shallow mode checks only selected files

**Given** the starting Markdown file references file A

**And** file A references file B

**And** file B contains an invalid link

**When** the check runs with `mode: "shallow"` and only the starting file is selected

**Then** neither file A nor file B is included in the check scope

**And** the invalid link in file B does not produce a dead link record

### Scenario 3: Recursive mode follows indirect references

**Given** the starting Markdown file references file A

**And** file A references file B

**And** file B contains an invalid link

**When** the check runs with `mode: "recursive"`

**Then** file B is included in the check scope

**And** the invalid link in file B produces one dead link record

**And** the record's source file is file B

### Scenario 4: The same file is reached through multiple reference paths

**Given** the same file is reachable from the starting Markdown file through two reference paths

**And** that file contains an invalid link

**When** the check runs with `mode: "recursive"`

**Then** that file is checked only once

**And** the invalid link produces only one dead link record

### Scenario 5: The reference chain contains a cycle

**Given** the starting Markdown file eventually references a file that has already been checked

**And** files in the cycle contain invalid links

**When** the check runs with `mode: "recursive"`

**Then** each file in the cycle is checked at most once

**And** each invalid link produces at most one dead link record

### Scenario 6: The reference chain contains a link to a non-existent file

**Given** a Markdown file already included in the check scope contains a link to a non-existent local file

**When** the check runs with `mode: "recursive"`

**Then** the link produces a dead link record according to the corresponding single-file dead link detection story

**And** the non-existent target file is not included in subsequent check scope

### Scenario 7: Excluded references are validated but not followed

**Given** a selected Markdown file links to an existing Markdown file matched by `exclude`

**When** the check runs with `mode: "recursive"`

**Then** the link is validated in the selected file

**And** the excluded file is not included in the check scope

## Business Rules

- Recursive traversal begins from every file selected by `include` after applying `exclude`, according to the [Link Check Request Rules](../rules/link-check-request-format.md). Always include each starting file in the check scope.

- Expand a reference chain only through existing local Markdown file references. A link to a non-Markdown local file is a reference-chain endpoint: validate the link itself, but do not inspect its contents. Invalid links must still be detected and reported according to their applicable single-file detection stories, but they cannot be expanded as subsequent check targets.

- A cross-file anchor link to an existing Markdown file must include that target file in the reference chain for continued checking. When the target file does not exist, report the dead link only according to the cross-file anchor link rules and do not expand it.

- `shallow` mode checks only selected files. `recursive` mode follows every eligible local Markdown reference inside the project root without a depth limit. It does not follow excluded files. Links outside the project root are validated but not followed.

- Run [Detect Dead Links in a Single File](detect-links-in-single-file.md) for every file included in the check scope. All dead link records produced by these stories must comply with the [Dead Link Record Reporting Rules](../rules/dead-link-record-format.md).

- When the same file is reachable through multiple reference paths or is part of a reference cycle, check it at most once in a single reference-chain check. Each invalid link produces at most one dead link record.

- The source file in a dead link record must be the file that actually contains the invalid link, not the reference-chain starting file. All other content must comply with the [Dead Link Record Reporting Rules](../rules/dead-link-record-format.md).
