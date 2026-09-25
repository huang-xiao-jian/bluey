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
scripts/            Repository checks and developer utilities
docs/               Conventions and operating notes
```

## Development

See [Development guideline](docs/development-guideline.md) for workspace commands,
package scripts, and validation requirements.

## Included capabilities

### Skills

- [analyze-business-concepts](skills/analyze-business-concepts/SKILL.md):
  Extract and document business concepts from business-source material.
- [analyze-business-rules](skills/analyze-business-rules/SKILL.md): Organize
  business requirements into a four-layer constraint model.
- [analyze-business-concept-relationship](skills/analyze-business-concept-relationship/SKILL.md):
  Extract and document relationships among business concepts and use-case
  specifications.
- [draft-use-case-specification](skills/draft-use-case-specification/SKILL.md):
  Draft a structured use-case specification from business requirements.

### MCP servers

- [@bluey/echo-mcp](mcps/echo-mcp/README.md): Read-only `echo` tool used to
  verify the local MCP development setup.

## TODO

- Reassess the value of the `analyze-business-rules` skill and decide whether
  it should be retained, revised, or removed.
