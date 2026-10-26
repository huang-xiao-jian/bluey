# InspectTargetRawQuality

## 前置依赖（可选）

- [InspectTarget](./inspect-target.md)

## 1. 定义

`InspectTargetRawQuality` 是特定检查目标在一个规定质量维度上的原始质量事实。它用于保留系统能够获得的客观数据，而不把这些数据转换为评分、评级、价值判断或采用建议。

## 2. 关键属性

- **检查目标：** 原始质量事实所归属的**InspectTarget**。
- **质量维度：** 原始质量事实所属的规定质量类别。
- **原始事实：** 系统在该质量维度上能够获得的客观信息。

## 3. 规则与约束

1. **归属约束：** 每个本概念实例必须且只能归属于一个**InspectTarget**。
2. **子类型完备约束：** 本概念必须属于安全性、维护状况、流行度、文档质量、许可证、依赖风险或供应链可信度中的一个维度。
3. **子类型互斥约束：** 一个本概念实例只能属于一个质量维度，不能同时代表多个维度。
4. **客观性约束：** 原始事实不得包含评分、评级、价值判断、综合结论或采用建议。
5. **可获得性约束：** 只记录系统能够获得的事实，不要求每个检查目标在每个质量维度上都有数据。
6. **评价责任约束：** 本概念不代替开发者解释质量事实或判断 package 是否适合采用。

## 4. 关系

- **关联：** 每个本概念实例归属于一个**InspectTarget**。
- **泛化：** `InspectTargetSecurityRawQuality`、`InspectTargetMaintenanceRawQuality`、`InspectTargetPopularityRawQuality`、`InspectTargetDocumentationRawQuality`、`InspectTargetLicenseRawQuality`、`InspectTargetDependencyRiskRawQuality` 和 `InspectTargetSupplyChainTrustRawQuality` 是本概念的特化。
