# InspectTargetRawQuality

## 1. 定义

`InspectTargetRawQuality` 是一个规定质量维度上的原始质量事实。它用于保留系统能够获得的客观数据，而不把这些数据转换为评分、评级、价值判断或采用建议。

## 2. 关键属性

- **质量维度：** 原始质量事实所属的规定质量类别。
- **原始事实：** 系统在该质量维度上能够获得的客观信息。

### 数据模型

```ts
enum InspectTargetRawQualityDimension {
  DependencyScale = "dependency-scale",
}

interface InspectTargetRawQuality {
  dimension: InspectTargetRawQualityDimension;
}
```

### 数据模型案例

**具体维度原始质量事实的公共属性：**

```json
{
  "dimension": "dependency-scale"
}
```

## 3. 规则与约束

1. **子类型完备约束：** 本概念必须属于一个已经正式定义的质量维度。
2. **子类型互斥约束：** 一个本概念实例只能属于一个质量维度，不能同时代表多个维度。
3. **客观性约束：** 原始事实不得包含评分、评级、价值判断、综合结论或采用建议。
4. **可获得性约束：** 只记录系统能够获得的事实，不要求每个检查目标在每个质量维度上都有数据。
5. **评价责任约束：** 本概念不代替开发者解释质量事实或判断 package 是否适合采用。
6. **接口特化约束：** 具体维度接口必须扩展本概念接口，将 `dimension` 收窄为对应枚举成员，并补充该维度负责提供的原始事实集合。

## 4. 关系

- **泛化：** `InspectTargetDependencyScaleRawQuality` 是本概念在依赖规模维度上的特化。
