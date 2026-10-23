# Bluey

Bluey is a personal capability repository for Codex. It intentionally has no
multi-agent roles, routing, or orchestration.

## Vibe Tech

- `pnpm@12.4.2`

## References

- [Skill convention](docs/conventions/skill.md) defines the rules for skill
  naming, scope, package structure, documentation, and review.
- [MCP server convention](docs/conventions/mcp.md) defines the rules for MCP
  server naming, scope, package structure, tools, safety, versioning, and review.
- [MCP development convention](docs/conventions/mcp-development.md) defines the
  development workflow and implementation guidance for MCP servers.
- [Document convention](docs/conventions/document.md) defines the default
  style and presentation rules for repository documentation.
- [TypeScript convention](docs/conventions/typescript.md) defines the default
  object-oriented design and import style for TypeScript code.
- [Testing convention](docs/conventions/testing.md) defines the default test
  organization, implementation, and execution guidance.

## ADRs

The formal ADR for project, review files when necessary:

- [Dual mode architecture for CLI and MCP](./docs/adr/cli-first-mcp-architecture.md)

## Workspace

Turborepo orchestrate the pnpm workspace. Workspace packages belong
in `mcps/*` or `packages/*`. Turbo handles dependency ordering and caches task
outputs.

The `spec` and `implementation` split into different directory with the same name:

```shell
└── mcps
    ├── md-linkage
└── specs
    ├── md-linkage
```

<!-- CODEGRAPH_START -->

## CodeGraph

In repositories indexed by CodeGraph (a `.codegraph/` directory exists at the repo root), reach for it BEFORE grep/find or reading files when you need to understand or locate code:

- **MCP tool** (when available): `codegraph_explore` answers most code questions in one call — the relevant symbols' verbatim source plus the call paths between them, including dynamic-dispatch hops grep can't follow. Name a file or symbol in the query to read its current line-numbered source. If it's listed but deferred, load it by name via tool search.
- **Shell** (always works): `codegraph explore "<symbol names or question>"` prints the same output.

If there is no `.codegraph/` directory, skip CodeGraph entirely — indexing is the user's decision.

<!-- CODEGRAPH_END -->
