---
name: oo-design-naive
metadata:
  version: "0.1.0"
description: 执行从用例规约到设计文档产出的面向对象设计流程。当要求进行面向对象设计时使用
---

# oo-design-naive

## When to Use

当用户提出"面向对象分析"或"面向对象设计"相关请求时触发。

## 关键原则

1. **从用例规约出发**：面向对象设计必须以结构化的用例规约为输入起点，禁止凭空猜测业务需求。
2. **业务语义优先**：所有设计产出（类名、职责、协作关系）必须以业务语义为核心，禁止技术实现细节泄露到设计层。
3. **产出物分离**：设计文档（最终交付物）和思考过程文档（分析链路记录）必须独立生成、独立交付。

## 参考资源

- [用例规约案例](./references/case-study-publish-video-spec.md)
- [面向对象设计命名规范](references/naming-conventions.md)

## 设计流程

遵循 [详细设计流程](references/design-process-steps.md) 指导进行面向对象设计。

## 交付产物

交付产物拆分为两部分，必须独立生成、独立交付。

### 设计文档（必选）

作为最终交付物，仅呈现最终设计成果，不包含任何分析推导过程。包含：

1. **候选类说明**：每个候选类包含 `Class Name`、`Responsibility`、`Collaborators`
2. **候选类可视化**：使用 `mermaid` 绘制类图，体现用例层级与子流程层级关系

强制约束：

- 类图中的外部参与者必须明确标记
- 类图中不允许出现属性、方法、接口、数据库表、控制器、服务层、消息队列等实现细节

参考资源：

- [设计文档模板](references/design-document-template.md)

### 思考过程文档（可选）

完整记录从用例规约到候选类的分析链路。

参考资源：

- [思考过程文档模板](references/thinking-process-template.md)
- [思考过程文档案例-发布短视频](references/case-study-publish-video-design.md)
