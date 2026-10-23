# MD Linkage CLI Interface

## Prerequities

- [MD Linkage Interface Specification](spec.md)

## Command

```text
md-linkage check <files...> [--root <path>] [--mode <shallow|recursive>] [--json]
```

## Input Rules

1. `files` contains at least one non-empty, concrete document path. Globs are
   not supported.
2. An omitted `--root` defaults to the process's current working directory.
3. A relative `--root` is resolved to an absolute path before the delegation is
   constructed.
4. An omitted `--mode` defaults to `LinkCheckMode.Shallow`.
5. File arguments remain as supplied. The core scope builder resolves them
   against the established project root.

## Output

The default output is a concise human-readable report containing:

- the total number of scope issues;
- the total number of dead links;
- each scope issue; and
- each dead link.

When `--json` is present, stdout contains only the serialized **Link Check
Report**. Diagnostics that are not part of the report are written to stderr.

## Exit Status

- `0`: The check completed with no scope issues and no dead links.
- `1`: The check completed and found at least one scope issue or dead link.
- `2`: The request was invalid, the project root could not be established, or
  another failure prevented a report from being produced.

Finding a scope issue or dead link is a completed check, not an invocation
failure. The nonzero status allows shell scripts and CI jobs to detect findings.

## Verification Requirements

- Verify current-working-directory and shallow-mode defaults.
- Verify explicit root and mode mapping.
- Verify human-readable and JSON output.
- Verify exit statuses for clean reports, reports with findings, and failures
  that prevent report construction.
