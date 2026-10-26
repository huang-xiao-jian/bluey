# InspectDelegation

## 参考资料

- [InspectTarget](./inspect-target.md)
- [InspectTargetBuilder](../roles/InspectTargetBuilder.md)
- [InspectTargetQualityReport](./inspect-target-quality-report.md)

## 定义

`InspectDelegation` 是开发者提交的 package 检查委托，用于表达需要检查的 package 以及可选的版本标识。它保留开发者的原始检查意图，作为**InspectTargetBuilder**确定具体**InspectTarget**的依据，并由**InspectTargetQualityReport**回应。

## 关键属性

- **Package 名称：** 标识开发者希望检查的 npm package。
- **版本标识：** 开发者提供的可选版本标识，可以是精确版本号或 tag；未提供时表示使用默认版本。

### 数据模型

```ts
enum InspectVersionIdentifierType {
  ExactVersion = "exact-version",
  Tag = "tag",
}

interface ExactVersionIdentifier {
  type: InspectVersionIdentifierType.ExactVersion;
  value: string;
}

interface TagVersionIdentifier {
  type: InspectVersionIdentifierType.Tag;
  value: string;
}

type InspectVersionIdentifier =
  | ExactVersionIdentifier
  | TagVersionIdentifier;

interface InspectDelegation {
  packageName: string;
  versionIdentifier?: InspectVersionIdentifier;
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
  "versionIdentifier": {
    "type": "exact-version",
    "value": "5.7.3"
  }
}
```

**Tag 版本委托：**

```json
{
  "packageName": "typescript",
  "versionIdentifier": {
    "type": "tag",
    "value": "latest"
  }
}
```

## 规则与约束

1. **非空标识约束：** Package 名称不能为空。
2. **值域约束：** 版本标识只能是精确版本号、tag 或未提供。
3. **单值约束：** 一项检查委托至多提供一个版本标识，不能同时指定精确版本号和 tag。
4. **默认值约束：** 未提供版本标识时，使用 `latest` tag 确定目标版本。
5. **业务边界约束：** 版本范围表达式不属于当前支持的版本标识，使用版本范围表达式的请求不会进入本业务用例。
6. **职责约束：** 本概念只表达开发者的原始意图，不负责判断 package、精确版本或 tag 是否存在。
7. **目标确定约束：** **InspectTargetBuilder**必须依据一项本概念实例确定具体的**InspectTarget**。
8. **报告响应约束：** 每份**InspectTargetQualityReport**必须回应一项本概念实例。
