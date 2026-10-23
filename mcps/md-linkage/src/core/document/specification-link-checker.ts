import { dirname } from "node:path";
import { inject, injectable } from "inversify";
import {
  DeadReason,
  ResolvedSpecificationLinkStatus,
  type DeadResolvedSpecificationLink,
  type LiveResolvedSpecificationLink,
  type ResolvedSpecificationLink,
  type ResolvedSpecificationLinkTarget,
} from "../model/resolved-specification-link";
import type { SpecificationDocument } from "../model/specification-document";
import {
  SpecificationLinkType,
  type SpecificationLink,
} from "../model/specification-link";
import {
  SpecificationDocumentStoreToken,
  type SpecificationDocumentStore,
} from "../ports/specification-document-store";
import { SpecificationHeadingCataloger } from "./specification-heading-cataloger";

@injectable()
export class SpecificationLinkChecker {
  public constructor(
    @inject(SpecificationDocumentStoreToken)
    private readonly store: SpecificationDocumentStore,
    @inject(SpecificationHeadingCataloger)
    private readonly headingCataloger: SpecificationHeadingCataloger,
  ) {}

  public async check(
    root: string,
    source: SpecificationDocument,
    link: SpecificationLink,
    sourceHeadings: ReadonlyMap<string, string>,
  ): Promise<ResolvedSpecificationLink> {
    const sourcePath = this.store.resolvePath(root, source.filePath);
    const location = { root, filePath: source.filePath };

    if (link.type === SpecificationLinkType.InFileAnchor) {
      const anchorId = this.normalizeAnchor(link.anchor);
      const anchorName = sourceHeadings.get(anchorId);
      const target = this.withAnchorName({ filePath: sourcePath, anchorId }, anchorName);
      return anchorName
        ? this.live(location, link, target)
        : this.dead(location, link, target, DeadReason.AnchorNotFound);
    }

    const targetPath = this.store.resolvePath(dirname(sourcePath), link.path);
    const baseTarget = { filePath: targetPath };
    if (!this.store.isWithinRoot(root, targetPath)) {
      return this.dead(
        location,
        link,
        this.targetFor(link, baseTarget),
        DeadReason.TargetOutsideProjectRoot,
      );
    }
    if (!(await this.store.exists(targetPath)) || !(await this.store.isFile(targetPath))) {
      return this.dead(
        location,
        link,
        this.targetFor(link, baseTarget),
        DeadReason.FileNotFound,
      );
    }
    if (link.type === SpecificationLinkType.LocalFile) {
      return this.live(location, link, baseTarget);
    }

    const anchorId = this.normalizeAnchor(link.anchor);
    const targetIdentity = this.store.toProjectRelative(root, targetPath);
    const targetDocument = await this.store.readDocument(root, targetIdentity);
    const anchorName = this.headingCataloger.catalog(targetDocument.content).get(anchorId);
    const target = this.withAnchorName({ filePath: targetPath, anchorId }, anchorName);
    return anchorName
      ? this.live(location, link, target)
      : this.dead(location, link, target, DeadReason.AnchorNotFound);
  }

  private targetFor(
    link: SpecificationLink,
    target: ResolvedSpecificationLinkTarget,
  ): ResolvedSpecificationLinkTarget {
    return link.type === SpecificationLinkType.CrossFileAnchor
      ? { ...target, anchorId: this.normalizeAnchor(link.anchor) }
      : target;
  }

  private withAnchorName(
    target: ResolvedSpecificationLinkTarget,
    anchorName: string | undefined,
  ): ResolvedSpecificationLinkTarget {
    return anchorName ? { ...target, anchorName } : target;
  }

  private normalizeAnchor(anchor: string): string {
    const value = anchor.startsWith("#") ? anchor.slice(1) : anchor;
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }

  private live(
    location: { readonly root: string; readonly filePath: string },
    link: SpecificationLink,
    target: ResolvedSpecificationLinkTarget,
  ): LiveResolvedSpecificationLink {
    return { status: ResolvedSpecificationLinkStatus.Live, location, link, target };
  }

  private dead(
    location: { readonly root: string; readonly filePath: string },
    link: SpecificationLink,
    target: ResolvedSpecificationLinkTarget,
    reason: DeadReason,
  ): DeadResolvedSpecificationLink {
    return {
      status: ResolvedSpecificationLinkStatus.Dead,
      location,
      link,
      target,
      reason,
    };
  }
}
