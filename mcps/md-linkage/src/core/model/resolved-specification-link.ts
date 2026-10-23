import type { SpecificationLink } from "./specification-link";

export enum DeadReason {
  FileNotFound = "file-not-found",
  AnchorNotFound = "anchor-not-found",
  TargetOutsideProjectRoot = "target-outside-project-root",
}

export enum ResolvedSpecificationLinkStatus {
  Live = "live",
  Dead = "dead",
}

export interface ResolvedSpecificationLinkLocation {
  readonly root: string;
  readonly filePath: string;
}

export interface ResolvedSpecificationLinkTarget {
  readonly filePath: string;
  readonly anchorId?: string;
  readonly anchorName?: string;
}

interface ResolvedSpecificationLinkBase {
  readonly location: ResolvedSpecificationLinkLocation;
  readonly link: SpecificationLink;
  readonly target: ResolvedSpecificationLinkTarget;
}

export interface LiveResolvedSpecificationLink
  extends ResolvedSpecificationLinkBase {
  readonly status: ResolvedSpecificationLinkStatus.Live;
}

export interface DeadResolvedSpecificationLink
  extends ResolvedSpecificationLinkBase {
  readonly status: ResolvedSpecificationLinkStatus.Dead;
  readonly reason: DeadReason;
}

export type ResolvedSpecificationLink =
  | LiveResolvedSpecificationLink
  | DeadResolvedSpecificationLink;
