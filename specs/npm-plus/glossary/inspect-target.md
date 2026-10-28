# InspectTarget

## 参考资料

- [InspectDelegation](./inspect-delegation.md)
- [InspectTargetQuality](./inspect-target-quality.md)

## 定义

`InspectTarget` 是经过解释和存在性确认后，实际接受质量检查的 package 及其精确版本。源自 **InspectDelegation**，并消除检查委托中的版本不确定性，使后续收集的**InspectTargetQuality**始终归属于明确目标。

## 关键属性

- **Package 名称：** 标识接受检查的 `npm package`。
- **精确版本：** 标识实际接受检查的 `npm package version`。
- **Tag：** 如果精确版本通过 `tag` 确定时，记录所使用的 `tag`，否则忽略。

### 数据模型

```ts
interface InspectTarget {
  packageName: string;
  exactVersion: string;
  tag?: string;
}
```

### 数据模型案例

**直接指定精确版本的检查目标：**

```json
{
  "packageName": "typescript",
  "exactVersion": "5.7.3"
}
```

**通过 tag 确定精确版本的检查目标：**

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
3. **Tag 记录约束：** 如果精确版本通过 `tag` 确定时，记录所使用的 `tag`，否则忽略。

## 业务异常

转换 **InspectDelegation** 过程中，可能抛出以下业务异常：

- `PackageNotFound`：`package` 不存在。
- `ExactVersionNotFound`：精确版本不存在。
- `TagNotFound`：`tag` 不存在。
- `TagUnresolvable`：`tag` 无法确定为存在的精确版本。
