# npm-plus MCP 接入层设计

## 参考资料

- [npm-plus 接入层设计](spec.md)
- [InspectDelegation](../glossary/inspect-delegation.md)
- [InspectResult](inspect-result.md)

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

1. `packageName` 是必填的非空 npm package 名称，包括未限定作用域名称和 `@scope/name` 形式的限定作用域名称。
2. `versionIdentifier` 是可选的非空精确版本号或 tag；省略时由核心工作流使用 `latest` tag。
3. MCP 适配器将两个字段直接映射为 **InspectDelegation**，不接受或解析组合式 package spec。
4. 精确 SemVer 的规范化以及精确版本与 tag 的判定属于核心工作流。
5. Input schema 必须拒绝能够被 npm SemVer 解释为范围、但不能规范化为单个精确版本的 `versionIdentifier`，使版本范围表达式不会进入核心工作流。

工具注册信息必须将 `readOnlyHint`、`idempotentHint` 和 `openWorldHint` 标记为 `true`，将 `destructiveHint` 标记为 `false`。该工具会读取外部 Registry 或制品服务，但不会产生外部副作用。

## 响应结果

- `content`：一段简短文本摘要，概括检查目标以及各质量维度的成功或失败评估。
- `structuredContent`：完整的 **InspectResult**。

包含质量维度评估异常的 **InspectResult** 仍作为成功 tool result 返回。输入 schema 错误，或者将 **InspectDelegation** 转换为 **InspectTarget** 时抛出的错误映射为 MCP error response，不得产生 `structuredContent`。

## 验证要求

- 验证工具名称、标题、描述，以及 `readOnlyHint`、`destructiveHint`、`idempotentHint` 和 `openWorldHint` annotation。
- 验证 input schema 对必填 package 名称、可选版本标识和非空字符串的约束。
- 验证 input schema 拒绝组合式 package spec 和版本范围表达式。
- 验证默认版本、精确版本和 tag 输入直接映射为 **InspectDelegation**。
- 验证全部维度评估成功和部分维度评估失败时的文本摘要与 `structuredContent`。
- 验证 output schema 覆盖 **InspectResult** 以及质量维度成功、失败评估的必填和禁止字段。
- 使用 in-memory transport 验证工具注册与 MCP response 结构。
- 验证输入错误和目标确定错误产生 MCP error response，且不会产生 `structuredContent`。
- 验证质量维度评估异常不会产生 MCP error response。
