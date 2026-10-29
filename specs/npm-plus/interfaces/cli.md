# npm-plus CLI 接入层设计

## 相关文档

- [npm-plus 接入层设计](spec.md)
- [InspectDelegation](../glossary/inspect-delegation.md)
- [InspectResult](./glossary/inspect-result.md)

## 命令

```text
npm-plus inspect <package-name> [--json]
```

## 输入规则

1. `package-name` 是必填的非空 `npm package` 名称，包括未限定作用域名称和 `@scope/name` 形式的限定作用域名称。
2. `CLI` 将 `package-name` 映射为 **InspectDelegation**，核心工作流始终检查官方 npm Registry 中 `latest` tag 对应的版本。
3. CLI 不接受版本标识，也不接受 `package@version` 或 `@scope/package@version` 组合式输入。

## 输出

默认输出为 **InspectResult** 的简洁人类可读表示。

指定 `--json` 时，`stdout` 只包含序列化后的完整 **InspectResult**。

## 退出状态

接入层成功构造 **InspectResult** 时，CLI 以退出状态 `0` 完成，即使其中包含质量数据获取异常。

输入不满足接口契约，或者将 **InspectDelegation** 转换为 **InspectTarget** 时抛出错误，使 CLI 以非零状态结束。CLI 不得为这些错误输出 **InspectResult**。
