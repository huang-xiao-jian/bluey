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

Review the ADRs when necessary:

- [Dual mode architecture for CLI and MCP](./docs/adr/cli-first-mcp-architecture.md)

## Workspace

Turborepo orchestrate the pnpm workspace. Workspace packages belong
in `mcps/*` or `packages/*`. Turbo handles dependency ordering and caches task
outputs.

## Package scripts

Each TypeScript workspace package must expose the applicable scripts below:

- `build`: bundle distributable code with tsdown and write output to `dist/`.
- `test`: run behavioral tests with Vitest.
- `typecheck`: run TypeScript without emitting files.

## Commands

Run workspace-wide tasks from the repository root:

```sh
pnpm build
pnpm test
```

Use `pnpm --filter <package-name> <script>` to run a package-specific command.
