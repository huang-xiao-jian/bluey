export enum InspectTargetExceptionCode {
  PackageNotFound = "PACKAGE_NOT_FOUND",
  ExactVersionNotFound = "EXACT_VERSION_NOT_FOUND",
  TagNotFound = "TAG_NOT_FOUND",
  TagUnresolvable = "TAG_UNRESOLVABLE",
  RegistryError = "REGISTRY_ERROR",
  InspectTargetDeterminationFailed = "INSPECT_TARGET_DETERMINATION_FAILED",
}

export class InspectTargetException {
  public constructor(
    public readonly code: InspectTargetExceptionCode,
    public readonly message: string,
  ) {}
}
