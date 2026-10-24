# 文档规范

## 内容规范

- 优先使用链接文档，避免重复相同内容。
- 绝对不允许使用 `markdown table`，长文本场景下可读性极差

## 链接

- 当文档依赖参考文件时，在文档开始位置增加“前置资料”章节，并在其中列出参考链接，使用能够描述目标内容的链接文本
- 当“前置资料”中列出参考资料后，文档其余部分应使用其 **加粗名称**，不要重复链接
- 默认 `AGENTS.md` 负责链接 `docs/` 下的文件作为导航

## TypeScript 约束

> 文档文件中 `TypeScript` 示例应遵循的简单准则

- 对于有限取值，必须使用 enum，而不是字面量类型。

```ts
// 错误示例
type LinkCheckMode = "shallow" | "recursive";

// 正确示例
enum LinkCheckMode {
  Shallow = "shallow",
  Recursive = "recursive",
}
```
