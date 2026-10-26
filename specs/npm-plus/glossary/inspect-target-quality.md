# InspectTargetQuality

## 前置依赖（可选）

- [InspectTarget](./inspect-target.md)
- [InspectTargetRawQuality](./inspect-target-raw-quality.md)
- [InspectTargetSecurityRawQuality](./inspect-target-security-raw-quality.md)
- [InspectTargetMaintenanceRawQuality](./inspect-target-maintenance-raw-quality.md)
- [InspectTargetPopularityRawQuality](./inspect-target-popularity-raw-quality.md)
- [InspectTargetDocumentationRawQuality](./inspect-target-documentation-raw-quality.md)
- [InspectTargetLicenseRawQuality](./inspect-target-license-raw-quality.md)
- [InspectTargetDependencyRiskRawQuality](./inspect-target-dependency-risk-raw-quality.md)
- [InspectTargetSupplyChainTrustRawQuality](./inspect-target-supply-chain-trust-raw-quality.md)

## 1. 定义

`InspectTargetQuality` 是一个具体检查目标在规定质量维度上的原始质量数据聚合。它把系统能够获得的各维度事实归集到同一目标下，为生成质量报告提供完整的客观数据边界。

## 2. 关键属性

- **检查目标：** 本质量数据聚合所描述的**InspectTarget**。
- **安全性质量：** 可选的**InspectTargetSecurityRawQuality**。
- **维护状况质量：** 可选的**InspectTargetMaintenanceRawQuality**。
- **流行度质量：** 可选的**InspectTargetPopularityRawQuality**。
- **文档质量：** 可选的**InspectTargetDocumentationRawQuality**。
- **许可证质量：** 可选的**InspectTargetLicenseRawQuality**。
- **依赖风险质量：** 可选的**InspectTargetDependencyRiskRawQuality**。
- **供应链可信度质量：** 可选的**InspectTargetSupplyChainTrustRawQuality**。

## 3. 规则与约束

1. **归属约束：** 每个本概念实例必须且只能描述一个**InspectTarget**。
2. **聚合一致性约束：** 聚合中的所有**InspectTargetRawQuality**必须归属于同一个检查目标，且该目标必须是本概念记录的检查目标。
3. **统计约束：** 每个规定质量维度至多包含一个对应的**InspectTargetRawQuality**。
4. **可选性约束：** 每个质量维度都可以缺失；本概念不要求所有维度均有可获得的数据。
5. **客观性约束：** 本概念只聚合原始质量事实，不计算跨维度评分、评级或综合质量结论。
6. **评价责任约束：** 本概念不判断检查目标是否适合采用，评价责任属于开发者。

## 4. 关系

- **关联：** 每个本概念实例归属于一个**InspectTarget**。
- **聚合：** 本概念分别聚合 `[0,1]` 个**InspectTargetSecurityRawQuality**、**InspectTargetMaintenanceRawQuality**、**InspectTargetPopularityRawQuality**、**InspectTargetDocumentationRawQuality**、**InspectTargetLicenseRawQuality**、**InspectTargetDependencyRiskRawQuality**和**InspectTargetSupplyChainTrustRawQuality**。
