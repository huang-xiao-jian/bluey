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

## 技术栈

- `pnpm@12.4.2`

## 参考资料

- [能力规范](docs/conventions/capability.md)定义了 `Skill` 和 `MCP server` 的通用命名，
  以及各自的结构与通信约定。
- [`MCP` 开发规范](docs/conventions/mcp-development.md)定义了 `MCP server` 的开发流程和实现指南。
- [文档规范](docs/conventions/document.md)定义了仓库文档的默认风格和呈现规则。
- [`TypeScript` 规范](docs/conventions/typescript.md)定义了 `TypeScript` 代码默认的
  `object-oriented design` 和 `import` 风格。
- [测试规范](docs/conventions/testing.md)定义了测试的默认组织方式、实现方式和执行指南。

## `ADR`

以下是本项目的正式 `ADR`，请在需要时查阅：

- [`CLI` 与 `MCP` 双模式架构](./docs/adr/cli-first-mcp-architecture.md)

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
