# npm-plus CLI 接入层设计

## 相关文档

- [npm-plus 接入层设计](spec.md)
- [InspectDelegation](../glossary/inspect-delegation.md)
- [InspectResult](./glossary/inspect-result.md)
- [TerminalInspectSummary](./glossary/terminal-inspect-summary.md)

## 命令

```text
npm-plus inspect <package-name> [version-identifier] [--json]
```

## 输入规则

1. `package-name` 是必填的非空 `npm package` 名称，包括未限定作用域名称和 `@scope/name` 形式的限定作用域名称。
2. `version-identifier` 是可选的非空精确版本号或 `tag`，不支持版本范围表达式，例如：`^2.1.0`
3. `package` 名称与版本标识必须作为两个独立位置参数传递，不支持 `package@version` 或 `@scope/package@version` 组合式输入。
4. `CLI` 保持两个位置参数的文本值，并将其直接映射为 **InspectDelegation**。

## 输出

默认输出将根据原始 **InspectResult** 生成 **TerminalInspectSummary**，并将其完整内容写入 `stdout`。

指定 `--json` 时，`stdout` 只包含序列化后的完整原始 **InspectResult**，不生成 **TerminalInspectSummary**。

## 退出状态

成功构造 **InspectResult** 时，CLI 以退出状态 `0` 完成，即使其中包含质量数据获取异常。

CLI 必须捕获内部异常、输出自然语言失败摘要，并以非零状态结束。CLI 不得直接输出异常对象，也不得为这些
错误输出 **InspectResult**。
