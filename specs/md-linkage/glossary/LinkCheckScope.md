# Link Check Scope

## 参考资料

- [Link Check Delegation](./LinkCheckDelegation.md)
- [Link Check Scope Builder](../roles/LinkCheckScopeBuilder.md)

## 定义

**Link Check Scope** 是内部链接检查工作流的正式表示。

## 关键属性

- **Files：** **Link Check Delegation** 的 `files` 输入解析、展开后，提交给检查的起始文档在项目内的相对标识。
- **Issues：** `files` 输入解析或展开时遇到的、由 **Link Check Scope Builder** 定义的 `LinkCheckScopeIssue`。

### 数据模型

```ts
enum LinkCheckScopeIssueSubjectType {
  Path = "path",
  GlobPattern = "glob-pattern",
  GlobMatch = "glob-match",
}

enum LinkCheckScopeIssueType {
  PathOutsideProjectRoot = "path-outside-project-root",
  PathNotFound = "path-not-found",
  FileNotMarkdown = "file-not-markdown",
  DirectoryContainsNoMarkdown = "directory-contains-no-markdown",
  GlobPatternInvalid = "glob-pattern-invalid",
  GlobPatternNotMatched = "glob-pattern-not-matched",
  GlobPatternMatchedNoMarkdown = "glob-pattern-matched-no-markdown",
}

interface LinkCheckScopePathIssue {
  readonly subjectType: LinkCheckScopeIssueSubjectType.Path;
  /** Link Check Delegation.files 中的原始路径输入。 */
  readonly path: string;
  readonly resolvedPath: string;
  readonly issueType:
    | LinkCheckScopeIssueType.PathOutsideProjectRoot
    | LinkCheckScopeIssueType.PathNotFound
    | LinkCheckScopeIssueType.FileNotMarkdown
    | LinkCheckScopeIssueType.DirectoryContainsNoMarkdown;
}

interface LinkCheckScopeGlobPatternIssue {
  readonly subjectType: LinkCheckScopeIssueSubjectType.GlobPattern;
  /** 实际用于匹配的绝对基准目录。 */
  readonly base: string;
  /** Link Check Delegation.files 中的原始 glob pattern。 */
  readonly pattern: string;
  readonly issueType:
    | LinkCheckScopeIssueType.GlobPatternInvalid
    | LinkCheckScopeIssueType.GlobPatternNotMatched
    | LinkCheckScopeIssueType.GlobPatternMatchedNoMarkdown;
}

interface LinkCheckScopeGlobMatchIssue {
  readonly subjectType: LinkCheckScopeIssueSubjectType.GlobMatch;
  readonly base: string;
  readonly pattern: string;
  /** Pattern 匹配得到、但无法进入 Link Check Scope 的绝对路径。 */
  readonly matchedPath: string;
  readonly issueType: LinkCheckScopeIssueType.PathOutsideProjectRoot;
}

type LinkCheckScopeIssue =
  | LinkCheckScopePathIssue
  | LinkCheckScopeGlobPatternIssue
  | LinkCheckScopeGlobMatchIssue;

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
      "subjectType": "glob-pattern",
      "base": "/var/specs",
      "pattern": "drafts/**/*.md",
      "issueType": "glob-pattern-not-matched"
    }
  ]
}
```

## 规则与约束

1. **Link Check Scope** 一经建立便保持不变。
2. 存在 `Path` 或 `GlobMatch` 问题的路径不应出现在 `files` 中。
3. `files` 中的已解析路径必须唯一。
4. 同一文档被多个输入项选中时，以首次出现的位置为准，不在 `files` 中重复记录。
5. `issues` 按 **Link Check Delegation** 的 `files` 输入顺序记录。
6. 同一 glob pattern 产生多个 `GlobMatch` 问题时，按 `matchedPath` 的字典序记录。
