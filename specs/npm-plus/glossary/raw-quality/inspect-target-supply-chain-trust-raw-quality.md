# InspectTargetSupplyChainTrustRawQuality

## 前置依赖（可选）

- [InspectTargetRawQuality](./inspect-target-raw-quality.md)

## 1. 定义

`InspectTargetSupplyChainTrustRawQuality` 是检查目标在供应链可信度维度上的原始质量事实，
用于客观呈现系统能够获得的供应链可信度信息。

## 2. 关键属性

- **质量维度：** 固定为供应链可信度。
- **发布主体：** 发布检查目标精确版本的主体、该主体可获得的身份信息以及其与 package 维护者的关系。
- **所有权变更：** Package 的所有者、维护者或发布权限发生新增、移除和转移的历史事实。
- **来源关联：** Package、源代码仓库、版本标签、提交和发布制品之间可确认的对应关系。
- **构建与发布证明：** 与检查目标有关的来源证明、构建证明、签名、校验信息和发布时间信息。
- **制品一致性：** 发布制品与其声明来源、构建输入或同版本相关制品之间的一致性事实。

### 数据模型

```ts
enum PublisherRelationship {
  Owner = "owner",
  Maintainer = "maintainer",
  AuthorizedPublisher = "authorized-publisher",
  Other = "other",
}

enum OwnershipChangeType {
  OwnerAdded = "owner-added",
  OwnerRemoved = "owner-removed",
  MaintainerAdded = "maintainer-added",
  MaintainerRemoved = "maintainer-removed",
  PublishPermissionTransferred = "publish-permission-transferred",
}

enum SupplyChainEvidenceType {
  Provenance = "provenance",
  BuildAttestation = "build-attestation",
  Signature = "signature",
  Checksum = "checksum",
}

enum EvidenceVerificationStatus {
  Verified = "verified",
  Failed = "failed",
  NotVerified = "not-verified",
}

interface PublisherFact {
  identity: string;
  relationship: PublisherRelationship;
  publishedAt: string;
}

interface OwnershipAddedFact {
  type:
    | OwnershipChangeType.OwnerAdded
    | OwnershipChangeType.MaintainerAdded;
  currentIdentity: string;
  occurredAt: string;
}

interface OwnershipRemovedFact {
  type:
    | OwnershipChangeType.OwnerRemoved
    | OwnershipChangeType.MaintainerRemoved;
  previousIdentity: string;
  occurredAt: string;
}

interface PublishPermissionTransferFact {
  type: OwnershipChangeType.PublishPermissionTransferred;
  previousIdentity: string;
  currentIdentity: string;
  occurredAt: string;
}

type OwnershipChangeFact =
  | OwnershipAddedFact
  | OwnershipRemovedFact
  | PublishPermissionTransferFact;

interface SourceAssociationFact {
  repository: string;
  tag?: string;
  commit?: string;
  artifact?: string;
}

interface SupplyChainEvidenceFact {
  type: SupplyChainEvidenceType;
  subject: string;
  available: boolean;
  verificationStatus: EvidenceVerificationStatus;
}

interface ArtifactConsistencyFact {
  firstSubject: string;
  secondSubject: string;
  consistent: boolean;
  checkedAt?: string;
}

interface InspectTargetSupplyChainTrustRawQuality
  extends InspectTargetRawQuality {
  dimension: InspectTargetRawQualityDimension.SupplyChainTrust;
  publishers: PublisherFact[];
  ownershipChanges: OwnershipChangeFact[];
  sourceAssociations: SourceAssociationFact[];
  evidence: SupplyChainEvidenceFact[];
  artifactConsistencyChecks: ArtifactConsistencyFact[];
}
```

### 数据模型案例

```json
{
  "inspectTarget": {
    "packageName": "example-package",
    "exactVersion": "1.2.3"
  },
  "dimension": "supply-chain-trust",
  "publishers": [
    {
      "identity": "publisher-42",
      "relationship": "maintainer",
      "publishedAt": "2026-09-15T08:30:00Z"
    }
  ],
  "ownershipChanges": [
    {
      "type": "maintainer-added",
      "currentIdentity": "publisher-42",
      "occurredAt": "2026-06-10T10:00:00Z"
    }
  ],
  "sourceAssociations": [
    {
      "repository": "source-repository",
      "tag": "v1.2.3",
      "commit": "4f3a2b1",
      "artifact": "example-package-1.2.3.tgz"
    }
  ],
  "evidence": [
    {
      "type": "provenance",
      "subject": "example-package-1.2.3.tgz",
      "available": true,
      "verificationStatus": "verified"
    }
  ],
  "artifactConsistencyChecks": [
    {
      "firstSubject": "example-package-1.2.3.tgz",
      "secondSubject": "source-repository@4f3a2b1",
      "consistent": true,
      "checkedAt": "2026-09-15T09:00:00Z"
    }
  ]
}
```

## 3. 规则与约束

1. **值域约束：** 质量维度只能取供应链可信度。
2. **信息职责约束：** 本概念负责提供谁发布了检查目标、发布制品来自哪里、如何构建和验证，以及所有权或发布权限如何变化的事实。
3. **可追溯性约束：** 来源关联、构建证明和签名等信息必须保留其适用的精确版本、制品或发布事件，不能仅以 package 层面的存在性代替。
4. **身份变更约束：** 新增事件必须记录新增身份，移除事件必须记录移除身份，发布权限转移事件必须同时记录原身份和新身份。
5. **边界约束：** 已知漏洞和恶意行为事件属于安全性维度；日常维护活动和响应速度属于维护状况维度；本概念不得把证明缺失直接解释为不可信。
6. **继承约束：** 本概念必须遵守**InspectTargetRawQuality**的全部规则与约束。

## 4. 关系

- **泛化：** 本概念是**InspectTargetRawQuality**在供应链可信度维度上的特化。
