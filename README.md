# Bluey

A personal, Codex-first workspace for reusable agent capabilities:

- **Skills**: focused instruction packages that teach Codex a repeatable workflow.
- **MCP servers**: local tools exposed to Codex over the Model Context Protocol.
- **Prompts and references**: small, versioned building blocks shared by those capabilities.

This repository deliberately targets one primary agent: **Codex**. It does not add multi-agent roles, routing, or orchestration.

## 环境准备

本项目使用 [mise](https://mise.jdx.dev/) 管理 Node.js 和 pnpm。
交互式 shell 会在进入项目或 worktree 时自动切换工具版本。
脚本、CI 或其他非交互式 shell 应显式使用 `mise exec -- <command>`，避免依赖父进程的 `PATH`。

例如：

```sh
mise exec -- node --version
mise exec -- pnpm --version
```

## Repository layout

```text
skills/             Source-of-truth skill packages
mcps/               Independently runnable MCP servers
scripts/            Repository checks and developer utilities
docs/               Conventions and operating notes
```

## Included capabilities

### Skills

- [discover-concepts](skills/discover-concepts/SKILL.md)：从清晰的用例规约中识别业务概念及其关系。
- [draft-concept-specification](skills/draft-concept-specification/SKILL.md)：
  根据当前会话上下文撰写业务概念规约。
- [draft-formal-adr](skills/draft-formal-adr/SKILL.md): Draft a formal
  architecture decision record or migrate a legacy ADR into the formal format.
- [draft-use-case-specification](skills/draft-use-case-specification/SKILL.md):
  Draft a structured use-case specification from business requirements.
- [evaluate-logical-model](skills/evaluate-logical-model/SKILL.md): Evaluate
  the quality of a business logical model without modifying it.

### MCP servers

- [@bluey/echo-mcp](mcps/echo-mcp/README.md): Read-only `echo` tool used to
  verify the local MCP development setup.
- [@bluey/md-linkage](mcps/md-linkage/README.md): Checks local Markdown links
  through the `md-linkage` CLI and the read-only `check_specification_links`
  MCP tool.

### In Consideration

- [analyze-business-rules](skills/analyze-business-rules/SKILL.md): Organize
  traceable business rules from use-case specifications into a four-layer
  constraint model.
- [oo-design](skills/oo-design/SKILL.md): Derive an early
  object-oriented design from use-case specifications.
