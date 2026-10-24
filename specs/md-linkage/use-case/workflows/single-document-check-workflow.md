# 单文档检查

## 参考资料

- [Specification Link](../../glossary/SpecificationLink.md)
- [Resolved Specification Link](../../glossary/ResolvedSpecificationLink.md)

## 简述

验证一份文档中的每个 **Specification Link**，并将每个链接分类为有效或失效的 **Resolved Specification Link** 变体。

## 输入

```ts
interface AtomicLinkCheckTask {
  /** 用于解析链接的绝对项目边界与参照系。 */
  readonly root: string;
  /** 规范文档相对于项目的路径。 */
  readonly filePath: string;
  /** 规范文档的原始内容。 */
  readonly content: string;
}
```

## 输出

```ts
interface AtomicLinkCheckArtifact {
  readonly liveLinks: readonly LiveResolvedSpecificationLink[];
  readonly deadLinks: readonly DeadResolvedSpecificationLink[];
}
```

## 工作流

```mermaid
flowchart TD
    Start([Start]) --> Initialize["Initialize link check context"]

    subgraph Setup ["Setup"]
        Initialize --> Extract["Extract Specification Links"]
        Extract --> DeriveSourceAnchors["Derive heading anchors"]
        DeriveSourceAnchors --> Filter["Filter supported<br/>Specification Links"]
    end

    Setup --> HasLink{"Has Specification Link?"}

    subgraph Loop ["Link Processing"]
        HasLink -- Yes --> TakeLink["Take the next<br/>Specification Link"]
        TakeLink --> LinkType{"Link type?"}

        subgraph InFile ["In-file Anchor"]
            LinkType -- In-file anchor --> SourceAnchorExists{"Anchor identifies<br/>a derived heading?"}
            SourceAnchorExists -- Yes --> AppendLive["Append one live resolved-link variant"]
            SourceAnchorExists -- No --> AppendAnchorDead["Append one dead resolved-link variant<br/>AnchorNotFound"]
        end

        subgraph LocalFile ["Local File"]
            LinkType -- Local file --> ResolveLocal["Resolve final target path"]
            ResolveLocal --> LocalTargetWithinRoot{"Target remains<br/>inside root?"}
            LocalTargetWithinRoot -- No --> AppendOutsideRootDead["Append one dead resolved-link variant<br/>TargetOutsideProjectRoot"]
            LocalTargetWithinRoot -- Yes --> LocalFileExists{"Target file exists?"}
            LocalFileExists -- Yes --> AppendLive
            LocalFileExists -- No --> AppendFileDead["Append one dead resolved-link variant<br/>FileNotFound"]
        end

        subgraph CrossFile ["Cross-file Anchor"]
            LinkType -- Cross-file anchor --> ResolveCrossFile["Resolve final target path"]
            ResolveCrossFile --> CrossTargetWithinRoot{"Target remains<br/>inside root?"}
            CrossTargetWithinRoot -- No --> AppendOutsideRootDead
            CrossTargetWithinRoot -- Yes --> CrossFileExists{"Target file exists?"}
            CrossFileExists -- No --> AppendFileDead
            CrossFileExists -- Yes --> ReadTarget["Obtain target content"]
            ReadTarget --> DeriveTargetAnchors["Derive target-document heading anchors"]
            DeriveTargetAnchors --> TargetAnchorExists{"Anchor identifies<br/>a target-document heading?"}
            TargetAnchorExists -- Yes --> AppendLive
            TargetAnchorExists -- No --> AppendAnchorDead
        end
    end

    subgraph Result ["Result Generation"]
        AppendLive --> HasLink
        AppendOutsideRootDead --> HasLink
        AppendAnchorDead --> HasLink
        AppendFileDead --> HasLink
        HasLink -- No --> Fabricate["Fabricate Atomic Link<br/>Check Artifact"]
    end

    Fabricate --> End([End])
```
