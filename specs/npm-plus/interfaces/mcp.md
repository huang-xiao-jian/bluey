# npm-plus MCP 接入层设计

## 参考资料

- [npm-plus 接入层设计](spec.md)
- [InspectDelegation](../glossary/inspect-delegation.md)
- [InspectResult](./glossary/inspect-result.md)

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
}
```

## 输入规则

1. `packageName` 是必填的非空 `npm package` 名称，包括未限定作用域名称和 `@scope/name` 形式的限定作用域名称。
2. `MCP` 适配器将该字段直接映射为 **InspectDelegation**；核心工作流始终检查官方 npm Registry 中 `latest` tag 对应的版本。
3. `Input schema` 必须拒绝 `versionIdentifier` 以及其他未声明字段，也不接受或解析组合式 `package spec`。

工具注册信息必须将 `readOnlyHint`、`idempotentHint` 和 `openWorldHint` 标记为 `true`，将 `destructiveHint` 标记为 `false`。该工具会读取外部 `Registry` 或制品服务，但不会产生外部副作用。

## 响应结果

- `content`：一段简短文本摘要，概括检查目标以及各质量维度的成功或失败评估。
- `structuredContent`：完整的 **InspectResult**。

包含质量维度评估异常的 **InspectResult** 仍作为成功 `tool result` 返回。输入 schema 错误，或者将 **InspectDelegation** 转换为 **InspectTarget** 时抛出的错误映射为 `MCP error response`，不得产生 `structuredContent`。
