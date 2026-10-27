# InspectResult

## 参考资料

- [InspectDelegation](./inspect-delegation.md)
- [InspectTarget](./inspect-target.md)
- [InspectTargetQuality](./inspect-target-quality.md)

## 定义

`InspectResult` 是系统完成一项 **InspectDelegation** 后产生的、与接入协议无关的业务结果。它保留原始委托，并明确表示目标确定成功，或者 package、精确版本、tag 不存在或无法解析的事实。

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

1. **可追溯性约束：** 每个结果必须保留产生该结果的原始 **InspectDelegation**，不得用规范化后的目标标识覆盖开发者输入。
2. **成功完备约束：** 成功结果必须包含 **InspectTargetQuality**，且该质量支撑数据必须包含已经确定的 **InspectTarget**。
3. **成功排他约束：** 失败结果不得包含 **InspectTarget** 或 **InspectTargetQuality**。
4. **精确版本失败约束：** 精确版本不存在结果必须记录规范化后的精确版本。
5. **Tag 失败约束：** Tag 不存在结果必须记录目标确定时使用的 tag；tag 无法解析结果还必须记录该 tag 映射到、但未出现在 package `versions` 中的精确版本。
6. **默认版本约束：** 未提供版本标识时，目标确定使用 `latest` tag；与该 tag 有关的失败结果必须记录 `latest`。
7. **业务边界约束：** 本概念只表示目标确定与质量支撑数据获取成功完成后的业务结果。输入无效、Registry 超时、限流、鉴权失败、服务故障、制品读取失败或内部执行异常不属于本概念。
8. **客观性约束：** 本概念不得增加评分、评级、价值判断或采用建议。

## 关系

- **关联：** 每个结果对应一项 **InspectDelegation**。
- **聚合：** 成功结果聚合一份 **InspectTargetQuality**，后者聚合一个 **InspectTarget**。
