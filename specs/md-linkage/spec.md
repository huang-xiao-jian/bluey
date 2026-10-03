# Dead Link Detection Requirements for Specification Documents

## Business Context

In a **Specification-Driven Development** workflow, business documents are the team's shared single source of truth. Documents reference one another through links, forming a complete document network that connects the system's overall structural design. When links break because files move or headings are renamed, document readability is seriously degraded. These issues are often hidden during execution until they appear as business exceptions during system acceptance, making delayed remediation expensive.

## Business Objective

**Quickly detect dead links in specification documents, generate a raw report that can be located and traced, and output the report on demand** so that authors and maintainers can promptly discover and repair invalid references.

## Epic Story

**As a** specification document author and maintainer
**I want** to check the Markdown files I choose, optionally follow their file references, and output a report on demand
**So that** I can promptly discover and repair invalid references

## Business Metrics

### Consistent Dead Link Reporting Format

Dead link records produced by all detection sub-stories must comply with the [Dead Link Record Reporting Rules](rules/dead-link-record-format.md), so downstream report generation can consume data consistently without structural differences caused by different sources.

### Traceable Dead Link Locations

Every dead link record must be traceable to its source file, original link text, link target, link scenario, and dead link reason, enabling maintainers to locate and repair the link quickly.

### Extensible Raw Check Reports

Raw link check reports must comply with the [Link Check Report Rules](rules/link-check-report-format.md) and retain only the check scope and dead link record collection. Subsequent stages handle derived statistics, content organization, and output methods.

## User Story Journey

### Journey Overview

Trigger a check → Detect dead links → Generate a raw report → Format the report → Output the report → Locate and repair

Maintainers select one or more Markdown files and choose whether to follow references to other Markdown files. After detection succeeds, the system generates a raw link check report and proceeds to formatting and output. If detection does not succeed, the system discards the result. The current formatting stage outputs the raw report directly; its capabilities can be extended later. Maintainers can view the report in the terminal or save it to a specified path before locating and repairing issues.

### Journey Stages

1. **Trigger a check**
   - User action: Choose the Markdown files to check and whether to follow their references.
   - System response: Determine which Markdown files to check.
   - System output: A list of Markdown files actually checked.

2. **Detect dead links**
   - System response: Categorize and validate links in the files.
   - System output: Dead link records in a consistent format.

3. **Generate a raw report**
   - Prerequisite: Dead link detection has completed successfully.
   - System response: Aggregate the check scope and dead link record collection.
   - System output: A raw link check report that complies with the [Link Check Report Rules](rules/link-check-report-format.md).
   - Alternate flow: If dead link detection does not complete successfully, the system discards the result, does not generate a raw report, and does not proceed to formatting or output.

4. **Format the report**
   - Prerequisite: A raw link check report has been generated.
   - System response: Currently, output the raw link check report directly without derived processing.
   - System output: Report content for the output stage.
   - Extension point: Add formatting capabilities later, such as statistics, grouping, sorting, and summaries, without changing the raw-report facts.

5. **Output the report**
   - User action: Choose to output the report directly in the terminal or save it to a file and provide a save path.
   - System response: Output the formatted report content using the selected method.
   - Alternate flow: If no file save path is provided, the system asks the user to provide one. If output fails, the system explains why, does not automatically switch output methods, and discards the raw and formatted reports from this run.

6. **Locate and repair**
   - User action: Review the output report and locate the issue.

## User Stories

- [Detect dead links in a single file](stories/detect-links-in-single-file.md)
  - [Detect dead local file links](stories/detect-local-file-links.md)
  - [Detect dead in-file anchor links](stories/detect-in-file-anchor-links.md)
  - [Detect dead cross-file anchor links](stories/detect-cross-file-anchor-links.md)
- [Detect dead links recursively through file references](stories/detect-links-in-reference-chain.md)
- [Detect dead links in a file collection](stories/detect-links-in-file-collection.md)
- [Generate a raw link check report](stories/generate-link-check-report.md)
- [Format a link check report](stories/format-link-check-report.md)
- [Output a link check report](stories/output-link-check-report.md)

## Initial Technical Decisions

