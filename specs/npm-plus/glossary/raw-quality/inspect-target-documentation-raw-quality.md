# InspectTargetDocumentationRawQuality

## 前置依赖（可选）

- [InspectTargetRawQuality](./inspect-target-raw-quality.md)

## 1. 定义

`InspectTargetDocumentationRawQuality` 是检查目标在文档质量维度上的原始质量事实，
用于客观呈现系统能够获得的文档状况信息。

## 2. 关键属性

- **质量维度：** 固定为文档质量。
- **文档可用性：** README、安装指南、使用指南、API 文档、示例、变更日志和迁移指南等文档是否存在并可访问。
- **主题覆盖：** 文档实际覆盖的安装、配置、核心用法、API、兼容性、升级和故障排查等主题。
- **版本适用性：** 文档是否明确适用于检查目标的精确版本，以及文档版本与 package 版本之间的对应关系。
- **更新情况：** 文档最近更新时间，以及文档更新与对应版本发布时间之间的关系。

### 数据模型

```ts
enum DocumentationType {
  Readme = "readme",
  InstallationGuide = "installation-guide",
  UsageGuide = "usage-guide",
  ApiReference = "api-reference",
  Example = "example",
  Changelog = "changelog",
  MigrationGuide = "migration-guide",
  TroubleshootingGuide = "troubleshooting-guide",
  Other = "other",
}

interface DocumentationFact {
  type: DocumentationType;
  identifier: string;
  available: boolean;
  coveredTopics: string[];
  updatedAt?: string;
}

interface DocumentationVersionAssociationFact {
  documentIdentifier: string;
  applicableVersion: string;
  documentUpdatedAt?: string;
  versionReleasedAt: string;
}

interface InspectTargetDocumentationRawQuality
  extends InspectTargetRawQuality {
  dimension: InspectTargetRawQualityDimension.Documentation;
  documents: DocumentationFact[];
  versionAssociations: DocumentationVersionAssociationFact[];
}
```

### 数据模型案例

```json
{
  "dimension": "documentation",
  "documents": [
    {
      "type": "readme",
      "identifier": "package-readme",
      "available": true,
      "coveredTopics": ["installation", "configuration", "core-usage"],
      "updatedAt": "2026-09-15T08:30:00Z"
    },
    {
      "type": "migration-guide",
      "identifier": "migration-1-to-2",
      "available": false,
      "coveredTopics": []
    }
  ],
  "versionAssociations": [
    {
      "documentIdentifier": "package-readme",
      "applicableVersion": "1.2.3",
      "documentUpdatedAt": "2026-09-15T08:30:00Z",
      "versionReleasedAt": "2026-09-15T08:30:00Z"
    }
  ]
}
```

## 3. 规则与约束

1. **值域约束：** 质量维度只能取文档质量。
2. **信息职责约束：** 本概念负责提供文档是否可用、覆盖哪些主题、适用于哪个版本以及何时更新的事实。
3. **可验证性约束：** 主题覆盖只能依据可识别的文档内容记录，不得以“完整”“清晰”或“易用”等未经定义的主观结论代替。
4. **版本关联约束：** 文档与版本的适用关系必须同时标明文档标识、适用版本和对应版本发布时间；文档更新时间可获得时一并记录。
5. **边界约束：** 发布活跃程度属于维护状况维度；许可证文本是否存在及其内容属于许可证维度；安全处置说明中的漏洞事实属于安全性维度。
6. **继承约束：** 本概念必须遵守**InspectTargetRawQuality**的全部规则与约束。

## 4. 关系

- **泛化：** 本概念是**InspectTargetRawQuality**在文档质量维度上的特化。
