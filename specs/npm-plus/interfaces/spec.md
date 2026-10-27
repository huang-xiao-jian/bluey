# npm-plus 接入层设计

## 参考资料

- [InspectDelegation](../glossary/inspect-delegation.md)
- [InspectResult](./glossary/inspect-result.md)
- [获取 npm package 质量支撑数据](../use-case/get-npm-package-quality-support-data.md)

## 目的

接入层通过 `CLI` 和 `MCP` 适配器，对外提供获取 npm package 质量支撑数据的能力。两个适配器共享同一核心工作流，不包含目标确定、质量数据采集或质量评价逻辑。

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

## 跨接口一致性

通过 CLI 与 MCP 提交的等价 **InspectDelegation** 必须产生语义一致的 **InspectResult**。CLI `--json` 输出与 MCP `structuredContent` 使用相同的字段名称、枚举值、可选字段规则和嵌套结构；CLI 人类可读报告与 MCP 文本摘要不属于该一致性约束。

## 验证要求

- 验证两个适配器对默认版本、精确版本和 tag 委托的映射语义一致。
- 验证两个适配器对 **InspectResult** 与各质量维度成功、失败评估使用相同的结构化序列化形式。
- 验证输入错误不会调用核心工作流。
- 验证目标确定错误分别进入 CLI 和 MCP 的错误通道，且不会产生 **InspectResult**。
- 验证质量维度评估异常内建于 **InspectTargetQuality**，且不会进入接口错误通道。
