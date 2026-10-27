# InspectTargetMaintenanceRawQuality

## 前置依赖（可选）

- [InspectTargetRawQuality](./inspect-target-raw-quality.md)

## 1. 定义

`InspectTargetMaintenanceRawQuality` 是检查目标在维护状况维度上的原始质量事实，
用于客观呈现系统能够获得的维护状况信息。

## 2. 关键属性

- **质量维度：** 固定为维护状况。
- **生命周期状态：** Package 是否处于持续维护、仅接受关键修复、弃用、归档或其他已声明状态。
- **发布活动：** 最近发布时间、历史发布时间序列以及能够反映发布频率和中断情况的事实。
- **维护活动：** 最近维护活动时间，以及问题、变更请求和版本发布的处理活动。
- **响应情况：** 对问题报告、变更请求和安全报告的响应数量、响应时间或积压情况。

### 数据模型

```ts
enum MaintenanceLifecycleStatus {
  Maintained = "maintained",
  CriticalFixesOnly = "critical-fixes-only",
  Deprecated = "deprecated",
  Archived = "archived",
  Other = "other",
}

enum MaintenanceActivityType {
  Issue = "issue",
  ChangeRequest = "change-request",
  Release = "release",
  SecurityReport = "security-report",
  Other = "other",
}

interface MaintenanceLifecycleDeclaration {
  status: MaintenanceLifecycleStatus;
  declaredAt?: string;
  effectiveAt?: string;
  description?: string;
}

interface ReleaseActivity {
  version: string;
  releasedAt: string;
}

interface MaintenanceActivity {
  type: MaintenanceActivityType;
  occurredAt: string;
  identifier?: string;
}

interface MaintenanceResponseMetric {
  subject: MaintenanceActivityType;
  periodStartedAt: string;
  periodEndedAt: string;
  receivedCount: number;
  resolvedCount: number;
  openCount: number;
  medianFirstResponseHours?: number;
}

interface InspectTargetMaintenanceRawQuality extends InspectTargetRawQuality {
  dimension: InspectTargetRawQualityDimension.Maintenance;
  lifecycleDeclarations: MaintenanceLifecycleDeclaration[];
  releases: ReleaseActivity[];
  activities: MaintenanceActivity[];
  responseMetrics: MaintenanceResponseMetric[];
}
```

### 数据模型案例

```json
{
  "inspectTarget": {
    "packageName": "example-package",
    "exactVersion": "1.2.3"
  },
  "dimension": "maintenance",
  "lifecycleDeclarations": [
    {
      "status": "maintained",
      "declaredAt": "2026-09-01T00:00:00Z"
    }
  ],
  "releases": [
    {
      "version": "1.2.3",
      "releasedAt": "2026-09-15T08:30:00Z"
    }
  ],
  "activities": [
    {
      "type": "issue",
      "occurredAt": "2026-10-20T12:00:00Z",
      "identifier": "issue-128"
    }
  ],
  "responseMetrics": [
    {
      "subject": "issue",
      "periodStartedAt": "2026-09-01T00:00:00Z",
      "periodEndedAt": "2026-09-30T23:59:59Z",
      "receivedCount": 12,
      "resolvedCount": 10,
      "openCount": 2,
      "medianFirstResponseHours": 18
    }
  ]
}
```

## 3. 规则与约束

1. **值域约束：** 质量维度只能取维护状况。
2. **信息职责约束：** 本概念负责提供 package 是否仍被维护、维护活动何时发生以及维护者如何响应变更和问题的事实。
3. **时间上下文约束：** 发布活动、维护活动和响应情况必须附带观察时间或统计区间，避免把不同时间范围的数据直接并列。
4. **边界约束：** 使用量和社区关注属于流行度维度；依赖项自身的维护状态在影响检查目标时属于依赖风险维度；维护者身份及其变更属于供应链可信度维度。
5. **继承约束：** 本概念必须遵守**InspectTargetRawQuality**的全部规则与约束。

## 4. 关系

- **泛化：** 本概念是**InspectTargetRawQuality**在维护状况维度上的特化。
