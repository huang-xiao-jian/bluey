# npm-plus MCP 接入层设计

## 参考资料

- [npm-plus 接入层设计](spec.md)
- [InspectDelegation](../glossary/inspect-delegation.md)
- [InspectResult](./glossary/inspect-result.md)
- [McpInspectSummary](./glossary/mcp-inspect-summary.md)

## 启动

```text
npm-plus mcp
```

子命令通过 `stdio` 启动 `MCP server`。

## 工具

只读工具 `inspect_npm_package` 接受以下输入：

```ts
interface InspectNpmPackageInput {
  readonly packageName: string;
  readonly versionIdentifier?: string;
}
```

## 输入规则

1. `packageName` 是必填的非空 `npm package` 名称，包括未限定作用域名称和 `@scope/name` 形式的限定作用域名称。
2. `versionIdentifier` 是可选的非空精确版本号或 `tag`，明确不支持版本范围表达式。

## 输出结果

- `content`：根据原始 **InspectResult** 生成的 **McpInspectSummary**，以中文文本完整呈现检查目标、可用的质量事实以及质量数据获取异常，信息内容与 terminal 报告对齐。
- `structuredContent`：完整的原始 **InspectResult**，不属于 **McpInspectSummary**。

包含质量维度评估异常的 **InspectResult** 仍作为成功 `tool result` 返回。输入不满足委托约束，
或者无法将 **InspectDelegation** 转换为 **InspectTarget** 时，接入层必须捕获内部异常并映射为
包含自然语言失败摘要的 `MCP error response`，不得直接输出异常对象或产生
`structuredContent`。

## 特殊说明

工具注册信息必须将 `readOnlyHint`、`idempotentHint` 和 `openWorldHint` 标记为 `true`，将 `destructiveHint` 标记为 `false`。该工具会读取外部 `Registry` 或制品服务，但不会产生外部副作用。
