# Markdown 链接引用检查规约

## 用例

- [检查规范文档中的失效链接](use-case/check-specification-documents-for-dead-links.md)描述维护者如何选择文档、检查链接并获得可追溯的报告。

## 概念

- [Link Check Delegation](glossary/LinkCheckDelegation.md) 定义一次检查的项目边界、输入解析基准、`files` 输入和遍历模式。
- [Link Check Scope](glossary/LinkCheckScope.md) 定义 `files` 输入解析、展开后得到的起始文档，以及针对路径、glob pattern 和 glob 匹配结果记录的 `LinkCheckScopeIssue`。
- [Specification Link](glossary/SpecificationLink.md) 定义为验证而提取的受支持 Markdown 链接形式。
- [Resolved Specification Link](glossary/ResolvedSpecificationLink.md) 定义链接验证产生的、可追溯的有效与失效变体。
- [Link Check Report](glossary/LinkCheckReport.md) 定义一次链接检查完成后的原始结果。

## 角色

- [Link Check Scope Builder](roles/LinkCheckScopeBuilder.md) 定义将委托转换为范围时使用的异常与算法。

## 相关文档

- [Markdown 链接接口规范](interfaces/spec.md)定义 CLI 和 MCP 使用方如何访问本文规定的能力。
- [面向对象设计](design.md)将本规范转换为候选类及其关系。
