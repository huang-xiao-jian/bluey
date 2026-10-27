# InspectTargetBuilder

## 参考资料

- [InspectDelegation](../glossary/inspect-delegation.md)
- [InspectTarget](../glossary/inspect-target.md)

## 定义

**InspectTargetBuilder** 负责解释 **InspectDelegation**，判断版本标识属于精确版本还是 `tag`，确认 `package` 及版本事实，并实例化 **InspectTarget**。

## 输入与结果

- **输入：** 已实例化的 **InspectDelegation**。
- **成功结果：** 实例化已确定 `package` 精确版本的 **InspectTarget**。
- **异常结果：** 抛出能够说明目标无法确定原因的业务异常。

## 异常

- **Package 不存在：** Package 不存在时产生 `PackageNotFound`。
- **精确版本不存在：** Package 存在，但 **InspectDelegation** 的版本标识被判断为精确版本，且该版本不存在时产生 `ExactVersionNotFound`。
- **Tag 不存在：** Package 存在，但 **InspectDelegation** 的版本标识被判断为 `tag`，且该 `tag` 不存在时产生 `TagNotFound`；默认的 `latest` tag 不存在时也产生此异常。
- **Tag 无法解析：** Package 和 tag 存在，但 tag 无法确定一个存在的精确版本时产生 `TagUnresolvable`。

## InspectTarget 构建算法

1. 使用 **InspectDelegation** 的 `package` 名称从 npm Registry 获取精简 package metadata，其中必须包含 `versions` 和 `dist-tags`。
2. 如果 npm Registry 返回 `404`，则产生 `PackageNotFound`；超时、限流或服务故障等访问异常不得解释为 `package` 不存在。
3. 解释 **InspectDelegation** 的版本标识：
   1. 如果未提供版本标识，则将 `latest` 作为待解析的 `tag`。
   2. 如果版本标识能够解析为精确 SemVer，则将其规范化后作为待确认的精确版本。
   3. 其他版本标识作为待解析的 `tag`；版本范围表达式不属于本算法的输入。
4. 对于精确版本，在 metadata 的 `versions` 中确认规范化后的版本：
   1. 如果存在，则将其确定为目标精确版本。
   2. 如果不存在，则产生 `ExactVersionNotFound`。
5. 对于 `tag`，在 metadata 的 `dist-tags` 中解析其映射：
   1. 如果 `tag` 不存在，则产生 `TagNotFound`。
   2. 如果 `tag` 存在，则取得其映射的精确版本。
6. 在 metadata 的 `versions` 中确认 `tag` 映射的精确版本；如果不存在，则产生 `TagUnresolvable`。
7. 使用 `package` 名称和最终确定的精确版本实例化 **InspectTarget**；通过 `tag` 确定版本时，同时记录该 `tag`。
