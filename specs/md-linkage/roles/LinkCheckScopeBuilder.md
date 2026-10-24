# Link Check Scope Builder

## 参考资料

- [Link Check Delegation](../glossary/LinkCheckDelegation.md)；
- [Link Check Scope](../glossary/LinkCheckScope.md)

## 定义

**Link Check Scope Builder** 负责解析 `Link Check Delegation` 并实例化 `Link Check Scope`。

## 输入与结果

- **输入：** 已实例化的 **Link Check Delegation**。
- **成功结果：** 实例化 **Link Check Scope**，可以不包含文件，也可以包含文档路径问题。
- **异常结果：** 致命异常导致无法建立范围。

## 异常

构建器通过 repository 边界获取项目与文档事实，不重复执行 **Link Check Delegation** 的数据校验。

### 致命异常

- **无效项目根目录：** 无法将委托的根目录解析为稳定的项目边界。

### 容错异常

- **文档位于项目根目录之外：** 委托路径解析到项目边界之外，并产生 `DocumentOutsideProjectRoot` 问题。
- **未找到文档：** 委托路径未标识现有文档，并产生 `DocumentNotFound` 问题。
- **文档不是 Markdown：** 委托路径标识的现有目标不是 Markdown 文档，并产生 `DocumentNotMarkdown` 问题。

构建器记录相应问题，并按提供顺序继续评估其余委托路径。

## 范围构建算法

1. 根据委托的项目根目录建立稳定的项目边界；如果失败，则产生**无效项目根目录**异常。
2. 从空文件集合与空问题集合开始。
3. 按提供顺序独立评估每个委托文档路径：
   1. 从项目根目录解析相对路径；保留绝对路径以评估包含关系。
   2. 如果解析后的路径位于项目边界之外，添加 `DocumentOutsideProjectRoot` 问题并继续处理下一个路径。
   3. 如果解析后的路径未标识现有文档，添加 `DocumentNotFound` 问题并继续处理下一个路径。
   4. 如果解析后的目标不是 Markdown 文档，添加 `DocumentNotMarkdown` 问题并继续处理下一个路径。
   5. 派生文档的项目相对标识；若文件集合中尚无该标识，则将其加入集合。
4. 使用收集到的文件和问题建立 **Link Check Scope**，即使文件集合为空也同样建立。
