# Detect Dead Links in a File Collection

**As a** specification document maintainer
**I want** to run dead link detection for a collection of files
**So that** I can quickly find issues in a directory or set of specification documents

## File Collection Selection

**As a** specification document maintainer
**I want** to specify the files to check by directory, file extension, or glob pattern
**So that** I can precisely control the check scope

**Acceptance Criteria:**

- Support specifying a scan root directory.

- Support matching files by file extension or glob pattern.

- Support excluding specified files and directories.

- Output the list of matched files.

## Run Dead Link Detection in Bulk

**As a** specification document maintainer
**I want** to run dead link detection in bulk for the selected file collection
**So that** I can identify issues in multiple documents at once

**Acceptance Criteria:**

- Run the detection capability from the parent single-file story for every file.

- Ensure that all dead link records follow the consistent reporting format.

- Support ignoring specified link prefixes or regular expressions to avoid false positives.
