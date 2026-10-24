# 面向对象设计分析：检查规范文档中的失效链接

## 文档信息

- **用例名称：** 检查规范文档中的失效链接
- **文档版本：** 1.0
- **编写日期：** 2026-10-20

## 参考资料

- [Markdown 链接规范](spec.md)
- [检查规范文档中的失效链接](use-case/check-specification-documents-for-dead-links.md)
- [单文档检查](use-case/workflows/single-document-check-workflow.md)
- [多文档检查](use-case/workflows/multiple-document-check-workflow.md)
- [Link Check Scope Builder](roles/LinkCheckScopeBuilder.md)

## 提取名词

### 候选名词

- **规范文档维护者：** 具有公认的业务含义且可独立存在，但它是一个角色，因此归类为外部参与者。
- **Link Check Delegation：** 具有公认的业务含义、独立存在和自身生命周期，因此是候选类。
- **Link Check Scope：** 具有公认的业务含义、独立存在和自身生命周期，因此是候选类。
- **范围问题：** 具有业务含义，但从属于范围且没有独立生命周期，因此是 `LinkCheckScope` 的组成部分。
- **规范文档集合：** 在一次批量检查中可独立存在并具有生命周期，因此是候选类。
- **规范文档：** 具有公认的业务含义、独立存在和自身生命周期，因此是候选类。
- **Specification Link：** 在源文档内独立存在并具有生命周期，因此是候选类。
- **Resolved Specification Link：** 作为检查结果独立存在并具有生命周期，因此是候选类。
- **有效链接：** 是已解析链接的一种状态，没有独立生命周期，因此是 `ResolvedSpecificationLink` 的变体。
- **失效链接：** 是已解析链接的一种状态，没有独立生命周期，因此是 `ResolvedSpecificationLink` 的变体。
- **失效原因：** 用于限定失效结果，没有独立生命周期，因此是 `ResolvedSpecificationLink` 的组成部分。
- **Link Check Report：** 具有公认的业务含义、独立存在和自身生命周期，因此是候选类。
- **项目根目录：** 定义委托边界，没有独立生命周期，因此是 `LinkCheckDelegation` 和已解析链接位置的值。
- **文档路径：** 用于标识文档，没有独立生命周期，因此是委托、范围、文档或问题中的值。
- **检查模式：** 用于选择遍历策略，没有独立生命周期，因此是 `LinkCheckDelegation` 中的值。
- **原子链接检查任务：** 是工作流输入结构，不是业务类。
- **原子链接检查产物：** 是工作流输出结构；其结果属于检查工作流，不是业务类。
- **待检查集合：** 是临时工作流状态，属于 `SpecificationDocumentRepository` 的内部状态。

### 确认的候选类

1. **LinkCheckDelegation：** 承载维护者的完整意图，并在最终报告中保持可追溯。
2. **LinkCheckScope：** 承载根据委托建立的已接受起始文档和容错路径问题。
3. **SpecificationDocumentRepository：** 在一次批量检查中维护有序的待检查文档和已检查文档。
4. **SpecificationDocument：** 为链接提取和标题派生提供具有稳定项目相对标识的业务对象。
5. **SpecificationLink：** 在验证前保留每个受支持链接的作者原始内容。
6. **ResolvedSpecificationLink：** 保留一个 **Specification Link** 产生的唯一有效或失效结果。
7. **LinkCheckReport：** 记录已完成的委托、其范围和所有失效结果。

## 识别动词

### 提取的动作

