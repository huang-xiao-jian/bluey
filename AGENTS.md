# Bluey agent guidance

This is a personal capability repository. The primary agent is Codex.

## Scope

- Use lower-case kebab-case names for each **SKILL** or **MCP**. (e.g. `mcps/fs-system`, `skills/render-mermaid`)
- Use **Single Responsibility Pattern** for each **SKILL** or **MCP**.
- Keep changes to a capability self-contained and document a changed interface in its README.

## Skills

遵循如下 `SKILL` 目录结构规范：

```shell
my-skill/
├── SKILL.md              # 必需：元数据 + 核心指令（入口文件）
├── scripts/              # 可选：可执行脚本（Python/Shell/JS 等）
├── references/           # 可选：参考文档（API 文档、规范指南等）
├── assets/               # 可选：静态资源（模板、图片、字体等）
│   └── template.md
```

## MCP servers

- MCP servers must communicate over stdio unless explicitly requirement.
- Forbidden embed secrets, tokens, or machine-specific paths in source.
- Validate all tool inputs and return concise, useful errors.
