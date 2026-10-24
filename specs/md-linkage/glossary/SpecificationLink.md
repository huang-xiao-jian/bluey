# Specification Link

## 定义

**Specification Link** 是从特定 Markdown 文档中提取的原始链接。它保留作者写下的内容，并在解析或验证任何目标之前标识受支持的链接形式。

## 关键属性

- **Type：** 标识链接指向本地文件、源文档内的锚点，还是另一文件中的锚点。
- **Text：** 与作者所写内容完全一致的完整 Markdown 链接。
- **Name：** 可见的链接文本。
- **Path：** 本地文件链接或跨文件锚点链接中由作者写下的目标文件路径。
- **Anchor：** 文档内锚点链接或跨文件锚点链接中由作者写下的锚点。

### 数据模型

```ts
enum SpecificationLinkType {
  LocalFile = "local-file",
  InFileAnchor = "in-file-anchor",
  CrossFileAnchor = "cross-file-anchor",
}

interface LocalFileSpecificationLink {
  type: SpecificationLinkType.LocalFile;
  /** 与作者所写内容完全一致的完整 Markdown 链接。 */
  text: string;
  /** 可见的链接文本。 */
  name: string;
  /** 作者写下的目标文件路径。 */
  path: string;
}

interface InFileAnchorSpecificationLink {
  type: SpecificationLinkType.InFileAnchor;
  /** 与作者所写内容完全一致的完整 Markdown 链接。 */
  text: string;
  /** 可见的链接文本。 */
  name: string;
  /** 作者在源文档中写下的锚点。 */
  anchor: string;
}

interface CrossFileAnchorSpecificationLink {
  type: SpecificationLinkType.CrossFileAnchor;
  /** 与作者所写内容完全一致的完整 Markdown 链接。 */
  text: string;
  /** 可见的链接文本。 */
  name: string;
  /** 作者写下的目标文件路径。 */
  path: string;
  /** 作者在目标文件中写下的锚点。 */
  anchor: string;
}

type SpecificationLink =
  | LocalFileSpecificationLink
  | InFileAnchorSpecificationLink
  | CrossFileAnchorSpecificationLink;
```

### 数据模型案例

```ts
const localFileLink: LocalFileSpecificationLink = {
  type: SpecificationLinkType.LocalFile,
  text: "[Technical design](../design.md)",
  name: "Technical design",
  path: "../design.md",
};

const inFileAnchorLink: InFileAnchorSpecificationLink = {
  type: SpecificationLinkType.InFileAnchor,
  text: "[Business rules](#business-rules)",
  name: "Business rules",
  anchor: "business-rules",
};

const crossFileAnchorLink: CrossFileAnchorSpecificationLink = {
  type: SpecificationLinkType.CrossFileAnchor,
  text: "[Data model](./ResolvedSpecificationLink.md#31-data-model)",
  name: "Data model",
  path: "./ResolvedSpecificationLink.md",
  anchor: "31-data-model",
};
```

## 规则与约束

1. 从规范文档中提取的每个受支持链接仅由一个 **Specification Link** 表示。
2. **Specification Link** 一经建立便保持不变。
3. **Specification Link** 在验证之前便已存在；无论目标有效还是无效，它都表示同一份作者原始内容。
