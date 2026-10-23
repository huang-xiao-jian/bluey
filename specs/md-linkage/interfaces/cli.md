# Markdown Linkage CLI Interface

## Prerequities

- [Markdown Linkage Interface Specification](spec.md)

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

When `--json` is present, stdout contains only the serialized **Link Check Report**.
Diagnostics that are not part of the report are written to stderr.

## Exit Status

The CLI does not assign application-specific exit statuses. A completed check
is successful even when its report contains findings. Errors that prevent
completion propagate and use the runtime's standard failure behavior.

## Verification Requirements

- Verify current-working-directory and shallow-mode defaults.
- Verify explicit root and mode mapping.
- Verify human-readable and JSON output.
- Verify that clean reports and reports with findings complete successfully.
- Verify that failures preventing report construction propagate.
