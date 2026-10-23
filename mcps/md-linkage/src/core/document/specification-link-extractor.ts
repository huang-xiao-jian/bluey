import type { Link } from "mdast";
import { fromMarkdown } from "mdast-util-from-markdown";
import { toString } from "mdast-util-to-string";
import { visit } from "unist-util-visit";
import { injectable } from "inversify";
import type { SpecificationDocument } from "../model/specification-document";
import {
  SpecificationLinkType,
  type SpecificationLink,
} from "../model/specification-link";

@injectable()
export class SpecificationLinkExtractor {
  public extract(document: SpecificationDocument): readonly SpecificationLink[] {
    const tree = fromMarkdown(document.content);
    const links: SpecificationLink[] = [];

    visit(tree, "link", (node: Link) => {
      const link = this.toSpecificationLink(document.content, node);
      if (link) links.push(link);
    });

    return links;
  }

  private toSpecificationLink(
    content: string,
    node: Link,
  ): SpecificationLink | undefined {
    const destination = node.url.trim();
    if (!destination || this.isExternal(destination)) return undefined;

    const hashIndex = destination.indexOf("#");
    const path = hashIndex === -1 ? destination : destination.slice(0, hashIndex);
    const anchor = hashIndex === -1 ? undefined : destination.slice(hashIndex + 1);
    if (hashIndex !== -1 && !anchor) return undefined;

    const text =
      node.position?.start.offset !== undefined &&
      node.position.end.offset !== undefined
        ? content.slice(node.position.start.offset, node.position.end.offset)
        : `[${toString(node)}](${node.url})`;
    const name = toString(node);

    if (!path && anchor) {
      return { type: SpecificationLinkType.InFileAnchor, text, name, anchor };
    }
    if (path && anchor) {
      return {
        type: SpecificationLinkType.CrossFileAnchor,
        text,
        name,
        path,
        anchor,
      };
    }
    if (path) {
      return { type: SpecificationLinkType.LocalFile, text, name, path };
    }
    return undefined;
  }

  private isExternal(destination: string): boolean {
    return (
      destination.startsWith("//") ||
      /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(destination)
    );
  }
}
