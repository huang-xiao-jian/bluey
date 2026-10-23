# Markdown Linkage MCP Interface

## Prerequities

- [Markdown Linkage Interface Specification](spec.md)

## Startup

```text
md-linkage mcp
```

The subcommand starts the MCP server over stdio. Protocol messages are written
to stdout, while logs and diagnostics are written to stderr.

## Tool

The read-only `check_specification_links` tool accepts:

```ts
interface CheckSpecificationLinksInput {
  /** Explicit absolute project boundary for this check. */
  readonly root: string;
  /** One or more concrete document paths. */
  readonly files: readonly string[];
  /** Defaults to LinkCheckMode.Shallow. */
  readonly mode?: LinkCheckMode;
}
```

The tool requires `root`; it never derives a project boundary from the MCP
server's current working directory. Its input schema rejects a relative or empty
root, an empty file collection, empty file paths, globs, and unsupported mode
values before the core workflow is invoked.

## Result

For a completed check, the tool returns:

- `structuredContent`: the complete **Link Check Report**; and
- `content`: a concise text summary containing document, scope-issue, and
  dead-link counts.

Scope issues and dead links remain successful tool results because they are
expected findings. Invalid input, an invalid project root, or another failure
that prevents report construction becomes an MCP error.

## Verification Requirements

- Verify input-schema constraints and the shallow-mode default.
- Verify that no implicit project root is accepted.
- Verify delegation mapping, structured report output, and text summaries.
- Verify MCP errors for invalid requests and failures that prevent report
  construction.