These decisions define the first implementation of the stories above. The linked rules remain authoritative for the public request, dead link record, and raw report shapes.

### Markdown parsing and link scope

- Parse `.md` files as GitHub Flavored Markdown using `remark-parse` and `remark-gfm`. Add `remark-mdx` for `.mdx` files so JSX, expressions, and imports are parsed as MDX syntax; inspect Markdown links and headings in those files, but do not inspect JSX attributes or expression values. Use syntax-tree source positions to preserve authored links.
- Check authored Markdown text links, including inline links and resolved full, collapsed, and shortcut reference links. Do not check images, raw HTML links, autolinks, or bare URLs. Ignore links in code spans and code blocks. An unresolved reference label is not a link and produces no dead link record.
- For an inline link, `linkText` is the complete source slice for that link and `target` is its authored destination, excluding an optional title. For a reference link, `linkText` is the complete source slice at the use site and `target` is the destination in its resolved definition. A broken reference link gets one record per use site. Preserve the destination spelling in `target`, including percent escapes, query, and fragment, while decoding only a separate working value for validation.
- Validate only local file and heading destinations. Ignore external schemes, protocol-relative URLs, and empty destinations. Split a local destination into path, query, and fragment before decoding the path and fragment. Query parameters do not affect file or heading validation. A malformed percent escape makes detection fail with a useful error; it does not become a false dead link.

### Files and headings

- Resolve relative local paths from the source file's directory; interpret a leading `/` as relative to the project root. Check that a file target is a regular file; a directory is not a valid file target. An existing non-Markdown file can satisfy a file link but is never checked recursively. For a cross-file fragment, require a Markdown target and validate its heading; a non-Markdown target cannot satisfy that fragment.
- Generate heading IDs from the visible plain text of standard Markdown headings with `github-slugger`, including suffixes for repeated headings in document order. Percent-decode a requested fragment before comparing it with those IDs. Custom HTML `id` attributes and non-heading anchors do not satisfy a fragment link.
- Resolve the project root to its real filesystem path once per check. Use root-relative `/` paths in the report. Resolve candidate files to real paths for containment and deduplication, so symlink aliases cannot make a file run twice or expand recursive checking beyond the root. Reject a selected file whose real path is outside the root. An outside-root link target can still satisfy a link, but its contents are not checked. Fail the check if a selected or checked file cannot be read or parsed; do not return a partial report.
- Use `fast-glob` for root-relative `include` and `exclude` selectors. Match `.md` and `.mdx` extensions case sensitively; use `/` in selectors, and do not traverse symbolic-link directories while expanding globs. Resolve matched files afterward to enforce the project boundary. Apply exclusions to selected and recursively discovered paths using the same matcher.
- Process selected files and discovered references in a stable order, preserving link occurrence order within each source file. This makes repeated runs reproducible without adding derived sorting to the raw report.

### CLI and MCP delivery

- Put selection, link detection, and raw report creation in a shared core. The CLI and MCP adapters translate their inputs into the same [Link Check Request](rules/link-check-request-format.md). The CLI is the primary interface; `mcp` starts the stdio server as required by the [CLI-first architecture](../../docs/adr/cli-first-mcp-architecture.md).
- Expose `md-linkage check` with repeatable `--include` and `--exclude` selectors, `--mode shallow|recursive` (default `shallow`), optional `--project-root`, and optional `--output <path>`. Expose one MCP tool, `check_markdown_links`, with required absolute `projectRoot`, `include`, and `mode`, optional `exclude`, and optional `output: "return" | "file"` (default `"return"`). Require `outputPath` only for `"file"`. Output choices are adapter inputs, not fields in `LinkCheckRequest`.
- The CLI writes the raw report as JSON to stdout by default or to the user-selected file. In `"return"` mode, the MCP tool returns the report as text and structured content; in `"file"` mode, it writes the file and returns its saved path. The MCP server never writes report content or logs to protocol stdout outside MCP messages. Use the same JSON serialization for CLI stdout, MCP report text, and saved report files.
- Treat a missing save path, an invalid request, a read or parse failure, and an output failure as an actionable error. Neither adapter prompts interactively during a check or switches output methods after failure. No successful report is returned or emitted when detection or output fails.
