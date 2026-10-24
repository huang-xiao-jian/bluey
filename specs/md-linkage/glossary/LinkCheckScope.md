# Link Check Scope

## 参考资料

- [Link Check Delegation](./LinkCheckDelegation.md)

## 定义

**Link Check Scope** 是内部链接检查工作流的正式表示。

## 关键属性

- **Files：** 提交给检查的起始文档在项目内的相对标识。
- **Issues：** 委托文档路径遇到的、由 [Link Check Scope Builder](../roles/LinkCheckScopeBuilder.md#容错异常) 定义的路径异常。

### 数据模型

```ts
enum LinkCheckScopeIssueType {
  DocumentOutsideProjectRoot = "document-outside-project-root",
  DocumentNotFound = "document-not-found",
  DocumentNotMarkdown = "document-not-markdown",
}

interface LinkCheckScopeIssue {
  // 原始文档路径
  path: string;
  // 解析后的绝对路径
  resolvedPath: string;
  // 问题原因
  issueType: LinkCheckScopeIssueType;
}

interface LinkCheckScope {
  readonly files: readonly string[];
  readonly issues: Readonly<LinkCheckScopeIssue>[];
}
```

### 数据模型案例

```json
{
  "files": ["guide.md"],
  "issues": [
    {
      "path": "missing.md",
      "resolvedPath": "/var/specs/missing.md",
      "issueType": "document-not-found"
    }
  ]
}
```

## 规则与约束

1. 范围一经建立便保持不变。
2. 存在问题的已解析路径不应出现在 `files` 中。
3. `files` 中的已解析路径必须唯一。
