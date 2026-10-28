# Bluey Markdown Linkage

`@bluey/md-linkage` checks local links in Markdown specification documents.
The package implements the core workflow, CLI, and MCP interfaces described in
[the specification](../../specs/md-linkage/spec.md).

## CLI

```sh
md-linkage check <files...> [--root <path>] [--mode <shallow|recursive>] [--json]
```

The project root defaults to the current working directory and the mode
defaults to `shallow`. Each input may be a file path, directory path, or glob
pattern. Directories expand recursively, while glob matches do not implicitly
recurse into matched directories. Quote glob patterns so the shell passes them
unchanged, for example `md-linkage check "specs/**/*.md"`. Shallow checks inspect
only the expanded starting documents;
recursive checks also inspect Markdown documents reached through live local
links. Starting inputs resolve from the current working directory,
while links inside documents resolve relative to the document containing them.

Human-readable output lists scope issues and dead links. `--json` writes only
the complete link-check report to stdout.

Exit statuses are:

- `0` when the report is constructed successfully, regardless of whether it
  contains scope issues or dead links; and
- non-zero when invalid input or another failure prevents report construction.

## MCP

```sh
md-linkage mcp
```

The command starts an MCP server over stdio and registers the read-only
`check_specification_links` tool. The tool requires an absolute `root`, one or
more file paths, directory paths, or glob patterns in `files`, and an optional
`mode` of `shallow` or `recursive`. MCP inputs resolve from `root`.
Successful calls return the complete report as structured content and concise
document, scope-issue, and dead-link counts as text content.

## Supported Links

The checker validates inline Markdown links targeting:

- local files, such as `[Design](design.md)`;
- headings in the same document, such as `[Rules](#rules)`; and
- headings in another document, such as `[Model](design.md#data-model)`.

HTTP, HTTPS, email, protocol-relative, and image destinations are outside this
local-link capability. Heading matching uses GitHub-compatible identifiers,
including suffixes for duplicate headings.

## Commands

```sh
pnpm --filter @bluey/md-linkage build
pnpm --filter @bluey/md-linkage test
pnpm --filter @bluey/md-linkage typecheck
```
