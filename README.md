# Bluey

一个以 `Codex` 为主要使用对象的个人可复用智能体能力仓库：

- **Skill**：用于指导 `Codex` 重复执行特定工作流的专用指令包。
- **MCP server**：通过 `Model Context Protocol` 向 `Codex` 提供的本地工具。
- **提示词和参考资料**：由各项能力共享、可进行版本管理的小型构建模块。

本仓库有意只面向一个主要智能体：`Codex`，不包含多智能体角色、路由或编排。

## 环境准备

本项目使用 [mise](https://mise.jdx.dev/) 管理 Node.js 和 pnpm。
交互式 shell 会在进入项目或 worktree 时自动切换工具版本。
脚本、CI 或其他非交互式 shell 应显式使用 `mise exec -- <command>`，避免依赖父进程的 `PATH`。

例如：

```sh
mise exec -- node --version
mise exec -- pnpm --version
```

## 仓库结构

```text
skills/             Skill 包的事实来源
mcps/               可独立运行的 MCP server
specs/              MCP server 的规约
docs/               规范和操作说明
```

## 已包含的能力

### Skill

- [analyze-business-rules](skills/analyze-business-rules/SKILL.md)：从用例规约中识别、推断并细化可追溯的业务规则，仅在用户显式调用时使用。
- [discover-concepts](skills/discover-concepts/SKILL.md)：从清晰的用例规约中识别业务概念及其关系，仅在用户显式调用时使用。
- [draft-concept-specification](skills/draft-concept-specification/SKILL.md)：
  根据当前会话上下文撰写业务概念规约，仅在用户显式调用时使用。
- [draft-formal-adr](skills/draft-formal-adr/SKILL.md)：起草正式的架构决策记录，或将旧版 ADR 迁移为正式格式，仅在用户显式调用时使用。
- [draft-use-case-specification](skills/draft-use-case-specification/SKILL.md)：根据业务需求起草结构化的用例规约，仅在用户显式调用时使用。
- [evaluate-logical-model](skills/evaluate-logical-model/SKILL.md)：评估业务逻辑模型的质量而不修改原始模型，仅在用户显式要求评估时使用。
- [oo-design](skills/oo-design/SKILL.md)：基于结构化用例规约进行面向对象分析与设计，使用 `$oo-design` 调用。

### MCP server

- [@bluey/echo-mcp](mcps/echo-mcp/README.md)：提供只读的 `echo` 工具，用于验证本仓库的本地 MCP 开发环境。
- [@bluey/md-linkage](mcps/md-linkage/README.md)：通过 `md-linkage` CLI 和只读的 `check_specification_links` MCP 工具检查本地 Markdown 链接。
