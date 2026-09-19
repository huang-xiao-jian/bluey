# MCP server convention

## Naming and scope

Use a descriptive lower-case kebab-case directory name, such as
`release-notes` or `linear-issues`.

Each MCP server has one clear responsibility. Keep changes self-contained
within the server. When a public interface changes, update the server README
with the new behavior, inputs, outputs, permissions, or configuration.

## Package shape

```text
mcps/<name>/
  src/index.ts        stdio server entry point
  test/               Behavioral tests
  package.json        Isolated package metadata and scripts
  tsconfig.json
  tsdown.config.ts    Build configuration
  README.md           Tools, inputs, permissions, and configuration
```

## Tools and safety

Favor small tools with clear names. Tool descriptions should state side effects,
required permissions, and meaningful constraints. A tool that changes external
state must make that action unambiguous in both its name and description.

MCP servers communicate over stdio unless another transport is explicitly
required. Keep protocol messages on stdout and send logging to stderr. Validate
all tool inputs and return concise, useful errors. Never commit credentials,
tokens, or machine-specific paths.

## Versioning and review

Document breaking MCP tool changes in the server README. Before sharing or
installing an MCP server, review its tool surface as carefully as production
code.
