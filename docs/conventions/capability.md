# 能力规范

本文档定义 `Skill` 和 `MCP server` 的通用约定，以及各自特有的结构与通信约定。

## 命名

- 使用描述清晰的全小写 `kebab-case` 目录名，例如 `release-notes` 或 `linear-issues`。

## Skill

- `Skill front matter` 中的 `name` 应与其目录名保持一致。
- 每个 `skill` 只承担一项明确职责。变更应限制在该 `skill` 内部。公共接口发生变化时，
  更新 `skill` `README`，说明新的行为、输入、输出、权限或配置。

### Skill 结构

```text
skills/<name>/
  SKILL.md            必需的入口文件
  references/         可选的详细参考资料
  scripts/            可选的确定性辅助脚本
  assets/             可选的可复用资源
```

## MCP server

- `MCP server` 默认通过 `stdio` 通信。
