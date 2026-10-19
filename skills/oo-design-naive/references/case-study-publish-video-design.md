# 面向对象设计分析：发布短视频

> 本文档基于"发布短视频"用例规约（references/case-study-publish-video-spec.md），
> 按照面向对象设计流程五步法（references/design-process-steps.md）进行完整的设计分析，
> 作为方法论落地的参考示例。

---

## 步骤一：名词提取 —— 识别业务实体

从用例规约中提取名词候选，对每个名词回答三个问题：

| 名词候选   |  业务语义认可  |     独立出现     |   生命周期   | 结论                     |
| ---------- | :------------: | :--------------: | :----------: | ------------------------ |
| 内容创作者 |       是       |        是        |  否（角色）  | 业务角色，非独立类       |
| 发布申请单 |       是       |        是        |      是      | **候选类**               |
| 视频文件   | 否（技术实现） |        —         |      —       | 技术 artifact，非类      |
| 内容校验   |       是       |    否（动作）    |      —       | 业务动作，非类           |
| 审核       |       是       |    否（动作）    |      —       | 业务动作，非类           |
| 反馈意见   |       是       | 否（依赖申请单） |      否      | 与申请单强关联，非独立类 |
| 短视频     |       是       |        是        |      是      | **候选类**               |
| 可分发状态 |       是       |        是        | 否（状态值） | 状态概念，非独立类       |

**候选类列表**：

1. **VideoPublishApplication**（发布申请单）— 承载一次发布申请的完整生命周期
2. **VideoContent**（短视频内容）— 代表被发布的视频内容实体
3. **ReviewFeedback**（审核反馈）— 记录审核反馈意见

---

## 步骤二：动词识别 —— 识别业务职能

从用例规约的事件流中提取动词，按业务职能聚类：

| 动词              | 业务职能     | 候选类                          |
| ----------------- | ------------ | ------------------------------- |
| 执行校验          | 内容合规判定 | VideoContentValidator           |
| 执行审核          | 内容审核判定 | ContentReviewer                 |
| 记录反馈意见      | 反馈管理     | ReviewFeedback（实体）          |
| 通知创作者        | 通知发送     | PublishNotificationDrafter      |
| 更新视频/修订信息 | 内容更新     | VideoContent（实体）            |
| 置为可分发状态    | 状态变更     | VideoPublishApplication（实体） |
| 终止发布申请流程  | 流程终止     | VideoPublishApplicationManager  |
| 创建发布申请单    | 申请单创建   | VideoPublishApplicationManager  |

**候选类列表（新增）**：

1. **VideoContentValidator** — 负责视频内容合规校验
2. **ContentReviewer** — 负责内容审核判定
3. **PublishNotificationDrafter** — 负责撰写并发送反馈通知
4. **VideoPublishApplicationManager** — 负责发布申请单生命周期管理

---

## 步骤三：责任分配 —— 串联业务流程

### "系统创建发布申请单，并执行校验与审核"

| 追问                       | 负责类                         | 职责             |
| -------------------------- | ------------------------------ | ---------------- |
| 谁负责创建申请单？         | VideoPublishApplicationManager | 创建并发布申请单 |
| 谁负责触发校验？           | VideoPublishWorkflowScheduler  | 编排校验流程     |
| 谁负责执行校验？           | VideoContentValidator          | 执行内容合规校验 |
| 谁负责审核？               | ContentReviewer                | 执行内容审核     |
| 谁负责置视频为可分发状态？ | VideoPublishApplicationManager | 变更申请单状态   |

### "系统将反馈意见记录到当前发布申请单，并通知创作者"

| 追问                 | 负责类                         | 职责               |
| -------------------- | ------------------------------ | ------------------ |
| 谁负责记录反馈？     | VideoPublishApplicationManager | 将反馈关联到申请单 |
| 谁负责撰写通知内容？ | PublishNotificationDrafter     | 撰写反馈通知内容   |
| 谁负责发送通知？     | PublishNotificationDrafter     | 发送通知给创作者   |

### 新增协调类

- **VideoPublishWorkflowScheduler**：负责整体发布流程编排，协调校验、审核、状态变更等步骤

---

## 步骤四：异常处理 —— 提升健壮性

### 异常场景识别

| 异常场景        |             可删除性测试             |     业务人员卷入测试     | 结论                     |
| --------------- | :----------------------------------: | :----------------------: | ------------------------ |
| 校验/审核未通过 | 删掉后主流程无法继续（无法进入分发） | 需要业务人员理解审核规则 | **业务异常**             |
| 创作者放弃更新  |        删掉后流程无法正确终止        | 需要业务人员定义撤销规则 | **业务异常**             |
| 超时未更新      |         删掉后申请单永远挂起         | 需要业务人员定义超时策略 | **业务异常**             |
| 网络中断        |                  —                   |            —             | 技术异常，不在本阶段范围 |
| 数据库连接失败  |                  —                   |            —             | 技术异常，不在本阶段范围 |

