# InspectTargetBuilder

## 前置依赖（可选）

- [InspectDelegation](./inspect-delegation.md)
- [InspectTarget](./inspect-target.md)

## 1. 定义

`InspectTargetBuilder` 是负责解释检查委托并确定具体检查目标的业务服务。它统一执行默认版本选择、tag 解析和存在性确认，使质量检查只针对真实存在的 package 精确版本进行。

## 2. 关键属性

- **检查委托：** 需要解释的**InspectDelegation**。
- **目标确定结果：** 成功时为一个**InspectTarget**，失败时为能够说明失败原因的业务异常。

## 3. 规则与约束

1. **版本解释约束：** 精确版本号直接用于确定目标；tag 必须先解析为精确版本；未提供版本标识时必须使用 `latest` tag。
2. **业务前置条件：** 创建**InspectTarget**前，必须确认 package 和最终确定的精确版本存在。
3. **Package 不存在异常：** Package 不存在时，目标确定必须以 `PackageNotFound` 结束。
4. **精确版本不存在异常：** Package 存在但明确指定的精确版本不存在时，目标确定必须以 `ExactVersionNotFound` 结束。
5. **Tag 不存在异常：** Package 存在但指定或默认使用的 tag 不存在时，目标确定必须以 `TagNotFound` 结束。
6. **Tag 无法解析异常：** Package 存在且 tag 可识别，但无法据此确定一个存在的精确版本时，目标确定必须以 `TagUnresolvable` 结束。
7. **结果互斥约束：** 一次目标确定要么产生一个**InspectTarget**，要么产生一个业务异常，不能同时产生两者。
8. **异常边界约束：** 上述业务异常是可预期的目标确定结果，必须转换为报告事实，不能导致本业务用例不返回报告。

## 4. 关系

- **依赖：** 本概念依赖一项**InspectDelegation**执行目标确定。
- **依赖（`«create»`）：** 本概念在目标确定成功时创建**InspectTarget**。
