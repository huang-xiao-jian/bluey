# Bluey echo MCP server

A minimal, read-only MCP server for verifying this repository's local MCP development setup.

## Tool

`echo` returns a non-empty text value unchanged. It has no side effects and requires no credentials.

## Run

```sh
pnpm --filter @bluey/echo-mcp dev
```

For Codex configuration, build the package and invoke `dist/index.mjs` through `node` as described in [the repository MCP notes](../../docs/mcp-development.md).
