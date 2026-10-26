# InspectTargetQualityReport

## 前置依赖（可选）

- [InspectDelegation](./inspect-delegation.md)
- [InspectTarget](./inspect-target.md)
- [InspectTargetBuilder](../roles/InspectTargetBuilder.md)
- [InspectTargetQuality](./inspect-target-quality.md)

## 1. 定义

`InspectTargetQualityReport` 是系统响应一项检查委托而生成的最终业务报告。目标确定成功时，它呈现具体检查目标及其可获得的原始质量数据；目标无法确定时，它呈现对应的不存在或无法解析事实，使开发者始终能够获得客观结果。

## 2. 关键属性

- **检查委托：** 本报告所回应的**InspectDelegation**。
- **检查目标：** 目标确定成功时记录的**InspectTarget**。
- **目标质量：** 目标确定成功时记录的**InspectTargetQuality**。
- **目标确定失败事实：** 目标确定失败时记录的 package 不存在、精确版本不存在、tag 不存在或 tag 无法解析事实。

## 3. 规则与约束

1. **业务结果约束：** 对于已经进入本业务用例的检查委托，无论目标确定成功还是发生预期的目标确定业务异常，系统都必须生成本报告。
2. **结果互斥约束：** 一份报告要么记录检查目标及其目标质量，要么记录一个目标确定失败事实，不能同时记录两类结果。
3. **成功报告约束：** Package 和精确版本存在时，报告必须标明检查目标，并呈现系统能够获得的规定质量维度数据。
4. **Tag 标识约束：** 通过指定 tag 或默认的 `latest` tag 确定目标时，报告必须标明该 tag 及其对应的精确版本。
5. **Package 不存在约束：** Package 不存在时，报告只记录 package 不存在事实，不提供检查目标或质量维度数据。
6. **精确版本不存在约束：** Package 存在但指定的精确版本不存在时，报告只记录精确版本不存在事实，不提供 package 层面信息、检查目标或质量维度数据。
7. **Tag 失败约束：** Package 存在但 tag 不存在或无法解析时，报告只记录对应的 tag 失败事实，不提供 package 层面信息、检查目标或质量维度数据。
8. **客观性约束：** 报告不得包含评分、评级、价值判断、采用建议或其他评价性结论。
9. **责任边界约束：** 开发者负责依据报告评价 package 并决定是否采用；AI 如何使用报告、package 横向比较和替代 package 推荐不属于本报告范围。

## 4. 关系

- **关联：** 每份本概念实例回应 `[1]` 项**InspectDelegation**。
- **依赖：** 报告结果依赖**InspectTargetBuilder**的目标确定结果。
- **聚合：** 本概念聚合 `[0,1]` 个**InspectTarget**及 `[0,1]` 个对应的**InspectTargetQuality**；目标确定成功时两者的基数均为 `[1]`，目标确定失败时均为 `[0]`。
