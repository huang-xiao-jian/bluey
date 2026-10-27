# InspectTargetLicenseRawQuality

## 前置依赖（可选）

- [InspectTargetRawQuality](./inspect-target-raw-quality.md)

## 1. 定义

`InspectTargetLicenseRawQuality` 是检查目标在许可证维度上的原始质量事实，
用于客观呈现系统能够获得的许可证信息。

## 2. 关键属性

- **质量维度：** 固定为许可证。
- **许可证声明：** Package 对外声明的许可证标识、许可证表达式或未声明事实。
- **许可证文本：** 随 package 提供的许可证文本、版权声明和其他授权文件是否存在及其内容标识。
- **声明一致性：** 不同 package 材料中的许可证声明与许可证文本是否一致，以及存在的缺失或冲突。
- **适用条款：** 可从许可证声明或文本直接识别的授权、义务、限制和例外条款。

### 数据模型

```ts
enum LicenseDeclarationStatus {
  Declared = "declared",
  Missing = "missing",
  Unrecognized = "unrecognized",
  Conflicting = "conflicting",
}

enum LicenseTermType {
  Permission = "permission",
  Obligation = "obligation",
  Restriction = "restriction",
  Exception = "exception",
}

interface LicenseDeclarationFact {
  status: LicenseDeclarationStatus;
  expression?: string;
  location?: string;
}

interface LicenseTextFact {
  identifier: string;
  present: boolean;
  recognizedExpression?: string;
  copyrightNotices: string[];
}

interface LicenseTermFact {
  type: LicenseTermType;
  description: string;
}

interface LicenseConflictFact {
  declarations: string[];
  description: string;
}

interface InspectTargetLicenseRawQuality extends InspectTargetRawQuality {
  dimension: InspectTargetRawQualityDimension.License;
  declarations: LicenseDeclarationFact[];
  texts: LicenseTextFact[];
  terms: LicenseTermFact[];
  conflicts: LicenseConflictFact[];
}
```

### 数据模型案例

```json
{
  "inspectTarget": {
    "packageName": "example-package",
    "exactVersion": "1.2.3"
  },
  "dimension": "license",
  "declarations": [
    {
      "status": "declared",
      "expression": "MIT",
      "location": "package-metadata"
    }
  ],
  "texts": [
    {
      "identifier": "LICENSE",
      "present": true,
      "recognizedExpression": "MIT",
      "copyrightNotices": ["Copyright 2026 Example Authors"]
    }
  ],
  "terms": [
    {
      "type": "permission",
      "description": "commercial-use"
    },
    {
      "type": "obligation",
      "description": "include-license-and-copyright-notice"
    }
  ],
  "conflicts": []
}
```

## 3. 规则与约束

1. **值域约束：** 质量维度只能取许可证。
2. **信息职责约束：** 本概念负责提供检查目标声明何种许可证、是否附带许可证文本、各项声明是否一致以及直接可识别的适用条款。
3. **不确定性约束：** 许可证缺失、无法识别、存在多个候选或声明相互冲突时，必须保留对应事实，不得推断一个确定许可证。
4. **边界约束：** 本概念不作法律合规判断，也不判断许可证是否适合开发者的使用场景；依赖项许可证造成的组合风险属于依赖风险维度。
5. **继承约束：** 本概念必须遵守**InspectTargetRawQuality**的全部规则与约束。

## 4. 关系

- **泛化：** 本概念是**InspectTargetRawQuality**在许可证维度上的特化。
