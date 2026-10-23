export enum SpecificationLinkType {
  LocalFile = "local-file",
  InFileAnchor = "in-file-anchor",
  CrossFileAnchor = "cross-file-anchor",
}

interface SpecificationLinkBase {
  readonly text: string;
  readonly name: string;
}

export interface LocalFileSpecificationLink extends SpecificationLinkBase {
  readonly type: SpecificationLinkType.LocalFile;
  readonly path: string;
}

export interface InFileAnchorSpecificationLink extends SpecificationLinkBase {
  readonly type: SpecificationLinkType.InFileAnchor;
  readonly anchor: string;
}

export interface CrossFileAnchorSpecificationLink extends SpecificationLinkBase {
  readonly type: SpecificationLinkType.CrossFileAnchor;
  readonly path: string;
  readonly anchor: string;
}

export type SpecificationLink =
  | LocalFileSpecificationLink
  | InFileAnchorSpecificationLink
  | CrossFileAnchorSpecificationLink;
