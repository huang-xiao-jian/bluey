# npm-plus CLI 接入层设计

## 相关文档

- [npm-plus 接入层设计](spec.md)
- [InspectDelegation](../glossary/inspect-delegation.md)
- [InspectResult](./glossary/inspect-result.md)

## 命令

```text
npm-plus inspect <package-name> [version-identifier] [--json]
```

## 输入规则

1. `package-name` 是必填的非空 `npm package` 名称，包括未限定作用域名称和 `@scope/name` 形式的限定作用域名称。
2. `version-identifier` 是可选的非空精确版本号或 `tag`；省略时由核心工作流使用 `latest` tag。
3. `Package` 名称与版本标识必须作为两个独立位置参数传递。CLI 不接受 `package@version` 或 `@scope/package@version` 组合式输入。
4. `CLI` 保持两个位置参数的文本值，并将其直接映射为 **InspectDelegation**；精确 `SemVer` 的规范化以及精确版本与 `tag` 的判定属于核心工作流。
5. 版本范围表达式不属于支持的版本标识。能够被 npm SemVer 解释为范围、但不能规范化为单个精确版本的 `version-identifier` 必须在调用核心工作流前被拒绝。

## 输出

默认输出为 **InspectResult** 的简洁人类可读表示。

指定 `--json` 时，`stdout` 只包含序列化后的完整 **InspectResult**。

## 退出状态

接入层成功构造 **InspectResult** 时，CLI 以退出状态 `0` 完成，即使其中包含质量数据获取异常。

输入不满足接口契约，或者将 **InspectDelegation** 转换为 **InspectTarget** 时抛出错误，使 CLI 以非零状态结束。CLI 不得为这些错误输出 **InspectResult**。
