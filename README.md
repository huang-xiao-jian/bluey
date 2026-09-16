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

## Quick start

```sh
pnpm install
pnpm check
cp -R templates/skill skills/my-skill
cp -R templates/mcp-server mcps/my-server
```

Then update the copied `SKILL.md` or MCP package metadata. The included echo MCP server is a working reference:

```sh
pnpm --filter @bluey/echo-mcp dev
```

## Workflows

### Create a skill

1. Copy `templates/skill` into `skills/<kebab-case-name>`.
2. Keep `SKILL.md` concise and procedural: define when the skill applies, required checks, and the deliverable.
3. Put detailed material in `references/` and runnable helpers in `scripts/` inside the skill directory.
4. Run `pnpm check:skills`.
5. Install or link the finished directory into your Codex skills location when you are ready to use it.

### Create an MCP server

1. Copy `templates/mcp-server` into `mcps/<kebab-case-name>`.
2. Give it a unique workspace package name and only the tools it needs.
3. Run it over stdio; write diagnostic logs to stderr, never stdout.
4. Build and test it locally, then add its launch command to your Codex MCP configuration.

See [the conventions](docs/conventions.md) and [MCP development notes](docs/mcp-development.md).

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm check` | Run every repository check |
| `pnpm check:skills` | Validate skill structure and front matter |
| `pnpm build` | Build all MCP workspaces |
| `pnpm test` | Test all MCP workspaces |

## Principles

- Keep capabilities narrow, explicit, and easy to review.
- Treat instructions as code: version, test, and document them.
- Prefer local, deterministic tools before networked or stateful ones.
- Never commit credentials. Use environment variables and `.env.example` files instead.
