# Link Check Delegation

## 定义

**Link Check Delegation** --> 维护者描述“检查 `Markdown` 文档中失效链接”任务的结构化数据，用于向内部工作流分派任务。

## 关键属性

- **Project Root：** 检查中文档的文件系统边界。
- **Document Paths：** 检查时明确指定的 `Markdown` 文档路径。每个路径可以是绝对路径，也可以是相对于项目根目录的路径。
- **Check Mode：** 决定范围仅限于委托的起始文档，还是可以通过符合条件的 `Markdown` 引用继续扩展的策略。

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
  /** 明确指定的文档路径集合。 */
  readonly files: readonly string[];
  /** 用于派生内部文件的检查模式。 */
  readonly mode: LinkCheckMode;
}
```

### 数据模型案例

```json
{
  "root": "/var/specs",
  "files": ["environment.md", "/var/specs/repairement/sepc.md"],
  "mode": "shallow"
}
```

## 规则与约束

1. `root` 必须是非空绝对路径。
2. `files` 必须至少包含一个文档路径；每个文档路径必须是非空的具体路径字符串，不能是 glob。

### 数据异常

- **Unsupported Root：**
- **Missing Document Paths：**
- **Unsupported Document Path：**

### 异常策略

数据异常为致命错误，直接中断执行！

## 扩展点

无
