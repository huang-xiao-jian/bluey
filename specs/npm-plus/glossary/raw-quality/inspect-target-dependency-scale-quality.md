# InspectTargetDependencyScaleQuality

## 1. 定义

`InspectTargetDependencyScaleQuality` 是检查目标在依赖规模维度上的原始质量事实。它用于客观呈现检查目标的直接依赖声明及其数量，不分析间接依赖，也不判断依赖规模是否合理。

## 2. 关键属性

- **直接依赖声明：** 检查目标直接声明的 package、依赖类型和版本范围。
- **运行时依赖数量：** `dependencies` 中未同时声明为可选依赖的 package 数量。
- **可选依赖数量：** `optionalDependencies` 中声明的 package 数量。
- **对等依赖数量：** `peerDependencies` 中声明的 package 数量。
- **捆绑依赖数量：** `bundledDependencies` 或 `bundleDependencies` 中声明的 package 数量；该数量是运行时依赖或可选依赖的子集，不作为独立依赖重复计数。

### 数据模型

```ts
enum DirectDependencyKind {
  Runtime = "runtime",
  Optional = "optional",
  Peer = "peer",
}

interface DirectDependencyDeclarationFact {
  packageName: string;
  kind: DirectDependencyKind;
  declaredRange: string;
  bundled: boolean;
  peerOptional?: boolean;
}

interface DirectDependencyCountFact {
  runtimeCount: number;
  optionalCount: number;
  peerCount: number;
  bundledCount: number;
}

interface InspectTargetDependencyScaleQuality {
  directDependencyDeclarations: DirectDependencyDeclarationFact[];
  directDependencyCounts: DirectDependencyCountFact;
}
```

### 数据模型案例

```json
{
  "directDependencyDeclarations": [
    {
      "packageName": "runtime-helper",
      "kind": "runtime",
      "declaredRange": "^4.1.0",
      "bundled": false
    },
    {
      "packageName": "platform-adapter",
      "kind": "optional",
      "declaredRange": "^2.0.0",
      "bundled": true
    },
    {
      "packageName": "host-framework",
      "kind": "peer",
      "declaredRange": ">=3 <5",
      "bundled": false,
      "peerOptional": true
    }
  ],
  "directDependencyCounts": {
    "runtimeCount": 1,
    "optionalCount": 1,
    "peerCount": 1,
    "bundledCount": 1
  }
}
```

## 3. 规则与约束

1. **数据来源约束：** 直接依赖声明及其数量必须依据检查目标精确版本发布内容中的记录。
2. **直接依赖约束：** 本概念只统计检查目标直接声明的依赖，不解析或统计任何间接依赖。
3. **声明完整性约束：** 每项直接依赖声明必须包含 `package` 名称、依赖类型和原始版本范围。
4. **运行时依赖去重约束：** 同时出现在 `dependencies` 与 `optionalDependencies` 中的 `package` 必须规范化为一项可选依赖声明，不得再记录为运行时依赖。
5. **对等依赖独立约束：** `peerDependencies` 必须记录为独立的对等依赖声明，不计入运行时依赖数量或可选依赖数量，也不解析其下游依赖。
6. **可选对等依赖约束：** 仅当 `peerDependenciesMeta` 将对应的对等依赖标记为可选时，`peerOptional` 才能取 `true`；该属性不得用于运行时依赖或可选依赖。
7. **捆绑依赖子集约束：** `bundledDependencies` 或 `bundleDependencies` 中的直接依赖必须将 `bundled` 标记为 `true`；捆绑依赖数量只描述直接依赖中的捆绑情况，不得与其他分类相加形成依赖总数。
8. **统计一致性约束：** 运行时、可选和对等依赖数量必须分别等于对应类型的直接依赖声明数量；捆绑依赖数量必须等于 `bundled` 为 `true` 的直接依赖声明数量。
9. **开发依赖排除约束：** `devDependencies` 不属于 `package` 使用者安装该 `package` 时引入的直接依赖，不纳入本概念。
10. **非负整数约束：** 所有依赖数量必须是大于或等于零的整数。
11. **客观性约束：** 本概念不得根据依赖声明或数量产生评分、等级、阈值判断或采用建议。
