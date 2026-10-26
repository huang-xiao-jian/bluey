# InspectTargetDocumentationRawQuality

## 前置依赖（可选）

- [InspectTargetRawQuality](./inspect-target-raw-quality.md)

## 1. 定义

`InspectTargetDocumentationRawQuality` 是检查目标在文档质量维度上的原始质量事实，用于客观呈现系统能够获得的文档状况信息。

## 2. 关键属性

- **质量维度：** 固定为文档质量。本概念不增加**InspectTargetRawQuality**之外的关键属性。

## 3. 规则与约束

1. **值域约束：** 质量维度只能取文档质量。
2. **继承约束：** 本概念必须遵守**InspectTargetRawQuality**的全部规则与约束。

## 4. 关系

- **泛化：** 本概念是**InspectTargetRawQuality**在文档质量维度上的特化。
