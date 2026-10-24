# md-linkage MCP 接入层设计

## 参考资料

- [Markdown 链接引用检查规约](../spec.md)
- [Markdown 链接引用检查接入层设计](spec.md)
- [Link Check Delegation](../glossary/LinkCheckDelegation.md)
- [Link Check Scope](../glossary/LinkCheckScope.md)
- [Link Check Report](../glossary/LinkCheckReport.md)
- [Resolved Specification Link](../glossary/ResolvedSpecificationLink.md)

## 启动

```text
md-linkage mcp
```

子命令通过 `stdio` 启动 `MCP server`。

## 工具

只读工具 `check_specification_links` 接受以下输入：

```ts
interface CheckSpecificationLinksInput {
  /** 此次检查明确指定的绝对项目边界。 */
  readonly root: string;
  /** 一个或多个文件路径、目录路径或 glob 表达式。 */
  readonly files: readonly string[];
  /** 默认为 LinkCheckMode.Shallow。 */
  readonly mode?: LinkCheckMode;
}
```

要求提供 `root`，绝不会根据当前工作目录推断项目边界。MCP 适配器使用 `root` 同时作为 **Link Check Delegation** 的 `base`，并保持 `files` 输入不变。

## 响应结果

- `content`：包含文档数、`LinkCheckScopeIssue` 数和失效链接数的简短文本摘要。
- `structuredContent`：完整的 **Link Check Report**；

无效输入、无效项目根目录或其他阻止构造 **Link Check Report** 的失败会成为 `MCP` 错误。`LinkCheckScopeIssue` 和 `DeadResolvedSpecificationLink` 属于预期检查发现，作为成功的工具结果返回。

## 验证要求

- 验证输入 schema 约束和浅层模式默认值。
- 验证不接受隐式项目根目录。
- 验证文件、目录和 glob 字符串都能直接映射为 **Link Check Delegation** 的 `files` 输入。
- 验证 `root` 同时映射为 **Link Check Delegation** 的 `base`。
- 验证委托映射、结构化报告输出和文本摘要。
- 验证无效请求和阻止报告构造的失败会产生 MCP 错误。
