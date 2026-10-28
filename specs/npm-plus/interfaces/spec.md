# npm-plus 接入层设计

## 相关文档

- [检查 npm package 质量](../use-case/inspect-npm-package-quality.md)
- [InspectDelegation](../glossary/inspect-delegation.md)
- [InspectResult](./glossary/inspect-result.md)

## 目的

接入层通过 `CLI` 和 `MCP` 适配器，对外提供检查 `npm package` 质量的能力，适配器共享同一核心工作流。

## 架构设计

```mermaid
---
config:
  layout: dagre
---
flowchart LR
    Terminal["Terminal Consumer"] --> Cli["CLI Interface"]
    Cli --> Workflow["Workflow"]
    Workflow --> Report["Inspect Target Quality"]
    Report --> Cli
```

```mermaid
---
config:
  layout: dagre
---
flowchart LR
    Agent[MCP Client] --> Mcp[MCP Interface]
    Mcp --> Workflow
    Workflow --> Report[Inspect Target Quality]
    Report --> Mcp
```

## 适配器

- [CLI 接入层](cli.md)定义终端使用方如何调用该能力。
- [MCP 接入层](mcp.md)定义 AI 客户端如何调用该能力。
