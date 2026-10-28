# InspectTargetQuality

## 相关文档

- [InspectTargetDependencyScaleQuality](./raw-quality/inspect-target-dependency-scale-quality.md)

## 1. 定义

`InspectTargetQuality` 是系统提供的核心质量支撑数据。它归集系统能够获得的各维度原始质量事实，为开发者或上层能力提供完整、客观的数据边界。

## 2. 关键属性

- **依赖规模质量：** 系统能够获取时，记录依赖规模维度的原始质量数据。
- **异常：** 平铺记录无法顺利获取质量维度数据时发生的异常。

### 数据模型

```ts
interface InspectTargetQualityException {
  name: string;
  message: string;
}

interface InspectTargetQuality {
  dependencyScale?: InspectTargetDependencyScaleQuality;
  exceptions: InspectTargetQualityException[];
}
```

### 数据模型案例

```json
{
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
```

**依赖规模数据获取异常：**

```json
{
  "exceptions": [
    {
      "name": "PackageManifestReadError",
      "message": "Unable to read package.json from the published package."
    }
  ]
}
```

## 3. 规则与约束

1. **目标分离约束：** 本概念不记录检查目标。
2. **数据可获得性约束：** 系统能够顺利获取某个质量维度的数据时，必须直接记录该维度的质量事实。
3. **异常记录约束：** 系统无法顺利获取某个质量维度的数据时，必须省略该维度字段，并将发生的异常平铺记录在 `exceptions` 中。
4. **局部异常约束：** 一个质量维度的数据获取异常不得导致其他已获取的质量事实丢失。
5. **聚合边界约束：** 各维度质量事实只记录本维度数据，不重复记录检查目标。
6. **异常序列化约束：** 异常只公开稳定的名称与消息，不包含 stack、cause 或其他不可序列化值。
7. **客观性约束：** 本概念只聚合原始质量事实和数据获取异常，不计算跨维度评分、评级或综合质量结论。
8. **评价责任约束：** 本概念不判断检查目标是否适合采用，评价责任属于开发者。
9. **呈现边界约束：** 本概念不规定质量支撑数据的报告格式、呈现方式或传递方式。

## 4. 关系

- **聚合：** 本概念聚合能够顺利获取的**InspectTargetDependencyScaleQuality**以及数据获取过程中发生的 `InspectTargetQualityException`。
