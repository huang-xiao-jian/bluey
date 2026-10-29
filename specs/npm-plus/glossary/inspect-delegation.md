# InspectDelegation

## 相关文档

- [InspectTarget](./inspect-target.md)

## 定义

`InspectDelegation` 是开发者提交的 `package` 检查委托，用于描述请求检查其最新发布版本的 `package`。

## 关键属性

- **Package 名称：** 标识开发者希望检查的 `npm package`。

### 数据模型

```ts
interface InspectDelegation {
  packageName: string;
}
```

### 数据模型案例

```json
{
  "packageName": "typescript"
}
```

## 规则与约束

1. **非空标识约束：** `Package` 名称不能为空。
2. **版本约束：** 系统始终使用官方 npm Registry 的 `latest` tag 确定目标版本，不接受调用方提供版本标识。
3. **职责约束：** 本概念只表达开发者的原始意图，不负责判断 `package` 是否存在。
4. **目标确定约束：** 系统必须依据此概念实例确定具体的 **InspectTarget**。
