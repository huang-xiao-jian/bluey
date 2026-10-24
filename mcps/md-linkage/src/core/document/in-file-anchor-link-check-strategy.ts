import { injectable } from "inversify";
import { DeadReason } from "../model/resolved-specification-link";
import {
  SpecificationLinkType,
  type InFileAnchorSpecificationLink,
  type SpecificationLink,
} from "../model/specification-link";
import { SpecificationDocumentStore } from "../ports/specification-document-store";
import {
  dead,
  live,
  normalizeAnchor,
  type SpecificationLinkCheckContext,
  SpecificationLinkCheckStrategy,
  withAnchorName,
} from "./specification-link-check-strategy";

@injectable()
export class InFileAnchorLinkCheckStrategy
  extends SpecificationLinkCheckStrategy
{
  public constructor(private readonly store: SpecificationDocumentStore) {
    super();
  }

  public supports(
    link: SpecificationLink,
  ): link is InFileAnchorSpecificationLink {
    return link.type === SpecificationLinkType.InFileAnchor;
  }

  public async check(context: SpecificationLinkCheckContext) {
    if (!this.supports(context.link)) {
      throw new Error("In-file anchor strategy received an unsupported link");
    }

    const anchorId = normalizeAnchor(context.link.anchor);
    const anchorName = context.sourceHeadings.get(anchorId);
    const sourcePath = this.store.resolvePath(
      context.root,
      context.source.filePath,
    );
    const target = withAnchorName({ filePath: sourcePath, anchorId }, anchorName);

    return anchorName
      ? live(context, target)
      : dead(context, target, DeadReason.AnchorNotFound);
  }
}
