# InspectResult

## 参考资料

- [InspectDelegation](../../glossary/inspect-delegation.md)
- [InspectTarget](../../glossary/inspect-target.md)
- [InspectTargetQuality](../../glossary/inspect-target-quality.md)

## 定义

`InspectResult` 是接入层为 CLI JSON 输出与 MCP `structuredContent` 定义的共享成功结果契约。它组合原始 **InspectDelegation** 与核心能力提供的 **InspectTargetQuality**，不表示目标确定错误。

## 关键属性

- **检查委托：** 产生本结果的原始 **InspectDelegation**。
- **质量支撑数据：** 核心能力为已经确定的 **InspectTarget** 提供的 **InspectTargetQuality**。

### 数据模型

```ts
interface InspectResult {
  delegation: InspectDelegation;
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
  "quality": {
    "target": {
      "packageName": "example-package",
      "exactVersion": "1.2.3",
      "tag": "latest"
    },
    "dependencyScale": {
      "status": "succeeded",
      "quality": {
        "dimension": "dependency-scale",
        "directDependencyDeclarations": [],
        "directDependencyCounts": {
          "runtimeCount": 0,
          "optionalCount": 0,
          "peerCount": 0,
          "bundledCount": 0
        }
      }
    }
  }
}
```

## 规则与约束

1. **接入层归属约束：** 本契约属于接入层，不属于核心业务模型；核心质量结构是 **InspectTargetQuality**。
2. **可追溯性约束：** 每个结果必须保留产生该结果的原始 **InspectDelegation**，不得用规范化后的目标标识覆盖开发者输入。
3. **成功映射约束：** 接入层必须将核心能力提供的 **InspectTargetQuality** 映射为成功结果，且不得改变其中的 **InspectTarget**、原始质量事实或评估异常。
4. **目标确定错误约束：** 将 **InspectDelegation** 转换为 **InspectTarget** 时抛出的任何错误都不得转换为本契约，而应进入当前接口的错误通道。
5. **质量异常约束：** **InspectTargetQuality** 中的维度评估异常属于成功结果的一部分，不得转换为接口错误。
6. **客观性约束：** 映射过程不得增加评分、评级、价值判断或采用建议。

## 关系

- **关联：** 每个结果对应一项 **InspectDelegation**。
- **适配：** 每个结果包装一份 **InspectTargetQuality**。
