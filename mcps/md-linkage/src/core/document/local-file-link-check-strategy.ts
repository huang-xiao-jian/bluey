import { dirname } from "node:path";
import { injectable } from "inversify";
import { DeadReason } from "../model/resolved-specification-link";
import {
  SpecificationLinkType,
  type LocalFileSpecificationLink,
  type SpecificationLink,
} from "../model/specification-link";
import { SpecificationDocumentStore } from "../ports/specification-document-store";
import {
  dead,
  live,
  type SpecificationLinkCheckContext,
  SpecificationLinkCheckStrategy,
} from "./specification-link-check-strategy";

@injectable()
export class LocalFileLinkCheckStrategy extends SpecificationLinkCheckStrategy {
  public constructor(private readonly store: SpecificationDocumentStore) {
    super();
  }

  public supports(link: SpecificationLink): link is LocalFileSpecificationLink {
    return link.type === SpecificationLinkType.LocalFile;
  }

  public async check(context: SpecificationLinkCheckContext) {
    if (!this.supports(context.link)) {
      throw new Error("Local file strategy received an unsupported link");
    }

    const sourcePath = this.store.resolvePath(
      context.root,
      context.source.filePath,
    );
    const target = {
      filePath: this.store.resolvePath(dirname(sourcePath), context.link.path),
    };
    const [canonicalRoot, canonicalTarget] = await Promise.all([
      this.store.canonicalize(context.root),
      this.store.canonicalize(target.filePath),
    ]);

    if (!this.store.isWithinRoot(canonicalRoot, canonicalTarget)) {
      return dead(context, target, DeadReason.TargetOutsideProjectRoot);
    }
    if (
      !(await this.store.exists(target.filePath)) ||
      !(await this.store.isFile(target.filePath))
    ) {
      return dead(context, target, DeadReason.FileNotFound);
    }
    return live(context, target);
  }
}
