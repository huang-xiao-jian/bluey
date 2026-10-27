# Bluey

主要使用 `Codex` 的个人可复用智能体能力仓库：

- **Skill**：用于指导 `Codex` 重复执行特定工作流的专用指令包。
- **MCP server**：通过 `Model Context Protocol` 向 `Codex` 提供的本地工具。
- **提示词和参考资料**：由各项能力共享、可进行版本管理的小型构建模块。

本仓库有意只面向一个主要智能体：`Codex`，不包含多智能体角色、路由或编排。

## 环境准备

本项目使用 [mise](https://mise.jdx.dev/) 管理 `Node.js` 和 `pnpm`。
交互式 `shell` 会在进入项目或 `worktree` 时自动切换工具版本。
脚本、`CI` 或其他非交互式 `shell` 应显式使用 `mise exec -- <command>`，避免依赖父进程的 `PATH`。

例如：

```sh
mise exec -- node --version
mise exec -- pnpm --version
```

## 仓库结构

```text
skills/             AI skill 集合
mcps/               MCP 集合
specs/              MCP server 的设计规约
docs/               项目规范和操作说明
```

## 已包含的能力

### Skill

- [analyze-business-rules](skills/analyze-business-rules/SKILL.md)：从用例规约中识别、推断并细化可追溯的业务规则。
- [discover-concepts](skills/discover-concepts/SKILL.md)：从用例规约中识别业务概念及其关系。
- [draft-concept-specification](skills/draft-concept-specification/SKILL.md)：根据当前会话上下文撰写业务概念规约。
- [draft-formal-adr](skills/draft-formal-adr/SKILL.md)：起草正式的架构决策记录，或将旧版 `ADR` 迁移为正式格式。
- [draft-use-case-specification](skills/draft-use-case-specification/SKILL.md)：根据业务需求起草结构化的用例规约。
- [evaluate-logical-model](skills/evaluate-logical-model/SKILL.md)：评估业务逻辑模型的质量。
- [oo-design](skills/oo-design/SKILL.md)：基于结构化用例规约进行面向对象分析与设计

### MCP server

- [@bluey/echo-mcp](mcps/echo-mcp/README.md)：提供只读的 `echo` 工具，用于验证本仓库的本地 MCP 开发环境。
- [@bluey/md-linkage](mcps/md-linkage/README.md)：通过 `md-linkage` CLI 和只读的 `check_specification_links` MCP 工具检查本地 `markdown` 文件链接连通性。
