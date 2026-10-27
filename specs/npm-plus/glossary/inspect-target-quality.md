# InspectTargetQuality

## 前置依赖（可选）

- [InspectTarget](./inspect-target.md)
- [InspectTargetRawQuality](./raw-quality/inspect-target-raw-quality.md)
- [InspectTargetDependencyScaleRawQuality](./raw-quality/inspect-target-dependency-scale-raw-quality.md)

## 1. 定义

`InspectTargetQuality` 是系统为一个具体检查目标提供的核心质量支撑数据。它把系统能够获得的各维度原始质量事实归集到同一目标下，为开发者或上层能力提供完整、客观的数据边界。

## 2. 关键属性

- **检查目标：** 本质量数据聚合所描述的**InspectTarget**。
- **依赖规模质量：** 可选的**InspectTargetDependencyScaleRawQuality**。

### 数据模型

```ts
interface InspectTargetQuality {
  target: InspectTarget;
  dependencyScale?: InspectTargetDependencyScaleRawQuality;
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
```

## 3. 规则与约束

1. **归属约束：** 每个本概念实例必须且只能描述一个**InspectTarget**。
2. **聚合归属约束：** 聚合中的所有**InspectTargetRawQuality**均由本概念统一归属于其记录的检查目标，各维度原始质量事实不重复记录检查目标。
3. **统计约束：** 每个规定质量维度至多包含一个对应的**InspectTargetRawQuality**。
4. **可选性约束：** 每个质量维度都可以缺失；本概念不要求所有维度均有可获得的数据。
5. **客观性约束：** 本概念只聚合原始质量事实，不计算跨维度评分、评级或综合质量结论。
6. **评价责任约束：** 本概念不判断检查目标是否适合采用，评价责任属于开发者。
7. **呈现边界约束：** 本概念不规定质量支撑数据的报告格式、呈现方式或传递方式。

## 4. 关系

- **关联：** 每个本概念实例归属于一个**InspectTarget**。
- **聚合：** 本概念聚合 `[0,1]` 个**InspectTargetDependencyScaleRawQuality**。
