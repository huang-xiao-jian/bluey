# InspectResult

## 参考资料

- [InspectDelegation](../glossary/inspect-delegation.md)
- [InspectTarget](../glossary/inspect-target.md)
- [InspectTargetQuality](../glossary/inspect-target-quality.md)

## 定义

`InspectResult` 是接入层为 CLI JSON 输出与 MCP `structuredContent` 定义的共享结构化结果契约。它把核心能力提供的 **InspectTargetQuality** 或目标确定失败事实转换为稳定的接口表示，并保留原始 **InspectDelegation**。

## 关键属性

- **检查委托：** 产生本结果的原始 **InspectDelegation**。
- **结果状态：** 标识目标确定成功或具体的目标确定失败事实。
- **质量支撑数据：** 仅成功结果包含的 **InspectTargetQuality**，其中同时保留已经确定的 **InspectTarget**。
- **失败上下文：** 精确版本或 tag 相关失败用于说明目标确定过程的规范化标识。

### 数据模型

```ts
enum InspectResultStatus {
  Succeeded = "succeeded",
  PackageNotFound = "package-not-found",
  ExactVersionNotFound = "exact-version-not-found",
  TagNotFound = "tag-not-found",
  TagUnresolvable = "tag-unresolvable",
}

interface InspectResultBase {
  delegation: InspectDelegation;
  status: InspectResultStatus;
}

interface SucceededInspectResult extends InspectResultBase {
  status: InspectResultStatus.Succeeded;
  quality: InspectTargetQuality;
}

interface PackageNotFoundInspectResult extends InspectResultBase {
  status: InspectResultStatus.PackageNotFound;
}

interface ExactVersionNotFoundInspectResult extends InspectResultBase {
  status: InspectResultStatus.ExactVersionNotFound;
  exactVersion: string;
}

interface TagNotFoundInspectResult extends InspectResultBase {
  status: InspectResultStatus.TagNotFound;
  tag: string;
}

interface TagUnresolvableInspectResult extends InspectResultBase {
  status: InspectResultStatus.TagUnresolvable;
  tag: string;
  exactVersion: string;
}

type InspectResult =
  | SucceededInspectResult
  | PackageNotFoundInspectResult
  | ExactVersionNotFoundInspectResult
  | TagNotFoundInspectResult
  | TagUnresolvableInspectResult;
```

### 数据模型案例

**目标确定成功：**

```json
{
  "delegation": {
    "packageName": "example-package",
    "versionIdentifier": "latest"
  },
  "status": "succeeded",
  "quality": {
    "target": {
      "packageName": "example-package",
      "exactVersion": "1.2.3",
      "tag": "latest"
    },
    "dependencyScale": {
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
```

**Tag 无法解析：**

```json
{
  "delegation": {
    "packageName": "example-package",
    "versionIdentifier": "next"
  },
  "status": "tag-unresolvable",
  "tag": "next",
  "exactVersion": "2.0.0-next.1"
}
```

## 规则与约束

1. **接入层归属约束：** 本契约属于接入层，不属于核心业务模型；核心质量结构是 **InspectTargetQuality**。
2. **可追溯性约束：** 每个结果必须保留产生该结果的原始 **InspectDelegation**，不得用规范化后的目标标识覆盖开发者输入。
3. **成功映射约束：** 接入层必须将核心能力提供的 **InspectTargetQuality** 映射为成功结果，且不得改变其中的 **InspectTarget** 或原始质量事实。
4. **成功排他约束：** 失败结果不得包含 **InspectTarget** 或 **InspectTargetQuality**。
5. **精确版本失败约束：** 精确版本不存在结果必须记录规范化后的精确版本。
6. **Tag 失败约束：** Tag 不存在结果必须记录目标确定时使用的 tag；tag 无法解析结果还必须记录该 tag 映射到、但未出现在 package `versions` 中的精确版本。
7. **默认版本约束：** 未提供版本标识时，目标确定使用 `latest` tag；与该 tag 有关的失败结果必须记录 `latest`。
8. **错误边界约束：** 输入无效、Registry 超时、限流、鉴权失败、服务故障、制品读取失败或内部执行异常不得序列化为本契约，而应进入当前接口的错误通道。
9. **客观性约束：** 映射过程不得增加评分、评级、价值判断或采用建议。

## 关系

- **关联：** 每个结果对应一项 **InspectDelegation**。
- **适配：** 成功结果包装一份 **InspectTargetQuality**；失败结果表示核心能力产生的目标确定失败事实。
