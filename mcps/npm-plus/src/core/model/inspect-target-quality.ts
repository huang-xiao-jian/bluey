export enum DirectDependencyKind {
  Runtime = "runtime",
  Optional = "optional",
  Peer = "peer",
}

export interface DirectDependencyDeclarationFact {
  readonly packageName: string;
  readonly kind: DirectDependencyKind;
  readonly declaredRange: string;
  readonly bundled: boolean;
  readonly peerOptional?: boolean;
}

export interface DirectDependencyCountFact {
  readonly runtimeCount: number;
  readonly optionalCount: number;
  readonly peerCount: number;
  readonly bundledCount: number;
}

export interface InspectTargetDependencyScaleQuality {
  readonly directDependencyDeclarations: readonly DirectDependencyDeclarationFact[];
  readonly directDependencyCounts: DirectDependencyCountFact;
}

export interface InspectTargetQualityException {
  readonly name: string;
  readonly message: string;
}

export interface InspectTargetQuality {
  readonly dependencyScale?: InspectTargetDependencyScaleQuality;
  readonly exceptions: readonly InspectTargetQualityException[];
}