- **委托检查：** 保留维护者的检查意图，由 `LinkCheckDelegation` 负责。
- **建立稳定项目边界：** 判断检查能否开始，由 `LinkCheckScopeBuilder` 负责。
- **评估委托文档路径：** 选择有效起始文档并记录问题，由 `LinkCheckScopeBuilder` 负责。
- **维护待检查和已检查文档：** 保持批量检查进度的顺序和唯一性，由 `SpecificationDocumentRepository` 负责。
- **检查有序文档集合：** 协调多文档检查，由 `SpecificationDocumentBatchChecker` 负责。
- **判断文档是否已经处理：** 防止重复与循环工作，由 `SpecificationDocumentBatchChecker` 负责。
- **检查一份文档：** 协调文档内的链接检查，由 `SpecificationDocumentChecker` 负责。
- **提取受支持链接：** 识别可接受验证的作者原始链接，由 `SpecificationLinkExtractor` 负责。
- **派生标题标识：** 建立文档中有效的锚点目标，由 `SpecificationHeadingCataloger` 负责。
- **解析链接目标：** 确定目标文件和锚点，由 `SpecificationLinkChecker` 负责。
- **检查包含关系、存在性和锚点标识：** 判断链接有效或失效，由 `SpecificationLinkChecker` 负责。
- **沿有效 Markdown 引用继续遍历：** 在递归模式下发现其他文档，由 `ReferencedDocumentDiscoverer` 负责。
- **聚合失效结果：** 保留已检查文档的所有失效结果，由 `SpecificationDocumentBatchChecker` 负责。
- **准备报告：** 建立已完成检查的原始结果，由 `LinkCheckReportFabricator` 负责。
- **获取报告：** 接收用例结果，由 `SpecificationDocumentMaintainer` 负责。

### 功能聚类结果

1. **LinkCheckWorkflowScheduler：** 将范围构建、集合检查和报告准备连接为完整用例。
2. **LinkCheckScopeBuilder：** 负责将有效委托转换为范围所需的决策。
3. **SpecificationDocumentBatchChecker：** 协调集合遍历、结果聚合和遍历模式应用。
4. **SpecificationDocumentChecker：** 负责完整的单文档子流程，但不吸收专门的链接和标题职责。
5. **SpecificationLinkExtractor：** 识别三种受支持的链接形式，并保留作者原始内容。
6. **SpecificationHeadingCataloger：** 为锚点检查建立标题标识。
7. **SpecificationLinkChecker：** 对一个链接应用目标解析和验证优先级。
8. **ReferencedDocumentDiscoverer：** 仅对符合条件的有效结果应用递归发现。
9. **LinkCheckReportFabricator：** 在检查完成后建立可追溯的原始报告。

## 分配职责

### 关键动作的职责判断

- **开始检查：** `LinkCheckDelegation` 准确保留维护者委托的根目录、起始路径和遍历模式。
- **协调用例：** `LinkCheckWorkflowScheduler` 连接委托、范围、检查和报告，协调端到端业务工作流。
- **建立范围：** `LinkCheckScopeBuilder` 解释委托并评估路径，生成有序的有效范围和容错问题。
- **维护批量进度：** `SpecificationDocumentRepository` 保存有序的待检查与已检查文档；每个起始或新发现文档只接收一次，并提供下一个未检查文档。
- **处理多份文档：** `SpecificationDocumentBatchChecker` 协调待检查和已检查集合，确保每份文档至多检查一次并聚合结果。
- **处理一份文档：** `SpecificationDocumentChecker` 确保每个受支持链接得到一个结果，并协调链接提取、标题编目和逐链接检查。
- **识别受支持链接：** `SpecificationLinkExtractor` 将作者写下的 Markdown 链接转换为 **Specification Link**，且不改变原始内容。
- **建立有效标题：** `SpecificationHeadingCataloger` 为检查提供文档标题标识目录。
- **分类一个链接：** `SpecificationLinkChecker` 按规定顺序应用包含关系和目标检查，恰好建立一个有效或失效的已解析链接结果。
- **扩展递归检查：** `ReferencedDocumentDiscoverer` 选择尚未在待检查或已检查集合中的新 Markdown 目标。
- **产生用例结果：** `LinkCheckReportFabricator` 合并委托、范围和失效结果，准备原始 `LinkCheckReport`。
- **接收结果：** `SpecificationDocumentMaintainer` 接收完整报告并用于修复工作。

### 额外的协调类