### 异常职责分配

**异常1：校验/审核未通过**

- 发现者：VideoContentValidator / ContentReviewer
- 决策者：VideoPublishApplicationManager
- 执行者：PublishNotificationDrafter（发送反馈通知）

**异常2：创作者放弃更新**

- 发现者：创作者（外部参与者）
- 决策者：VideoPublishApplicationManager
- 执行者：VideoPublishCancellationHandler（执行终止流程）

**异常3：超时未更新**

- 发现者：VideoPublishTimeoutInspector
- 决策者：VideoPublishApplicationManager
- 执行者：VideoPublishTimeoutHandler（执行自动关闭）

### 新增异常处理类

- **VideoPublishCancellationHandler**：负责处理创作者主动撤销发布申请
- **VideoPublishTimeoutInspector**：负责检测创作者是否超时未更新内容
- **VideoPublishTimeoutHandler**：负责执行超时自动关闭流程

### 异常流与主流程关联

- 主流程：VideoPublishApplicationManager → VideoContentValidator → ContentReviewer → VideoPublishApplicationManager（状态变更）
- 异常流1：VideoContentValidator/ContentReviewer →（校验/审核未通过）→ PublishNotificationDrafter → 返回校验
- 异常流2：创作者 →（主动撤销）→ VideoPublishCancellationHandler → VideoPublishApplicationManager
- 异常流3：VideoPublishTimeoutInspector →（超时未更新）→ VideoPublishTimeoutHandler → VideoPublishApplicationManager

---

## 步骤五：边界优化 —— 避免职能混叠

### 职能边界优化

| 类别   | 类                              | 职责定位             |
| ------ | ------------------------------- | -------------------- |
| 决策类 | VideoContentValidator           | 判断视频内容是否合规 |
| 决策类 | ContentReviewer                 | 判断内容是否通过审核 |
| 决策类 | VideoPublishTimeoutInspector    | 判断是否触发超时     |
| 执行类 | PublishNotificationDrafter      | 撰写并发送反馈通知   |
| 执行类 | VideoPublishApplicationManager  | 管理申请单状态变更   |
| 执行类 | VideoPublishCancellationHandler | 执行撤销流程         |
| 执行类 | VideoPublishTimeoutHandler      | 执行超时关闭流程     |
| 协调类 | VideoPublishWorkflowScheduler   | 编排整体发布流程     |

### 层级边界优化

**用例层级**（定义整体流程，不负责节点内部实现）：

- VideoPublishWorkflowScheduler — 编排发布流程
- VideoContentValidator — 内容校验（黑盒）
- ContentReviewer — 内容审核（黑盒）
- VideoPublishApplicationManager — 申请单管理（黑盒）

**子流程层级**（负责具体实现）：

- VideoPublishTimeoutInspector — 超时检查细化实现
- PublishNotificationDrafter — 通知内容撰写细化实现

### 最终候选类清单

| 序号 | 类名                            | 职责                                           | 协作类                                                                                             |
| ---- | ------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| 1    | VideoPublishApplication         | 承载一次发布申请的完整生命周期，管理申请单状态 | VideoContent, ReviewFeedback, VideoPublishApplicationManager                                       |
| 2    | VideoContent                    | 代表被发布的视频内容实体                       | VideoPublishApplication                                                                            |
| 3    | ReviewFeedback                  | 记录审核反馈意见                               | VideoPublishApplication                                                                            |
| 4    | VideoContentValidator           | 判断视频内容是否符合发布规则                   | VideoPublishWorkflowScheduler                                                                      |
| 5    | ContentReviewer                 | 判断内容是否通过审核                           | VideoPublishWorkflowScheduler                                                                      |
| 6    | PublishNotificationDrafter      | 撰写并发送反馈通知给创作者                     | VideoPublishApplicationManager                                                                     |
| 7    | VideoPublishApplicationManager  | 管理发布申请单的生命周期（创建、更新、终止）   | VideoPublishWorkflowScheduler, VideoPublishCancellationHandler, VideoPublishTimeoutHandler         |
| 8    | VideoPublishWorkflowScheduler   | 编排短视频发布的整体流程                       | VideoContentValidator, ContentReviewer, PublishNotificationDrafter, VideoPublishApplicationManager |
| 9    | VideoPublishCancellationHandler | 处理创作者主动撤销发布申请                     | VideoPublishApplicationManager                                                                     |
| 10   | VideoPublishTimeoutInspector    | 检测创作者是否超时未更新内容                   | VideoPublishApplicationManager                                                                     |
| 11   | VideoPublishTimeoutHandler      | 执行超时自动关闭流程                           | VideoPublishApplicationManager                                                                     |
