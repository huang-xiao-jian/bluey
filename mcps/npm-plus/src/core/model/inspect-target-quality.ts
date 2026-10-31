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
  public readonly directDependencyDeclarations: readonly DirectDependencyDeclarationFact[];
  public readonly directDependencyCounts: DirectDependencyCountFact;

  public constructor(
    directDependencyDeclarations: readonly DirectDependencyDeclarationFact[],
    directDependencyCounts: DirectDependencyCountFact,
  ) {
    this.directDependencyDeclarations = Object.freeze([
      ...directDependencyDeclarations,
    ]);
    this.directDependencyCounts = Object.freeze({
      ...directDependencyCounts,
    });
  }
}

export class InspectTargetQualityException {
  public constructor(
    public readonly name: string,
    public readonly message: string,
  ) {}
}

export class InspectTargetQuality {
  public readonly dependencyScale:
    | InspectTargetDependencyScaleQuality
    | undefined;
  public readonly exceptions: readonly InspectTargetQualityException[];

  public constructor(
    dependencyScale: InspectTargetDependencyScaleQuality | undefined,
    exceptions: readonly InspectTargetQualityException[],
  ) {
    this.dependencyScale = dependencyScale;
    this.exceptions = Object.freeze([...exceptions]);
  }
}
