# InspectTarget

## 前置依赖（可选）

- [InspectDelegation](./inspect-delegation.md)

## 1. 定义

`InspectTarget` 是经过解释和存在性确认后，实际接受质量检查的 package 及其精确版本。它消除检查委托中的版本不确定性，使后续收集的质量数据始终归属于明确目标。

## 2. 关键属性

- **Package 名称：** 标识接受检查的 npm package。
- **精确版本：** 标识实际接受检查的 package 版本。
- **Tag：** 当精确版本通过 tag 确定时，记录所使用的 tag；直接指定精确版本时不存在该属性。

## 3. 规则与约束

1. **组合标识约束：** Package 名称和精确版本共同唯一确定一个检查目标。
2. **非空标识约束：** Package 名称和精确版本不能为空。
3. **有效性约束：** 本概念所指向的 package 及其精确版本必须存在。
4. **条件存在约束：** 通过 tag 确定精确版本时，Tag 必须存在；直接通过精确版本确定目标时，Tag 不存在。
5. **默认版本约束：** **InspectDelegation** 未提供版本标识时，Tag 为 `latest`。
6. **映射约束：** Tag 存在时，它必须能够映射到本概念记录的精确版本。

## 4. 关系

- **关联：** 每个本概念实例关联 `[1]` 项作为其来源的**InspectDelegation**。
- **关联：** 一份 `InspectTargetQuality` 归属于 `[1]` 个本概念实例。
