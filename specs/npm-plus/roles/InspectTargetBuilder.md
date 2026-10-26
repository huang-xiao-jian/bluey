# InspectTargetBuilder

## 参考资料

- [InspectDelegation](../glossary/inspect-delegation.md)
- [InspectTarget](../glossary/inspect-target.md)

## 定义

**InspectTargetBuilder** 负责解释 **InspectDelegation**，确认 package 及版本事实，并实例化 **InspectTarget**。

## 输入与结果

- **输入：** 已实例化的 **InspectDelegation**。
- **成功结果：** 实例化已确定 package 精确版本的 **InspectTarget**。
- **异常结果：** 抛出能够说明目标无法确定原因的业务异常。

## 异常

- **Package 不存在：** Package 不存在时产生 `PackageNotFound`。
- **精确版本不存在：** Package 存在，但 **InspectDelegation** 明确指定的精确版本不存在时产生 `ExactVersionNotFound`。
- **Tag 不存在：** Package 存在，但 **InspectDelegation** 指定的 tag 或默认的 `latest` tag 不存在时产生 `TagNotFound`。
- **Tag 无法解析：** Package 和 tag 存在，但 tag 无法确定一个存在的精确版本时产生 `TagUnresolvable`。

## InspectTarget 构建算法

1. 根据 **InspectDelegation** 的 package 名称确认 package 存在；如果不存在，则产生 `PackageNotFound`。
2. 解释 **InspectDelegation** 的版本标识：
   1. 如果明确指定精确版本，则直接使用该版本。
   2. 如果指定 tag，则使用该 tag 解析精确版本。
   3. 如果未提供版本标识，则使用 `latest` tag 解析精确版本。
3. 如果用于解析的 tag 不存在，则产生 `TagNotFound`。
4. 如果 tag 存在，但无法解析为一个存在的精确版本，则产生 `TagUnresolvable`。
5. 如果明确指定的精确版本不存在，则产生 `ExactVersionNotFound`。
6. 使用 package 名称和最终确定的精确版本实例化 **InspectTarget**；通过 tag 确定版本时，同时记录该 tag。
