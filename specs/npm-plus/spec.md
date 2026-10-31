# NPM 生态质量支持

## 用例

- [检查 npm package 质量](use-case/inspect-npm-package-quality.md)

## 概念

- [InspectDelegation](glossary/inspect-delegation.md)描述开发者提交的 package 检查委托。
- [InspectTarget](glossary/inspect-target.md)描述已经确定精确版本的实际检查目标。
- [InspectTargetQuality](glossary/inspect-target-quality.md)描述系统为检查目标提供的核心质量支撑数据。

## 相关文档

- [业务层 Worker 异常契约](worker-exceptions.md)定义目标确定 Worker 的职责边界及其稳定异常语义。
- [npm-plus 接入层设计](interfaces/spec.md)定义 CLI 和 MCP 使用方如何访问本规范规定的能力。
- [面向对象设计](design.md)将本规范转换为候选类、职责及协作关系。
