# InspectTargetSecurityRawQuality

## 前置依赖（可选）

- [InspectTargetRawQuality](./inspect-target-raw-quality.md)

## 1. 定义

`InspectTargetSecurityRawQuality` 是检查目标在安全性维度上的原始质量事实，
用于客观呈现系统能够获得的安全性信息。

## 2. 关键属性

- **质量维度：** 固定为安全性。
- **已知漏洞：** 影响检查目标的已知漏洞，包括漏洞标识、漏洞类型、严重程度以及受影响条件。
- **影响状态：** 检查目标的精确版本是否受漏洞影响，以及确认该状态所依据的版本范围或其他适用条件。
- **处置状态：** 漏洞是否已有修复版本、缓解措施或明确的无需处置结论。
- **恶意行为事实：** 与检查目标有关的恶意代码、恶意发布或其他已确认安全事件。

### 数据模型

```ts
enum SecurityImpactStatus {
  Affected = "affected",
  NotAffected = "not-affected",
  Unknown = "unknown",
}

enum SecurityRemediationStatus {
  Fixed = "fixed",
  Mitigated = "mitigated",
  Unresolved = "unresolved",
  NotRequired = "not-required",
}

enum MaliciousBehaviorType {
  MaliciousCode = "malicious-code",
  MaliciousRelease = "malicious-release",
  AccountCompromise = "account-compromise",
  Other = "other",
}

interface SecurityVulnerabilityFact {
  identifier: string;
  categories: string[];
  severities: SecuritySeverityFact[];
  affectedRange?: string;
  impactStatus: SecurityImpactStatus;
  remediationStatus: SecurityRemediationStatus;
  fixedVersions: string[];
  mitigations: string[];
}

interface SecuritySeverityFact {
  system: string;
  value: string;
  score?: number;
}

interface MaliciousBehaviorEvent {
  identifier: string;
  type: MaliciousBehaviorType;
  affectedVersions: string[];
  occurredAt?: string;
  description: string;
}

interface InspectTargetSecurityRawQuality extends InspectTargetRawQuality {
  dimension: InspectTargetRawQualityDimension.Security;
  vulnerabilities: SecurityVulnerabilityFact[];
  maliciousBehaviorEvents: MaliciousBehaviorEvent[];
}
```

### 数据模型案例

```json
{
  "dimension": "security",
  "vulnerabilities": [
    {
      "identifier": "VULN-2026-001",
      "categories": ["prototype-pollution"],
      "severities": [
        {
          "system": "severity-system-v1",
          "value": "high",
          "score": 8.1
        }
      ],
      "affectedRange": ">=1.0.0 <1.2.4",
      "impactStatus": "affected",
      "remediationStatus": "fixed",
      "fixedVersions": ["1.2.4"],
      "mitigations": []
    }
  ],
  "maliciousBehaviorEvents": []
}
```

## 3. 规则与约束

1. **值域约束：** 质量维度只能取安全性。
2. **信息职责约束：** 本概念负责提供检查目标已知安全问题的性质、影响和处置事实。
3. **版本适用约束：** 安全问题必须标明是否适用于检查目标的精确版本；只有 package 层面事实时，必须明确其适用范围尚未细化到该版本。
4. **严重程度上下文约束：** 每项严重程度事实必须标明采用的严重程度体系，并保留该体系给出的值及可选数值分数。
5. **边界约束：** 依赖数量、依赖层级、依赖活跃度等结构性信息属于依赖风险维度；发布者身份、制品来源和构建证明属于供应链可信度维度。
6. **继承约束：** 本概念必须遵守**InspectTargetRawQuality**的全部规则与约束。

## 4. 关系

- **泛化：** 本概念是**InspectTargetRawQuality**在安全性维度上的特化。
