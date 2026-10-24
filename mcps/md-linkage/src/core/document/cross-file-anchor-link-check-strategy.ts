import { dirname } from "node:path";
import { injectable } from "inversify";
import { DeadReason } from "../model/resolved-specification-link";
import {
  SpecificationLinkType,
  type CrossFileAnchorSpecificationLink,
  type SpecificationLink,
} from "../model/specification-link";
import { SpecificationDocumentStore } from "../ports/specification-document-store";
import { SpecificationHeadingCataloger } from "./specification-heading-cataloger";
import {
  dead,
  live,
  normalizeAnchor,
  type SpecificationLinkCheckContext,
  SpecificationLinkCheckStrategy,
  withAnchorName,
} from "./specification-link-check-strategy";

@injectable()
export class CrossFileAnchorLinkCheckStrategy
  extends SpecificationLinkCheckStrategy
{
  public constructor(
    private readonly store: SpecificationDocumentStore,
    private readonly headingCataloger: SpecificationHeadingCataloger,
  ) {
    super();
  }

  public supports(
    link: SpecificationLink,
  ): link is CrossFileAnchorSpecificationLink {
    return link.type === SpecificationLinkType.CrossFileAnchor;
  }

  public async check(context: SpecificationLinkCheckContext) {
    if (!this.supports(context.link)) {
      throw new Error("Cross-file anchor strategy received an unsupported link");
    }

    const sourcePath = this.store.resolvePath(
      context.root,
      context.source.filePath,
    );
    const anchorId = normalizeAnchor(context.link.anchor);
    const targetPath = this.store.resolvePath(
      dirname(sourcePath),
      context.link.path,
    );
    const baseTarget = { filePath: targetPath, anchorId };

    if (!this.store.isWithinRoot(context.root, targetPath)) {
      return dead(context, baseTarget, DeadReason.TargetOutsideProjectRoot);
    }
    if (
      !(await this.store.exists(targetPath)) ||
      !(await this.store.isFile(targetPath))
    ) {
      return dead(context, baseTarget, DeadReason.FileNotFound);
    }

    const targetIdentity = this.store.toProjectRelative(context.root, targetPath);
    const targetDocument = await this.store.readDocument(
      context.root,
      targetIdentity,
    );
    const anchorName = this.headingCataloger
      .catalog(targetDocument.content)
      .get(anchorId);
    const target = withAnchorName(baseTarget, anchorName);

    return anchorName
      ? live(context, target)
      : dead(context, target, DeadReason.AnchorNotFound);
  }
}
