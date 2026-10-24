# MCP server 规范

## 命名和范围

使用描述清晰的全小写 kebab-case 目录名，例如 `release-notes` 或
`linear-issues`。

每个 MCP server 只承担一项明确职责。变更应限制在该 server 内部。公共接口发生变化时，
更新 server README，说明新的行为、输入、输出、权限或配置。

## Tool 和安全性

优先设计名称清晰的小型 tool。Tool 描述应说明副作用、所需权限和有实际意义的约束。
对于会改变外部状态的 tool，其名称和描述都必须明确表达该操作。

除非明确要求其他 transport，否则 MCP server 通过 stdio 通信。协议消息写入 stdout，
日志写入 stderr。验证所有 tool 输入，并返回简洁且有帮助的错误。绝不提交凭据、token
或特定于机器的路径。
