# InspectResult

## 参考资料

- [InspectDelegation](../../glossary/inspect-delegation.md)
- [InspectTarget](../../glossary/inspect-target.md)
- [InspectTargetQuality](../../glossary/inspect-target-quality.md)
- [TerminalInspectSummary](./terminal-inspect-summary.md)
- [McpInspectSummary](./mcp-inspect-summary.md)

## 定义

`InspectResult` 是接入层取得的共享原始成功报告。它组合原始 **InspectDelegation**、已经确定的 **InspectTarget** 与核心能力提供的 **InspectTargetQuality**，作为 CLI JSON 输出、MCP `structuredContent` 以及面向使用方的 **TerminalInspectSummary** 和 **McpInspectSummary** 的数据来源；它本身不是为人类直接阅读而设计的最终内容。

## 关键属性

- **检查委托：** 产生本结果的原始 **InspectDelegation**。
- **检查目标：** 根据检查委托确定的 **InspectTarget**。
- **质量支撑数据：** 核心能力为检查目标提供的 **InspectTargetQuality**。

### 数据模型

```ts
interface InspectResult {
  delegation: InspectDelegation;
  target: InspectTarget;
  quality: InspectTargetQuality;
}
```

### 数据模型案例

```json
{
  "delegation": {
    "packageName": "example-package",
    "versionIdentifier": "latest"
  },
  "target": {
    "packageName": "example-package",
    "exactVersion": "1.2.3",
    "tag": "latest"
  },
  "quality": {
    "dependencyScale": {
      "directDependencyDeclarations": [],
      "directDependencyCounts": {
        "runtimeCount": 0,
        "optionalCount": 0,
        "peerCount": 0,
        "bundledCount": 0
      }
    },
    "exceptions": []
  }
}
```

## 规则与约束

1. **接入层归属约束：** 本契约属于接入层，不属于核心业务模型；核心质量结构是 **InspectTargetQuality**。
2. **可追溯性约束：** 每个结果必须保留产生该结果的原始 **InspectDelegation**，不得用规范化后的目标标识覆盖开发者输入。
3. **目标显式约束：** 每个结果必须在顶层记录已经确定的 **InspectTarget**。
4. **成功映射约束：** 接入层必须将已经确定的 **InspectTarget** 与核心能力提供的 **InspectTargetQuality** 映射为成功结果，且不得改变检查目标、原始质量事实或数据获取异常。
5. **目标确定错误约束：** 将 **InspectDelegation** 转换为 **InspectTarget** 时抛出的任何错误都不得转换为本契约，而应进入当前接口的错误通道。
6. **质量异常约束：** **InspectTargetQuality** 中的数据获取异常属于成功结果的一部分，不得转换为接口错误。
7. **客观性约束：** 映射过程不得增加评分、评级、价值判断或采用建议。
8. **呈现边界约束：** 面向 terminal 使用方的人类可读内容必须映射为 **TerminalInspectSummary**；MCP tool result 的非 structured 文本内容必须映射为 **McpInspectSummary**，不得将本原始报告等同于二者。

## 关系

- **关联：** 每个结果对应一项 **InspectDelegation**。
- **关联：** 每个结果记录一个已经确定的 **InspectTarget**。
- **适配：** 每个结果包装一份 **InspectTargetQuality**。
