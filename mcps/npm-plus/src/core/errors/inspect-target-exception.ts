export enum InspectTargetExceptionCode {
  PackageNotFound = "PACKAGE_NOT_FOUND",
  ExactVersionNotFound = "EXACT_VERSION_NOT_FOUND",
  TagNotFound = "TAG_NOT_FOUND",
  TagUnresolvable = "TAG_UNRESOLVABLE",
  RegistryError = "REGISTRY_ERROR",
  InspectTargetDeterminationFailed = "INSPECT_TARGET_DETERMINATION_FAILED",
}

export class InspectTargetException extends Error {
  public override readonly name = "InspectTargetException";

  public constructor(
    public readonly code: InspectTargetExceptionCode,
    message: string,
  ) {
    super(message);
  }
}
