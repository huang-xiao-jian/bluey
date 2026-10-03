# Bluey

Bluey is a personal capability repository for Codex. It intentionally has no
multi-agent roles, routing, or orchestration.

## References

- [Skill convention](docs/conventions/skill.md) defines the rules for skill
  naming, scope, package structure, documentation, and review.
- [MCP server convention](docs/conventions/mcp.md) defines the rules for MCP
  server naming, scope, package structure, tools, safety, versioning, and review.
- [MCP development convention](docs/conventions/mcp-development.md) defines the
  development workflow and implementation guidance for MCP servers.
- [Document convention](docs/conventions/document.md) defines the default
  style and presentation rules for repository documentation.

## ADRs

The short decision for project:

- Don't use git worktree feature unless i explicitly request

The formal ADR for project, review files when necessary:

- [Dual mode architecture for CLI and MCP](./docs/adr/cli-first-mcp-architecture.md)

## Workspace

Turborepo orchestrate the pnpm workspace. Workspace packages belong
in `mcps/*` or `packages/*`. Turbo handles dependency ordering and caches task
outputs.

The specs and implementation structure:

```shell
└── mcps
    ├── md-linkage
└── specs
    ├── md-linkage #
    ├──├── spec.md
```