- **LinkCheckWorkflowScheduler：** 实体或子流程级别的类都不应协调完整用例，因此需要该类。
- **SpecificationDocumentBatchChecker：** 需要该类将顺序、去重、遍历策略和聚合职责与单文档子流程分离。
- **SpecificationDocumentChecker：** 需要该类将单文档工作流与集合遍历和单个链接决策分离。

## 处理异常

### 异常场景

- **委托的项目根目录无法建立稳定边界：** 检查无法建立可信路径或继续执行；维护者负责定义预期项目边界，因此这是致命业务异常。
- **委托文档位于项目根目录之外：** 该文档无法安全进入检查；维护者必须修正委托路径，因此这是记录在范围中的容错业务异常。
- **委托文档缺失：** 无法检查该文档；维护者必须恢复或修正文档，因此这是记录在范围中的容错业务异常。
- **委托目标不是 Markdown：** 目标不属于声明的文档类型；维护者决定哪些规范文档应进入范围，因此这是记录在范围中的容错业务异常。
- **链接目标位于项目根目录之外：** 无法在委托边界内验证链接；维护者必须修复引用或边界选择，因此这是失效链接业务结果。
- **链接目标文件缺失：** 无法将链接分类为有效；维护者必须修复引用或恢复目标，因此这是失效链接业务结果。
- **链接锚点未标识标题：** 无法将含锚点链接分类为有效；维护者必须修复锚点或标题，因此这是失效链接业务结果。
- **文档已经检查：** 主流程可以跳过该文档并完成，无需业务决策；这是正常的重复或循环防护，不是异常。
- **不存在受支持链接：** 主流程仍以空结果完成，无需业务处置；这是正常空结果，不是异常。
- **因技术原因无法访问文档：** 这涉及基础设施可用性，而不是链接语义；规范未定义业务解释，因此属于本设计阶段之外的技术异常。

### 异常职责分配

#### 无效项目根目录

- 观察者：`LinkCheckScopeBuilder`
- 决策者：`LinkCheckScopeBuilder`
- 执行者：`LinkCheckWorkflowScheduler`，停止工作流且不准备报告

#### 委托文档路径问题

- 观察者：`LinkCheckScopeBuilder`
- 决策者：`LinkCheckScopeBuilder`
- 执行者：`LinkCheckScopeBuilder`，将问题记录到 `LinkCheckScope` 后继续执行

#### 失效链接目标

- 观察者：`SpecificationLinkChecker`
- 决策者：`SpecificationLinkChecker`
- 执行者：`SpecificationLinkChecker`，建立适用的失效 `ResolvedSpecificationLink` 变体

### 额外的异常处理类

无需增加异常处理类。规范将无效根目录与委托路径的决策分配给范围构建角色，而失效目标决策正是单链接检查的主要职责。创建单独 handler 只会拆分职责，不会增加业务含义。

### 异常流与主流程的关系

- 主流程：`LinkCheckWorkflowScheduler` → `LinkCheckScopeBuilder` → `SpecificationDocumentBatchChecker` → `SpecificationDocumentChecker` → `SpecificationLinkChecker` → `LinkCheckReportFabricator`
- 无效根目录流程：`LinkCheckScopeBuilder` 在集合检查或报告准备前停止 `LinkCheckWorkflowScheduler`。
- 容错路径流程：`LinkCheckScopeBuilder` 将问题记录到 `LinkCheckScope`，再评估下一个委托路径。
- 失效链接流程：`SpecificationLinkChecker` 返回失效的 `ResolvedSpecificationLink`；`SpecificationDocumentBatchChecker` 将其聚合并继续检查。

## 细化边界

### 功能边界分类

