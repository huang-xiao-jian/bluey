# InspectTargetSecurityRawQuality

## 前置依赖（可选）

- [InspectTargetRawQuality](./inspect-target-raw-quality.md)

## 1. 定义

`InspectTargetSecurityRawQuality` 是检查目标在安全性维度上的原始质量事实，用于客观呈现系统能够获得的安全性信息。

## 2. 关键属性

- **质量维度：** 固定为安全性。本概念不增加**InspectTargetRawQuality**之外的关键属性。

## 3. 规则与约束

1. **值域约束：** 质量维度只能取安全性。
2. **继承约束：** 本概念必须遵守**InspectTargetRawQuality**的全部规则与约束。

## 4. 关系

- **泛化：** 本概念是**InspectTargetRawQuality**在安全性维度上的特化。
