# npm-plus CLI 接入层设计

## 参考资料

- [npm-plus 接入层设计](spec.md)
- [InspectDelegation](../glossary/inspect-delegation.md)
- [InspectResult](inspect-result.md)

## 命令

```text
npm-plus inspect <package-name> [version-identifier] [--json]
```

## 输入规则

1. `package-name` 是必填的非空 npm package 名称，包括未限定作用域名称和 `@scope/name` 形式的限定作用域名称。
2. `version-identifier` 是可选的非空精确版本号或 tag；省略时由核心工作流使用 `latest` tag。
3. Package 名称与版本标识必须作为两个独立位置参数传递。CLI 不接受 `package@version` 或 `@scope/package@version` 组合式输入。
4. CLI 保持两个位置参数的文本值，并将其直接映射为 **InspectDelegation**；精确 SemVer 的规范化以及精确版本与 tag 的判定属于核心工作流。
5. 版本范围表达式不属于支持的版本标识。能够被 npm SemVer 解释为范围、但不能规范化为单个精确版本的 `version-identifier` 必须在调用核心工作流前被拒绝。

## 输出

默认输出为简洁的人类可读报告。

成功结果显示：

- 已确定的 package 名称和精确版本
- 通过 tag 确定版本时使用的 tag
- 当前可获得的质量维度及其原始事实

目标确定失败结果显示对应的 package、精确版本或 tag 不存在或无法解析事实。报告不得包含评分、评级、采用建议或其他评价性结论。

指定 `--json` 时，stdout 只包含序列化后的完整 **InspectResult**。诊断信息写入 stderr，JSON 输出不得混入人类可读摘要或日志。

## 退出状态

全部 **InspectResult** 变体均表示接入层成功构造结构化结果，CLI 以退出状态 `0` 完成。

输入不满足接口契约、Registry 访问失败、制品读取失败或其他阻止核心工作流完成的技术异常使 CLI 以非零状态结束。CLI 不得为这些失败输出伪造的 **InspectResult**。

## 验证要求

- 验证 package 名称单独映射为省略版本标识的 **InspectDelegation**。
- 验证 package 名称加精确版本或 tag 分别原样映射为 **InspectDelegation**。
- 验证限定作用域 package 名称作为一个独立位置参数映射，且不会被解释为组合式输入。
- 验证缺失或空 package 名称、空版本标识、多余位置参数、组合式输入和版本范围表达式会在调用工作流前失败。
- 验证默认人类可读输出覆盖成功及四种目标确定失败结果。
- 验证 `--json` 输出完整 **InspectResult**，且不包含摘要、日志或其他非 JSON 内容。
- 验证五种业务结果均以退出状态 `0` 完成。
- 验证输入错误和技术异常以非零状态结束并写入 stderr。
