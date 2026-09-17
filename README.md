# Bluey

A personal, Codex-first workspace for reusable agent capabilities:

- **Skills**: focused instruction packages that teach Codex a repeatable workflow.
- **MCP servers**: local tools exposed to Codex over the Model Context Protocol.
- **Prompts and references**: small, versioned building blocks shared by those capabilities.

This repository deliberately targets one primary agent: **Codex**. It does not add multi-agent roles, routing, or orchestration.

## Requirements

- Node.js `26.8.2` (pinned in `.nvmrc`)
- pnpm `12.4.2` (pinned through Corepack in `package.json`)

## Repository layout

```text
skills/             Source-of-truth skill packages
mcps/               Independently runnable MCP servers
templates/          Copyable starting points for new capabilities
scripts/            Repository checks and developer utilities
docs/               Conventions and operating notes
```

## Development

The repository is a pnpm workspace orchestrated by Turborepo. Package builds use
tsdown and tests use Vitest. Run the shared tasks from the repository root:

```sh
pnpm build
pnpm test
pnpm typecheck
pnpm check
```

Workspace packages belong in `mcps/*` or `packages/*`. Turbo caches package task
outputs and runs dependency builds before each package's tests.
