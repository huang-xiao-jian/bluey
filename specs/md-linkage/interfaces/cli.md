# md-linkage Cli

## 参考资料

- [业务逻辑描述](spec.md)

## 命令

```text
md-linkage check <files...> [--root <path>] [--mode <shallow|recursive>] [--json]
```

## 输入规则

1. 入参 `files` 至少包含一个非空的具体文档路径，不支持 glob。
2. 省略 `--root` 时，默认使用进程的当前工作目录。
3. 省略 `--mode` 时，默认使用 `LinkCheckMode.Shallow`。
4. 构造委托前，根据进程的当前工作目录将起始文件参数解析为绝对路径。项目根目录仍是包含边界。检查期间发现的链接仍相对于包含各链接的文档进行解析。

## 输出

默认输出为简洁的人类可读报告，包含：

- `LinkCheckScopeIssue` 问题总数
- `LinkCheckScopeIssue` 详细说明
- `DeadResolvedSpecificationLink` 问题总数
- `DeadResolvedSpecificationLink` 问题详情

指定 `--json` 时，stdout 仅包含序列化后的 **Link Check Report**。不属于报告的诊断信息写入 stderr。

## 退出状态

CLI 未抛出执行异常即看做执行成功，即使报告中包含检测问题。

## 验证要求

- 验证当前工作目录与浅层模式的默认值。
- 验证明示根目录和模式的映射。
- 验证起始文件参数基于当前工作目录解析，且不改变递归链接解析方式。
- 验证人类可读输出和 JSON 输出。
- 验证无问题报告和包含检查发现的报告都能成功完成。
- 验证阻止报告构造的失败会继续传播。
