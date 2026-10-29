export class PackageNotFound extends Error {
  public override readonly name = "PackageNotFound";

  public constructor(packageName: string) {
    super(`Package not found: ${packageName}`);
  }
}

export class RegistryRequestError extends Error {
  public override readonly name = "RegistryRequestError";
}

export class RegistryResponseError extends Error {
  public override readonly name = "RegistryResponseError";
}
