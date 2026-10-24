# Link Check Scope Builder

## 参考资料

- [Link Check Delegation](../glossary/LinkCheckDelegation.md)；
- [Link Check Scope](../glossary/LinkCheckScope.md)

## 定义

**Link Check Scope Builder** 负责解析 **Link Check Delegation** 并实例化 **Link Check Scope**。

## 输入与结果

- **输入：** 已实例化的 **Link Check Delegation**。
- **成功结果：** 实例化 **Link Check Scope**，可以不包含文件，也可以包含 `LinkCheckScopeIssue`。
- **异常结果：** 致命异常导致无法建立 **Link Check Scope**。

## 异常

**Link Check Scope Builder** 通过 repository 边界获取项目与文档事实，不重复执行 **Link Check Delegation** 的数据校验。

### 致命异常

- **无效项目根目录：** 无法将 **Link Check Delegation** 的 `root` 解析为稳定的项目边界。
- **无效输入基准目录：** 无法将 **Link Check Delegation** 的 `base` 解析为稳定目录。

### 容错异常

- **路径位于项目根目录之外：** 具体路径位于项目边界之外，并产生 `PathOutsideProjectRoot` 的 `Path` 问题。
- **未找到目标：** 具体路径输入未标识现有文件或目录，并产生 `PathNotFound` 的 `Path` 问题。
- **文件不是 Markdown：** 具体路径输入标识的现有文件不是 `Markdown` 文档，并产生 `FileNotMarkdown` 的 `Path` 问题。
- **目录不包含 Markdown：** 具体路径输入标识的目录递归展开后没有得到 `Markdown` 文档，并产生 `DirectoryContainsNoMarkdown` 问题。
- **Glob pattern 无效：** pattern 语法无效或使用绝对形式，并产生 `GlobPatternInvalid` 的 `GlobPattern` 问题。
- **Glob pattern 未匹配：** pattern 没有匹配任何文件系统目标，并产生 `GlobPatternNotMatched` 的 `GlobPattern` 问题。
- **Glob pattern 未匹配 Markdown：** pattern 有匹配结果，但没有匹配到 `Markdown` 文件，并产生 `GlobPatternMatchedNoMarkdown` 的 `GlobPattern` 问题。
- **Glob 匹配位于项目根目录之外：** pattern 匹配得到的 `Markdown` 文件位于项目边界之外，并产生 `PathOutsideProjectRoot` 的 `GlobMatch` 问题。

**Link Check Scope Builder** 记录相应 `LinkCheckScopeIssue`，并按提供顺序继续评估 **Link Check Delegation** 的其余 `files` 输入。

## Link Check Scope 构建算法

1. 根据 **Link Check Delegation** 的 `root` 建立稳定的项目边界；如果失败，则产生**无效项目根目录**异常。
2. 根据 **Link Check Delegation** 的 `base` 建立稳定的输入基准目录；如果失败，则产生**无效输入基准目录**异常。
3. 从空文件集合与空问题集合开始。
4. 按提供顺序独立评估 **Link Check Delegation** 的每个 `files` 输入项：
   1. 如果输入包含 glob 语法，则按 glob pattern 评估：
      1. 如果 pattern 使用绝对形式或语法无效，添加 `GlobPatternInvalid` 的 `GlobPattern` 问题并继续处理下一个输入项。
      2. 以 `base` 为基准匹配 pattern，并按绝对路径的字典序排列全部匹配结果。
      3. 如果没有匹配结果，添加 `GlobPatternNotMatched` 的 `GlobPattern` 问题并继续处理下一个输入项。
      4. 从匹配结果中选择 `Markdown` 文件作为候选；如果没有候选，添加 `GlobPatternMatchedNoMarkdown` 的 `GlobPattern` 问题并继续处理下一个输入项。
   2. 如果输入不包含 glob 语法，则按具体路径评估：
      1. 以 `base` 为参照系解析相对输入；保留绝对输入自身的参照系。
      2. 如果路径位于项目边界之外，添加 `PathOutsideProjectRoot` 的 `Path` 问题并继续处理下一个输入项。
      3. 如果路径不存在，添加 `PathNotFound` 的 `Path` 问题并继续处理下一个输入项。
      4. 如果路径标识文件，将该文件作为候选；若文件不是 `Markdown` 文档，则改为添加 `FileNotMarkdown` 的 `Path` 问题。
      5. 如果路径标识目录，递归收集其中的 `Markdown` 文件，并按绝对路径的字典序排列候选；如果候选为空，则添加 `DirectoryContainsNoMarkdown` 的 `Path` 问题。
   3. 依次评估每个候选：
      1. 如果候选位于项目边界之外，具体路径输入产生 `PathOutsideProjectRoot` 的 `Path` 问题，glob pattern 输入产生 `PathOutsideProjectRoot` 的 `GlobMatch` 问题。
      2. 如果候选位于项目边界内，派生文档的项目相对标识，并在文件集合尚无该标识时将其加入集合。
5. 使用收集到的文件和问题建立 **Link Check Scope**，即使文件集合为空也同样建立。