- **实体类：** `LinkCheckDelegation` 保留维护者的检查意图。
- **实体类：** `LinkCheckScope` 保留已接受的起始文档和路径问题。
- **实体类：** `SpecificationDocumentRepository` 保留一次批量检查中有序的待检查与已检查文档。
- **实体类：** `SpecificationDocument` 表示一份接受检查的规范文档。
- **实体类：** `SpecificationLink` 保留一个受支持的作者原始链接。
- **实体类：** `ResolvedSpecificationLink` 保留一个不可变的验证结果。
- **实体类：** `LinkCheckReport` 保留一次已完成委托的原始结果。
- **决策类：** `LinkCheckScopeBuilder` 决定哪些委托文档进入范围。
- **决策类：** `SpecificationLinkChecker` 决定一个已解析链接有效还是失效。
- **决策类：** `ReferencedDocumentDiscoverer` 决定哪些有效目标扩展递归检查。
- **执行类：** `SpecificationLinkExtractor` 提取受支持的作者原始链接。
- **执行类：** `SpecificationHeadingCataloger` 为锚点检查建立标题标识。
- **执行类：** `LinkCheckReportFabricator` 准备完整的原始报告。
- **协调类：** `LinkCheckWorkflowScheduler` 协调端到端用例。
- **协调类：** `SpecificationDocumentBatchChecker` 协调有序的集合遍历和聚合。
- **协调类：** `SpecificationDocumentChecker` 协调完整的单文档子流程。

### 边界细化结果

- `LinkCheckScopeBuilder` 保持为独立决策边界，不与 `LinkCheckWorkflowScheduler` 合并，因为范围构建具有自己的业务异常与有序路径评估规则。
- `SpecificationDocumentRepository` 保持为批量检查聚合，不与 `LinkCheckScope` 合并，因为范围是不可变的委托结果，而 repository 是一次检查中的可变工作集。
- `SpecificationDocumentBatchChecker` 与 `SpecificationDocumentChecker` 保持分离，使集合遍历、递归发现和去重不会进入单文档链接分类。
- `SpecificationLinkExtractor`、`SpecificationHeadingCataloger` 和 `SpecificationLinkChecker` 保持为专门类，使语法提取、标题派生和业务验证规则分别变化。
- `LinkCheckReportFabricator` 保持为执行边界，使报告构造不会成为 workflow scheduler 或实体的职责。

## 明确类之间的关系

### 组合

- 一个 `SpecificationDocument` 组合零个或多个 `SpecificationLink` 实例。作者写下的链接属于一个源文档，离开该文档后没有有用的独立标识。

### 聚合

- 一个 `LinkCheckScope` 聚合零个或多个被接受为起始文档的 `SpecificationDocument` 实例。文档脱离该范围后仍具有独立意义。
- 一个 `SpecificationDocumentRepository` 将零个或多个 `SpecificationDocument` 实例聚合为待检查与已检查工作集。repository 管理成员关系，但不拥有文档标识。
- 一个 `LinkCheckReport` 聚合一个 `LinkCheckDelegation`、一个 `LinkCheckScope` 和零个或多个失效 `ResolvedSpecificationLink` 实例。每个对象在构造报告前已存在，并继续作为可追溯结果对象，而不是报告拥有的组成部分。

### 关联

- 每个 `ResolvedSpecificationLink` 都可导航地关联到恰好一个 `SpecificationLink`，从而保留结果背后的作者原始链接。
- 每个 `SpecificationDocumentBatchChecker` 都可导航地关联到一个 `SpecificationDocumentRepository`，后者的可变状态贯穿整次批量检查。

### 依赖

- 外部维护者、协调器、构建器、检查器、发现器、提取器、编目器和构造器，均依赖其在操作期间消费或创建的对象。
- 依赖不代表所有权、持久字段或调用顺序，只表示一个类履行职责时需要另一个类。

## 最终候选类列表

