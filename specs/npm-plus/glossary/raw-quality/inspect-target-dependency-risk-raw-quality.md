# InspectTargetDependencyRiskRawQuality

## 前置依赖（可选）

- [InspectTargetRawQuality](./inspect-target-raw-quality.md)

## 1. 定义

`InspectTargetDependencyRiskRawQuality` 是检查目标在依赖风险维度上的原始质量事实，
用于客观呈现系统能够获得的依赖风险信息。

## 2. 关键属性

- **质量维度：** 固定为依赖风险。
- **依赖构成：** 检查目标的直接依赖和传递依赖，以及各依赖的版本约束、解析版本和所在层级。
- **依赖规模：** 直接依赖数量、传递依赖数量、依赖树深度和重复依赖情况。
- **依赖维护事实：** 依赖项的弃用、归档、停止维护声明，以及可用于比较版本新旧和发布时间的观察事实。
- **依赖变动：** 相邻版本之间依赖项新增、移除或升级的情况，以及由此产生的依赖面变化。
- **依赖许可证：** 依赖项的许可证声明、许可证文本存在性和可直接识别的条款，为判断许可证组合提供原始事实。

### 数据模型

```ts
enum DependencyKind {
  Runtime = "runtime",
  Optional = "optional",
  Peer = "peer",
  Development = "development",
}

enum DependencyLifecycleStatus {
  Deprecated = "deprecated",
  Archived = "archived",
  MaintenanceEnded = "maintenance-ended",
}

enum DependencyChangeType {
  Added = "added",
  Removed = "removed",
  Updated = "updated",
}

interface DependencyEdgeFact {
  parentPackageName: string;
  parentVersion: string;
  packageName: string;
  kind: DependencyKind;
  declaredRange: string;
  resolvedVersion?: string;
  depth: number;
}

interface DependencyScaleFact {
  directCount: number;
  transitiveCount: number;
  maximumDepth: number;
  duplicateCount: number;
}

interface DependencyGraphFact {
  identifier: string;
  observedAt: string;
  edges: DependencyEdgeFact[];
  scale: DependencyScaleFact;
}

interface DependencyLifecycleDeclarationFact {
  packageName: string;
  version?: string;
  status: DependencyLifecycleStatus;
  declaredAt?: string;
}

interface DependencyReleaseObservationFact {
  packageName: string;
  observedVersion?: string;
  latestVersion: string;
  latestReleasedAt?: string;
  observedAt: string;
}

interface DependencyChange {
  type: DependencyChangeType;
  packageName: string;
  previousResolvedVersion?: string;
  currentResolvedVersion?: string;
}

interface DependencyComparisonFact {
  previousInspectTargetVersion: string;
  currentInspectTargetVersion: string;
  changes: DependencyChange[];
}

interface DependencyLicenseFact {
  packageName: string;
  resolvedVersion?: string;
  declaredExpressions: string[];
  licenseTextPresent: boolean;
  identifiableTerms: string[];
}

interface InspectTargetDependencyRiskRawQuality
  extends InspectTargetRawQuality {
  dimension: InspectTargetRawQualityDimension.DependencyRisk;
  dependencyGraphs: DependencyGraphFact[];
  lifecycleDeclarations: DependencyLifecycleDeclarationFact[];
  releaseObservations: DependencyReleaseObservationFact[];
  comparisons: DependencyComparisonFact[];
  licenses: DependencyLicenseFact[];
}
```

### 数据模型案例

```json
{
  "dimension": "dependency-risk",
  "dependencyGraphs": [
    {
      "identifier": "example-package@1.2.3/default-resolution",
      "observedAt": "2026-10-20T00:00:00Z",
      "edges": [
        {
          "parentPackageName": "example-package",
          "parentVersion": "1.2.3",
          "packageName": "runtime-helper",
          "kind": "runtime",
          "declaredRange": "^4.1.0",
          "resolvedVersion": "4.2.0",
          "depth": 1
        },
        {
          "parentPackageName": "runtime-helper",
          "parentVersion": "4.2.0",
          "packageName": "legacy-parser",
          "kind": "runtime",
          "declaredRange": "~2.0.0",
          "resolvedVersion": "2.0.4",
          "depth": 2
        }
      ],
      "scale": {
        "directCount": 1,
        "transitiveCount": 1,
        "maximumDepth": 2,
        "duplicateCount": 0
      }
    }
  ],
  "lifecycleDeclarations": [
    {
      "packageName": "legacy-parser",
      "version": "2.0.4",
      "status": "deprecated",
      "declaredAt": "2025-11-01T00:00:00Z"
    }
  ],
  "releaseObservations": [
    {
      "packageName": "legacy-parser",
      "observedVersion": "2.0.4",
      "latestVersion": "3.1.0",
      "latestReleasedAt": "2026-08-01T00:00:00Z",
      "observedAt": "2026-10-20T00:00:00Z"
    }
  ],
  "comparisons": [
    {
      "previousInspectTargetVersion": "1.2.2",
      "currentInspectTargetVersion": "1.2.3",
      "changes": [
        {
          "type": "updated",
          "packageName": "runtime-helper",
          "previousResolvedVersion": "4.1.2",
          "currentResolvedVersion": "4.2.0"
        }
      ]
    }
  ],
  "licenses": [
    {
      "packageName": "runtime-helper",
      "resolvedVersion": "4.2.0",
      "declaredExpressions": ["MIT"],
      "licenseTextPresent": true,
      "identifiableTerms": ["include-license-and-copyright-notice"]
    }
  ]
}
```

## 3. 规则与约束

1. **值域约束：** 质量维度只能取依赖风险。
2. **信息职责约束：** 本概念负责提供检查目标引入的依赖边、依赖规模、依赖维护事实、依赖变动和依赖许可证事实。
3. **版本解析约束：** 记录解析版本时，必须使其与检查目标的精确版本以及对应的依赖声明相匹配；无法确定解析版本时，只记录可获得的版本约束。
4. **依赖边约束：** 每条依赖边必须标明声明依赖的父 package 及版本、被依赖的 package、声明范围和所在层级，使传递关系和重复依赖可以还原。
5. **依赖图上下文约束：** 每项依赖图事实必须标明图标识和观察时间，并同时包含依赖边与对应规模统计；规模统计不得脱离产生它的依赖解析上下文。
6. **版本比较约束：** 每项依赖变动必须归属于一次检查目标版本比较，并明确比较的前后两个检查目标版本。
7. **客观性约束：** 依赖是否过时、健康或存在许可证组合风险属于可推导结论；本概念只记录生命周期声明、版本与发布时间观察、许可证声明及直接可识别条款。
8. **边界约束：** 已知漏洞的性质、影响和修复状态属于安全性维度；检查目标自身的许可证事实属于许可证维度；依赖制品的来源和发布完整性属于供应链可信度维度。
9. **继承约束：** 本概念必须遵守**InspectTargetRawQuality**的全部规则与约束。

## 4. 关系

- **泛化：** 本概念是**InspectTargetRawQuality**在依赖风险维度上的特化。
