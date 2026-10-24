# Skill 规范

## 命名和范围

使用描述清晰的全小写 kebab-case 目录名，例如 `release-notes` 或
`linear-issues`。Skill front matter 中的 `name` 应与其目录名保持一致。

每个 skill 只承担一项明确职责。变更应限制在该 skill 内部。公共接口发生变化时，
更新 skill README，说明新的行为、输入、输出、权限或配置。

## Package 结构

```text
skills/<name>/
  SKILL.md            必需的入口文件
  references/         可选的详细参考资料
  scripts/            可选的确定性辅助脚本
  assets/             可选的可复用资源
```

主指令文件应足够简短，以便快速加载。其中应说明何时使用该 skill、预期的输入和输出、
有序的工作流步骤以及验证方式。应链接至补充资料，而不是重复其内容。

## 审查

分享或安装 skill 前，应像审查生产代码一样仔细审查其指令。
