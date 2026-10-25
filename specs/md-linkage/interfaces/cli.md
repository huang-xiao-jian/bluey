# md-linkage Cli

## 参考资料

- [业务逻辑描述](spec.md)
- [Link Check Delegation](../glossary/LinkCheckDelegation.md)
- [Link Check Scope](../glossary/LinkCheckScope.md)
- [Link Check Report](../glossary/LinkCheckReport.md)
- [Resolved Specification Link](../glossary/ResolvedSpecificationLink.md)
- [Link Check Scope Builder](../roles/LinkCheckScopeBuilder.md)

## 命令

```text
md-linkage check <files...> [--root <path>] [--mode <shallow|recursive>] [--json]
```

## 输入规则

1. 入参 `files` 至少包含一个非空字符串；每个字符串可以是文件路径、目录路径或 glob 表达式。
2. 省略 `--root` 时，默认使用进程的当前工作目录作为 `root`；显式 `--root` 根据当前工作目录解析为绝对路径。
3. 省略 `--mode` 时，默认使用 `LinkCheckMode.Shallow`。
4. 构造 **Link Check Delegation** 时，适配器使用进程的当前工作目录作为 `base`，并保持 `files` 输入不变；即使显式指定 `--root`，`base` 也不随之改变。
5. 为避免 shell 在 CLI 接收参数前自行展开 glob，使用方应引用包含 glob 元字符的输入，例如 `"specs/**/*.md"`。
6. 检查期间发现的链接仍相对于包含各链接的文档进行解析。

## 输出

默认输出为简洁的人类可读报告，包含：

- `LinkCheckScopeIssue` 问题总数
- `LinkCheckScopeIssue` 详细说明
- `DeadResolvedSpecificationLink` 问题总数
- `DeadResolvedSpecificationLink` 问题详情

人类可读报告中的来源文件使用项目相对路径显示。

当 stdout 连接到支持终端超链接的交互式终端时，CLI 使用 `OSC 8` 转义序列将
来源路径渲染为可点击链接。链接的可见文本保持上述项目相对路径格式，目标使用
来源文件的绝对 `file://` URI，使目标应用能够打开来源文件。

当 stdout 未连接到交互式终端，或终端超链接不可用时，CLI 不输出 `OSC 8` 转义
序列，仅保留相同的纯文本来源文件路径。

指定 `--json` 时，stdout 仅包含序列化后的 **Link Check Report**。不属于报告的诊断信息写入 stderr。

## 退出状态

CLI 未抛出执行异常即看做执行成功，即使报告中包含检测问题。

## 验证要求

- 验证当前工作目录作为默认 `root`、固定 `base` 与浅层模式默认值。
- 验证明示根目录和模式的映射。
- 验证显式 `--root` 不改变以当前工作目录作为 `base` 的行为。
- 验证文件、目录和 glob 字符串不经解析或展开即可映射为 **Link Check Delegation** 的 `files` 输入，且引用的 glob 不会由 CLI 适配器提前展开。
- 验证 `base` 不改变递归链接相对于来源文档的解析方式。
- 验证人类可读输出和 JSON 输出。
- 验证交互式终端中的来源文件使用项目相对路径作为可见文本，并链接到来源文件的绝对 `file://` URI。
- 验证 stdout 非交互或终端超链接不可用时，来源文件降级为不包含 `OSC 8` 转义序列的相同纯文本路径。
- 验证 `--json` 输出不包含终端超链接转义序列，且 **Link Check Report** 的序列化结构不变。
- 验证无问题报告和包含检查发现的报告都能成功完成。
- 验证阻止报告构造的失败会继续传播。
