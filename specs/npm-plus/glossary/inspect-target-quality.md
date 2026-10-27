# InspectTargetQuality

## 前置依赖（可选）

- [InspectTarget](./inspect-target.md)
- [InspectTargetRawQuality](./raw-quality/inspect-target-raw-quality.md)
- [InspectTargetDependencyScaleRawQuality](./raw-quality/inspect-target-dependency-scale-raw-quality.md)

## 1. 定义

`InspectTargetQuality` 是系统为一个具体检查目标提供的核心质量支撑数据。它把系统能够获得的各维度原始质量事实归集到同一目标下，为开发者或上层能力提供完整、客观的数据边界。

## 2. 关键属性

- **检查目标：** 本质量数据聚合所描述的**InspectTarget**。
- **依赖规模评估：** 依赖规模维度的成功原始质量数据或评估异常。

### 数据模型

```ts
enum InspectTargetQualityEvaluationStatus {
  Succeeded = "succeeded",
  Failed = "failed",
}

interface InspectTargetQualityException {
  name: string;
  message: string;
}

interface SucceededInspectTargetQualityEvaluation<
  T extends InspectTargetRawQuality,
> {
  status: InspectTargetQualityEvaluationStatus.Succeeded;
  quality: T;
}

interface FailedInspectTargetQualityEvaluation {
  status: InspectTargetQualityEvaluationStatus.Failed;
  exception: InspectTargetQualityException;
}

type InspectTargetQualityEvaluation<T extends InspectTargetRawQuality> =
  | SucceededInspectTargetQualityEvaluation<T>
  | FailedInspectTargetQualityEvaluation;

interface InspectTargetQuality {
  target: InspectTarget;
  dependencyScale: InspectTargetQualityEvaluation<
    InspectTargetDependencyScaleRawQuality
  >;
}
```

### 数据模型案例

```json
{
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
```

**依赖规模评估失败：**

```json
{
  "target": {
    "packageName": "example-package",
    "exactVersion": "1.2.3"
  },
  "dependencyScale": {
    "status": "failed",
    "exception": {
      "name": "PackageManifestReadError",
      "message": "Unable to read package.json from the published package."
    }
  }
}
```

## 3. 规则与约束

1. **归属约束：** 每个本概念实例必须且只能描述一个**InspectTarget**。
2. **评估完备约束：** 每个正式定义的质量维度必须且只能包含一个评估结果，不得通过字段缺失表达评估失败。
3. **评估排他约束：** 成功评估只包含对应的**InspectTargetRawQuality**；失败评估只包含异常，两者不得同时出现。
4. **聚合归属约束：** 成功评估中的所有**InspectTargetRawQuality**均由本概念统一归属于其记录的检查目标，各维度原始质量事实不重复记录检查目标。
5. **异常内建约束：** 确定 **InspectTarget** 后，评估某个质量维度时抛出的异常必须转换为该维度的失败评估，不得使其他维度的评估结果丢失。
6. **异常序列化约束：** 失败评估只公开稳定的异常名称与消息，不包含 stack、cause 或其他不可序列化值。
7. **客观性约束：** 本概念只聚合原始质量事实和评估异常，不计算跨维度评分、评级或综合质量结论。
8. **评价责任约束：** 本概念不判断检查目标是否适合采用，评价责任属于开发者。
9. **呈现边界约束：** 本概念不规定质量支撑数据的报告格式、呈现方式或传递方式。

## 4. 关系

- **关联：** 每个本概念实例归属于一个**InspectTarget**。
- **聚合：** 本概念聚合一个依赖规模质量评估；成功评估聚合一个**InspectTargetDependencyScaleRawQuality**，失败评估聚合一个 `InspectTargetQualityException`。
