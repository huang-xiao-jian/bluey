# Resolved Specification Link

## 参考资料

- [Specification Link](./SpecificationLink.md)

## 定义

**Resolved Specification Link** 是验证一个受支持 **Specification Link** 后得到的可追溯结果。它保留作者写下的链接并标识解析后的目标。其 `status` 用于区分有效与失效变体。

## 关键属性

- **Status：** 已解析链接是有效还是失效。
- **Location：** 包含该链接的 Markdown 文档所在的项目边界与项目相对路径。
- **Link：** 接受验证的原始 **Specification Link**。
- **Target：** 解析后的目标文件，以及验证时使用的锚点和已知标题名称（若适用）。
- **Dead Reason：** 仅用于失效变体，说明目标无效的原因。

### 数据模型

- `DeadReason.FileNotFound` 表示解析后的目标文件不存在。
- `DeadReason.AnchorNotFound` 仅在解析后的目标文件存在，但指定锚点未标识该文件中受支持的标题时适用。
- `DeadReason.TargetOutsideProjectRoot` 表示解析后的目标路径位于 `location.root` 建立的项目边界之外。
- 目标包含关系先于文件或锚点是否存在进行检查。目标位于项目根目录之外时，验证以 `DeadReason.TargetOutsideProjectRoot` 停止。
- 跨文件目标不存在时，验证以 `DeadReason.FileNotFound` 停止，不会再生成锚点缺失结果。

```ts
enum DeadReason {
  FileNotFound = "file-not-found",
  AnchorNotFound = "anchor-not-found",
  TargetOutsideProjectRoot = "target-outside-project-root",
}

enum ResolvedSpecificationLinkStatus {
  Live = "live",
  Dead = "dead",
}

interface ResolvedSpecificationLinkBase {
  /** 标识包含该链接的 Markdown 文档。 */
  readonly location: {
    /** 为链接检查建立的绝对项目边界。 */
    readonly root: string;
    /** 源 Markdown 文档相对于根目录的路径。 */
    readonly filePath: string;
  };
  /** 保留接受验证的原始 Specification Link。 */
  readonly link: SpecificationLink;
  /** 标识链接验证期间使用的目标。 */
  readonly target: {
    /** 完整解析路径；对于文档内锚点，该路径解析为源文件。 */
    readonly filePath: string;
    /** 链接指定锚点时使用的规范化锚点 ID。 */
    readonly anchorId?: string;
    /** 无需推断即可得知时的人类可读标题名称。 */
    readonly anchorName?: string;
  };
}

interface LiveResolvedSpecificationLink extends ResolvedSpecificationLinkBase {
  readonly status: ResolvedSpecificationLinkStatus.Live;
}

interface DeadResolvedSpecificationLink extends ResolvedSpecificationLinkBase {
  readonly status: ResolvedSpecificationLinkStatus.Dead;
  readonly reason: DeadReason;
}

type ResolvedSpecificationLink =
  | LiveResolvedSpecificationLink
  | DeadResolvedSpecificationLink;
```

### 数据模型案例

**有效链接：**

```json
{
  "status": "live",
  "location": {
    "root": "/workspace/bluey",
    "filePath": "specs/md-linkage/spec.md"
  },
  "link": {
    "type": "cross-file-anchor",
    "text": "[Resolved link](glossary/ResolvedSpecificationLink.md#data-model)",
    "name": "Resolved link",
    "path": "glossary/ResolvedSpecificationLink.md",
    "anchor": "data-model"
  },
  "target": {
    "filePath": "/workspace/bluey/specs/md-linkage/glossary/ResolvedSpecificationLink.md",
    "anchorId": "data-model",
    "anchorName": "数据模型"
  }
}
```

该变种表示一个跨文件链接：目标文件存在，但请求的标题不存在。

**失效链接：**

```json
{
  "status": "dead",
  "location": {
    "root": "/workspace/bluey",
    "filePath": "specs/md-linkage/spec.md"
  },
  "link": {
    "type": "cross-file-anchor",
    "text": "[Resolved link](glossary/ResolvedSpecificationLink.md#missing-section)",
    "name": "Resolved link",
    "path": "glossary/ResolvedSpecificationLink.md",
    "anchor": "missing-section"
  },
  "target": {
    "filePath": "/workspace/bluey/specs/md-linkage/glossary/ResolvedSpecificationLink.md",
    "anchorId": "missing-section"
  },
  "reason": "anchor-not-found"
}
```

## 规则与约束

1. 每个 **Specification Link** 恰好产生一个 **Resolved Specification Link**。
2. **Resolved Specification Link** 一经建立便保持不变。
