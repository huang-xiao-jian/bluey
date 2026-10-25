# Bluey

面向 `Codex` 的个人能力仓库。本仓库有意不包含多智能体角色、路由或编排。

## 语言设置

主要使用语言：**简体中文**，

- 大模型交互内容默认使用简体中文
- 仓库维护的自然语言内容默认使用简体中文。
- 源代码中仅注释使用中文，其他代码内容遵循既有规范。
- 专业术语、产品名、协议名、技术名、代码标识符、文件路径、命令保持使用英语。

### 特殊说明

- `CodeGraph` 自动注入区块保持原状，不受上述语言规则约束。

## 环境说明

本项目使用 [mise](https://mise.jdx.dev/) 管理 `Node.js` 和 `pnpm`。
交互式 shell 会在进入项目或 worktree 时自动切换工具版本。
脚本、CI 或其他非交互式 shell 应显式使用 `mise exec -- <command>`，避免依赖父进程的 `PATH`。

例如：

```sh
mise exec -- node --version
mise exec -- pnpm --version
```

## 参考资料

- [文档规范](docs/conventions/document.md)定义了仓库文档的默认风格和呈现规则。
- [能力规范](docs/conventions/capability.md) 定义了 `Skill` 和 `MCP server` 的结构指导。
- [Skill 中文化迁移规范](docs/conventions/skill-localization.md)定义了 `Skill` 中文化迁移、验证与清理流程。
- [MCP 开发规范](docs/conventions/mcp-development.md)定义了 `MCP server` 的开发流程和实现指南。
- [TypeScript规范](docs/conventions/typescript.md) 定义 `TypeScript` 代码默认的编写风格
- [测试规范](docs/conventions/testing.md)：定义自动化测试的默认组织方式、实现方式和执行指南。

## ADR

以下是本项目的正式 `ADR`，请在需要时查阅：

- [CLI 与 MCP 双模式架构](./docs/adr/cli-first-mcp-architecture.md)

## 工作区

`Turborepo` 负责组织 `pnpm workspace`。`workspace package` 位于 `mcps/*` 或
`packages/*`。`Turbo` 负责依赖排序并缓存任务输出。

`spec` 和 `implementation` 分别位于名称相同的不同目录中：

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