1. **`LinkCheckDelegation`：** 表示维护者在项目边界内检查文档的指令。与 `SpecificationDocumentMaintainer`、`LinkCheckWorkflowScheduler`、`LinkCheckScopeBuilder`、`SpecificationDocumentBatchChecker` 和 `LinkCheckReport` 协作。
2. **`LinkCheckScope`：** 表示已接受的起始文档和容错路径问题。与 `LinkCheckScopeBuilder`、`SpecificationDocumentRepository`、`SpecificationDocumentBatchChecker` 和 `LinkCheckReport` 协作。
3. **`SpecificationDocumentRepository`：** 表示一次批量检查中有序的待检查和已检查文档。与 `LinkCheckScope`、`SpecificationDocument`、`SpecificationDocumentBatchChecker` 和 `ReferencedDocumentDiscoverer` 协作。
4. **`SpecificationDocument`：** 表示一份接受检查的 Markdown 规范文档。与 `SpecificationDocumentRepository`、`SpecificationDocumentChecker`、`SpecificationLinkExtractor` 和 `SpecificationHeadingCataloger` 协作。
5. **`SpecificationLink`：** 与作者所写内容完全一致地表示一个受支持链接。与 `SpecificationLinkExtractor`、`SpecificationLinkChecker` 和 `ResolvedSpecificationLink` 协作。
6. **`ResolvedSpecificationLink`：** 表示一个可追溯的有效或失效链接检查结果。与 `SpecificationLink`、`SpecificationLinkChecker`、`SpecificationDocumentChecker`、`ReferencedDocumentDiscoverer`、`SpecificationDocumentBatchChecker` 和 `LinkCheckReport` 协作。
7. **`LinkCheckReport`：** 表示一次已完成委托的原始结果。与 `LinkCheckDelegation`、`LinkCheckScope`、`ResolvedSpecificationLink`、`LinkCheckReportFabricator` 和 `SpecificationDocumentMaintainer` 协作。
8. **`LinkCheckWorkflowScheduler`：** 协调完整用例。与 `SpecificationDocumentMaintainer`、`LinkCheckDelegation`、`LinkCheckScopeBuilder`、`SpecificationDocumentBatchChecker`、`LinkCheckReportFabricator` 和 `LinkCheckReport` 协作。
9. **`LinkCheckScopeBuilder`：** 建立范围，或因项目根目录无效而停止。与 `LinkCheckDelegation`、`LinkCheckScope` 和 `LinkCheckWorkflowScheduler` 协作。
10. **`SpecificationDocumentBatchChecker`：** 协调有序多文档检查和结果聚合。与 `LinkCheckDelegation`、`LinkCheckScope`、`SpecificationDocumentRepository`、`SpecificationDocumentChecker`、`ReferencedDocumentDiscoverer`、`ResolvedSpecificationLink` 和 `LinkCheckWorkflowScheduler` 协作。
11. **`SpecificationDocumentChecker`：** 协调检查一份文档中的每个受支持链接。与 `SpecificationDocument`、`SpecificationLinkExtractor`、`SpecificationHeadingCataloger`、`SpecificationLinkChecker`、`ResolvedSpecificationLink` 和 `SpecificationDocumentBatchChecker` 协作。
12. **`SpecificationLinkExtractor`：** 在保留作者原始内容的同时识别受支持链接。与 `SpecificationDocument`、`SpecificationLink` 和 `SpecificationDocumentChecker` 协作。
13. **`SpecificationHeadingCataloger`：** 建立锚点检查使用的标题标识。与 `SpecificationDocument`、`SpecificationDocumentChecker` 和 `SpecificationLinkChecker` 协作。
14. **`SpecificationLinkChecker`：** 解析并分类一个 **Specification Link**。与 `SpecificationLink`、`SpecificationHeadingCataloger`、`ResolvedSpecificationLink` 和 `SpecificationDocumentChecker` 协作。
15. **`ReferencedDocumentDiscoverer`：** 选择递归模式下到达且尚未检查的 Markdown 目标。与 `LinkCheckDelegation`、`ResolvedSpecificationLink`、`SpecificationDocumentRepository` 和 `SpecificationDocumentBatchChecker` 协作。
16. **`LinkCheckReportFabricator`：** 准备完整的原始报告。与 `LinkCheckDelegation`、`LinkCheckScope`、`ResolvedSpecificationLink`、`LinkCheckReport` 和 `LinkCheckWorkflowScheduler` 协作。
