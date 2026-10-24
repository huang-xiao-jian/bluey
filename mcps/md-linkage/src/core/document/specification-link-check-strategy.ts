import {
  ResolvedSpecificationLinkStatus,
  type DeadReason,
  type DeadResolvedSpecificationLink,
  type LiveResolvedSpecificationLink,
  type ResolvedSpecificationLink,
  type ResolvedSpecificationLinkTarget,
} from "../model/resolved-specification-link";
import type { SpecificationDocument } from "../model/specification-document";
import type { SpecificationLink } from "../model/specification-link";

export interface SpecificationLinkCheckContext {
  readonly root: string;
  readonly source: SpecificationDocument;
  readonly link: SpecificationLink;
  readonly sourceHeadings: ReadonlyMap<string, string>;
}

export abstract class SpecificationLinkCheckStrategy {
  public abstract supports(link: SpecificationLink): boolean;
  public abstract check(
    context: SpecificationLinkCheckContext,
  ): Promise<ResolvedSpecificationLink>;
}

export function normalizeAnchor(anchor: string): string {
  const value = anchor.startsWith("#") ? anchor.slice(1) : anchor;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function withAnchorName(
  target: ResolvedSpecificationLinkTarget,
  anchorName: string | undefined,
): ResolvedSpecificationLinkTarget {
  return anchorName ? { ...target, anchorName } : target;
}

export function live(
  context: SpecificationLinkCheckContext,
  target: ResolvedSpecificationLinkTarget,
): LiveResolvedSpecificationLink {
  return {
    status: ResolvedSpecificationLinkStatus.Live,
    location: { root: context.root, filePath: context.source.filePath },
    link: context.link,
    target,
  };
}

export function dead(
  context: SpecificationLinkCheckContext,
  target: ResolvedSpecificationLinkTarget,
  reason: DeadReason,
): DeadResolvedSpecificationLink {
  return {
    status: ResolvedSpecificationLinkStatus.Dead,
    location: { root: context.root, filePath: context.source.filePath },
    link: context.link,
    target,
    reason,
  };
}
