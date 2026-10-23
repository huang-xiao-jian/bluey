import type { Heading } from "mdast";
import GithubSlugger from "github-slugger";
import { fromMarkdown } from "mdast-util-from-markdown";
import { toString } from "mdast-util-to-string";
import { visit } from "unist-util-visit";
import { injectable } from "inversify";

@injectable()
export class SpecificationHeadingCataloger {
  public catalog(content: string): ReadonlyMap<string, string> {
    const headings = new Map<string, string>();
    const slugger = new GithubSlugger();

    visit(fromMarkdown(content), "heading", (node: Heading) => {
      const name = toString(node);
      headings.set(slugger.slug(name), name);
    });

    return headings;
  }
}
