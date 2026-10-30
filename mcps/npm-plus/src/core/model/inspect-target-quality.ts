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

export class InspectTargetDependencyScaleQuality {
  public constructor(
    public readonly directDependencyDeclarations: readonly DirectDependencyDeclarationFact[],
    public readonly directDependencyCounts: DirectDependencyCountFact,
  ) {}
}

export class InspectTargetQualityException {
  public constructor(
    public readonly name: string,
    public readonly message: string,
  ) {}
}

export class InspectTargetQuality {
  public constructor(
    public readonly dependencyScale: InspectTargetDependencyScaleQuality | undefined,
    public readonly exceptions: readonly InspectTargetQualityException[],
  ) {}
}
