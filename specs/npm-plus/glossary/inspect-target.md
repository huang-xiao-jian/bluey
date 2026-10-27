# InspectTarget

## 参考资料

- [InspectDelegation](./inspect-delegation.md)
- [InspectTargetQuality](./inspect-target-quality.md)

## 定义

`InspectTarget` 是经过解释和存在性确认后，实际接受质量检查的 package 及其精确版本。它源自一项**InspectDelegation**，并消除检查委托中的版本不确定性，使后续收集的**InspectTargetQuality**始终归属于明确目标。

## 关键属性

- **Package 名称：** 标识接受检查的 npm package。
- **精确版本：** 标识实际接受检查的 package 版本。
- **Tag：** 当精确版本通过 tag 确定时，记录所使用的 tag；直接指定精确版本时不存在该属性。

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

1. **组合标识约束：** Package 名称和精确版本共同唯一确定一个检查目标。
2. **非空标识约束：** Package 名称和精确版本不能为空。
3. **来源约束：** 每个本概念实例必须关联一项作为其来源的**InspectDelegation**。
4. **Tag 记录约束：** 通过 tag 确定精确版本时记录该 tag；直接指定精确版本时不记录 tag。
5. **质量归属约束：** 每份**InspectTargetQuality**必须归属于一个本概念实例。

## 目标确定

系统根据一项**InspectDelegation**确定本概念实例：

1. 使用 package 名称从 npm Registry 获取包含 `versions` 和 `dist-tags` 的精简 metadata；仅将 `404` 解释为 `PackageNotFound`，超时、限流或服务故障等访问异常不表示 package 不存在。
2. 解释版本标识：未提供时使用 `latest` tag；能够解析为精确 SemVer 时先规范化，再作为精确版本；其他标识作为 tag。版本范围表达式不属于此流程的输入。
3. 精确版本必须存在于 `versions` 中，否则产生 `ExactVersionNotFound`。
4. Tag 必须存在于 `dist-tags` 中，否则产生 `TagNotFound`；其映射的精确版本还必须存在于 `versions` 中，否则产生 `TagUnresolvable`。
5. 使用 package 名称和最终确定的精确版本实例化本概念；通过 tag 确定版本时同时记录该 tag。
