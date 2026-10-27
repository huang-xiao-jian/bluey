# InspectTargetPopularityRawQuality

## 前置依赖（可选）

- [InspectTargetRawQuality](./inspect-target-raw-quality.md)

## 1. 定义

`InspectTargetPopularityRawQuality` 是检查目标在流行度维度上的原始质量事实，
用于客观呈现系统能够获得的流行度信息。

## 2. 关键属性

- **质量维度：** 固定为流行度。
- **获取量：** Package 在给定统计区间内被下载、安装或以其他方式获取的数量。
- **依赖采用：** 将该 package 声明为依赖项的公开项目或 package 数量。
- **社区关注：** 收藏、关注、订阅或其他能够表示社区关注规模的数量。
- **采用分布：** 使用量在版本、时间或生态范围上的分布，包括检查目标精确版本所占的采用情况。

### 数据模型

```ts
enum PopularityMetricType {
  Download = "download",
  Install = "install",
  DependentPackage = "dependent-package",
  DependentProject = "dependent-project",
  Favorite = "favorite",
  Watch = "watch",
  Subscription = "subscription",
}

enum PopularityMetricScope {
  Package = "package",
  ExactVersion = "exact-version",
}

interface PopularityMetricBase {
  type: PopularityMetricType;
  count: number;
  unit: string;
  ecosystemScope?: string;
}

interface PackagePopularityMetric extends PopularityMetricBase {
  scope: PopularityMetricScope.Package;
}

interface ExactVersionPopularityMetric extends PopularityMetricBase {
  scope: PopularityMetricScope.ExactVersion;
  exactVersion: string;
}

interface PopularityInterval {
  periodStartedAt: string;
  periodEndedAt: string;
}

interface PopularityObservation {
  observedAt: string;
}

type PopularityMetric =
  | (PackagePopularityMetric & PopularityInterval)
  | (PackagePopularityMetric & PopularityObservation)
  | (ExactVersionPopularityMetric & PopularityInterval)
  | (ExactVersionPopularityMetric & PopularityObservation);

interface InspectTargetPopularityRawQuality extends InspectTargetRawQuality {
  dimension: InspectTargetRawQualityDimension.Popularity;
  metrics: PopularityMetric[];
}
```

### 数据模型案例

```json
{
  "dimension": "popularity",
  "metrics": [
    {
      "type": "download",
      "scope": "package",
      "count": 125000,
      "unit": "downloads",
      "periodStartedAt": "2026-09-01T00:00:00Z",
      "periodEndedAt": "2026-09-30T23:59:59Z"
    },
    {
      "type": "download",
      "scope": "exact-version",
      "exactVersion": "1.2.3",
      "count": 42000,
      "unit": "downloads",
      "periodStartedAt": "2026-09-01T00:00:00Z",
      "periodEndedAt": "2026-09-30T23:59:59Z"
    },
    {
      "type": "dependent-package",
      "scope": "package",
      "count": 860,
      "unit": "packages",
      "ecosystemScope": "public-package-ecosystem",
      "observedAt": "2026-10-01T00:00:00Z"
    }
  ]
}
```

## 3. 规则与约束

1. **值域约束：** 质量维度只能取流行度。
2. **信息职责约束：** 本概念负责提供 package 被获取、采用和关注的规模及其变化事实。
3. **统计口径约束：** 每项数量必须标明统计对象、统计时间和计量单位；无法区分 package 整体与检查目标精确版本时，必须明确统计粒度。
4. **时间上下文约束：** 区间统计必须同时记录区间起止时间；时间点统计必须记录观察时间。
5. **版本粒度约束：** 统计范围为精确版本时必须记录该版本；统计范围为 package 整体时不得把数量归属于某个精确版本。
6. **边界约束：** 社区响应速度属于维护状况维度；依赖关系带来的结构性风险属于依赖风险维度；流行程度不得被直接解释为质量、安全性或可信度。
7. **继承约束：** 本概念必须遵守**InspectTargetRawQuality**的全部规则与约束。

## 4. 关系

- **泛化：** 本概念是**InspectTargetRawQuality**在流行度维度上的特化。
