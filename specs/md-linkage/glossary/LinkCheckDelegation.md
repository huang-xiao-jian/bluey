# Link Check Delegation

## 参考资料

- [Link Check Scope](./LinkCheckScope.md)
- [Link Check Scope Builder](../roles/LinkCheckScopeBuilder.md)

## 定义

**Link Check Delegation** --> 维护者描述“检查 `Markdown` 文档中失效链接”任务的结构化数据，用于向内部工作流分派任务。

## 关键属性

- **Project Root：** 检查中文档的文件系统边界。
- **Input Base：** 解析 `files` 中相对路径以及匹配 glob pattern 的基准目录。
- **Files：** 检查时明确指定的起始输入。文件或目录路径可以使用绝对形式或相对于 `base` 的形式；glob pattern 必须相对于 `base`。
- **Check Mode：** 决定 **Link Check Scope** 仅限于 **Link Check Delegation** 的起始文档，还是可以通过符合条件的 `Markdown` 引用继续扩展的策略。

### 数据模型

```ts
enum LinkCheckMode {
  // 将范围限制为委托的起始文档；
  Shallow = "shallow",
  // 通过符合条件的本地 `Markdown` 引用扩展范围。
  Recursive = "recursive",
}

interface LinkCheckDelegation {
  /** 此次检查的稳定项目边界与参照系。 */
  readonly root: string;
  /** 解析 files 中相对输入的绝对基准目录。 */
  readonly base: string;
  /** 文件路径、目录路径或 glob 表达式形式的输入。 */
  readonly files: readonly string[];
  /** 用于派生内部文件的检查模式。 */
  readonly mode: LinkCheckMode;
}
```

### 数据模型案例

```json
{
  "root": "/var/specs",
  "base": "/var/specs",
  "files": ["environment.md", "guides", "reference/**/*.md"],
  "mode": "shallow"
}
```

## 规则与约束

1. `root` 必须是非空绝对路径。
2. `base` 必须是非空绝对路径；构造方未指定时使用 `root`。
3. `base` 负责输入解析，不改变 `root` 定义的项目包含边界，也不要求位于 `root` 内。
4. `files` 必须至少包含一个输入项；每个输入项必须是非空字符串。
5. 不含 glob 语法的相对输入以 `base` 为参照系，并由 **Link Check Scope Builder** 根据文件系统事实识别为文件路径或目录路径；绝对文件或目录路径保留自身参照系。
6. 含 `*`、`**`、`?`、`[]` 或 `{}` 的输入项按 glob pattern 解释；pattern 必须是相对于 `base` 的表达式。
7. 目录路径递归选择其中的 `Markdown` 文件。
8. glob pattern 匹配文件系统目标；匹配结果中的目录不会隐式递归展开。
9. `files` 保留传入的字符串，不在实例化 **Link Check Delegation** 时访问文件系统、解析 glob pattern 或展开输入。解析和展开结果及其问题由 **Link Check Scope** 表示。

### Link Check Scope Issue

`files` 输入通过数据校验后，仍可能因文件系统状态而无法产生可检查文档。这类情况不是 **Link Check Delegation** 数据异常，而是建立 **Link Check Scope** 时产生的可容错 `LinkCheckScopeIssue`：

- 具体路径不存在时产生 `PathNotFound`。
- 具体文件不是 `Markdown` 文档时产生 `FileNotMarkdown`。
- 目录中不包含 `Markdown` 文档时产生 `DirectoryContainsNoMarkdown`。
- glob pattern 语法无效或使用绝对形式时产生 `GlobPatternInvalid`。
- glob pattern 没有匹配任何文件系统目标时产生 `GlobPatternNotMatched`。
- glob pattern 有匹配结果但没有匹配到 `Markdown` 文件时产生 `GlobPatternMatchedNoMarkdown`。
- 具体路径或展开得到的文档位于项目边界之外时产生 `PathOutsideProjectRoot`。

### 数据异常

- **Unsupported Root：**
- **Unsupported Base：**
- **Missing Files：**
- **Unsupported File Input：**

### 异常策略

数据异常为致命错误，直接中断执行！

## 扩展点

无
