# InspectTarget

## 参考资料

- [InspectDelegation](./inspect-delegation.md)
- [InspectTargetQuality](./inspect-target-quality.md)

## 定义

`InspectTarget` 是通过官方 npm Registry 的 `latest` tag 确定后，实际接受质量检查的 package 及其精确版本。源自 **InspectDelegation**，使后续收集的 **InspectTargetQuality** 始终归属于明确目标。

## 关键属性

- **Package 名称：** 标识接受检查的 `npm package`。
- **精确版本：** 标识实际接受检查的 `npm package version`。
- **Tag：** 固定记录用于确定精确版本的 `latest` tag。

### 数据模型

```ts
interface InspectTarget {
  packageName: string;
  exactVersion: string;
  tag: "latest";
}
```

### 数据模型案例

```json
{
  "packageName": "typescript",
  "exactVersion": "5.7.3",
  "tag": "latest"
}
```

## 规则与约束

1. **组合标识约束：** `Package` 名称和精确版本共同唯一确定一个检查目标。
2. **非空标识约束：** `Package` 名称和精确版本不能为空。
3. **Tag 记录约束：** 每个检查目标都记录 `latest` tag。

## 业务异常

转换 **InspectDelegation** 过程中，可能抛出以下业务异常：

- `PackageNotFound`：`package` 不存在。
