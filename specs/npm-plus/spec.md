# NPM 生态质量支持

## 用例

- [获取 npm package 质量信息报告](use-case/get-npm-package-quality-information-report.md)描述开发者如何获取指定 package 及版本的客观质量信息，并自行评价是否采用该 package。

## 概念

- [InspectDelegation](glossary/inspect-delegation.md)描述开发者提交的 package 检查委托。
- [InspectTarget](glossary/inspect-target.md)描述已经确定精确版本的实际检查目标。
- [InspectTargetBuilder](glossary/inspect-target-builder.md)描述从检查委托确定具体检查目标的业务过程。
- [InspectTargetRawQuality](glossary/inspect-target-raw-quality.md)描述检查目标在单个质量维度上的原始质量事实。
- [InspectTargetSecurityRawQuality](glossary/inspect-target-security-raw-quality.md)描述检查目标的安全性原始质量事实。
- [InspectTargetMaintenanceRawQuality](glossary/inspect-target-maintenance-raw-quality.md)描述检查目标的维护状况原始质量事实。
- [InspectTargetPopularityRawQuality](glossary/inspect-target-popularity-raw-quality.md)描述检查目标的流行度原始质量事实。
- [InspectTargetDocumentationRawQuality](glossary/inspect-target-documentation-raw-quality.md)描述检查目标的文档质量原始事实。
- [InspectTargetLicenseRawQuality](glossary/inspect-target-license-raw-quality.md)描述检查目标的许可证原始质量事实。
- [InspectTargetDependencyRiskRawQuality](glossary/inspect-target-dependency-risk-raw-quality.md)描述检查目标的依赖风险原始质量事实。
- [InspectTargetSupplyChainTrustRawQuality](glossary/inspect-target-supply-chain-trust-raw-quality.md)描述检查目标的供应链可信度原始质量事实。
- [InspectTargetQuality](glossary/inspect-target-quality.md)聚合检查目标在各规定维度上的原始质量数据。
- [InspectTargetQualityReport](glossary/inspect-target-quality-report.md)描述系统最终交付给开发者的质量报告。

## 角色

## 相关文档

- [技术异常](technical-exceptions.md)记录业务用例之外的异常条件，不涉及接入层设计。
