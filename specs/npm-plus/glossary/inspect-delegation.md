# InspectDelegation

## 参考资料

- [InspectTarget](./inspect-target.md)

## 定义

`InspectDelegation` 是开发者提交的 `package` 检查委托，用于描述请求检查的 `package` 以及可选的版本标识，并保留开发者的原始检查意图。

## 关键属性

- **Package 名称：** 标识开发者希望检查的 `npm package`。
- **版本标识：** 开发者提供的可选版本标识；系统内部判断它表示精确版本号还是 `tag`，未提供时表示使用默认版本。

### 数据模型

```ts
interface InspectDelegation {
  packageName: string;
  versionIdentifier?: string;
}
```

### 数据模型案例

**默认版本委托：**

```json
{
  "packageName": "typescript"
}
```

**精确版本委托：**

```json
{
  "packageName": "typescript",
  "versionIdentifier": "5.7.3"
}
```

**Tag 版本委托：**

```json
{
  "packageName": "typescript",
  "versionIdentifier": "latest"
}
```

## 规则与约束

1. **非空标识约束：** `Package` 名称不能为空。
2. **值域约束：** 版本标识必须是精确版本号、tag 或未提供。
3. **类型判断约束：** 系统内部负责判断版本标识属于精确版本号还是 `tag`，开发者无需指定类型。
4. **默认值约束：** 未提供版本标识时，使用 `latest tag` 确定目标版本。
5. **业务边界约束：** 版本范围表达式不属于当前支持的版本标识，使用版本范围表达式的请求不会进入本业务用例。
6. **职责约束：** 本概念只表达开发者的原始意图，不负责判断 `package`、精确版本或 `tag` 是否存在。
7. **目标确定约束：** 系统必须依据此概念实例确定具体的**InspectTarget**。
