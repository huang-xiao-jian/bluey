export class PackageNotFound extends Error {
  public override readonly name = "PackageNotFound";

  public constructor(packageName: string) {
    super(`Package not found: ${packageName}`);
  }
}

export class ExactVersionNotFound extends Error {
  public override readonly name = "ExactVersionNotFound";

  public constructor(packageName: string, exactVersion: string) {
    super(`Exact version not found: ${packageName}@${exactVersion}`);
  }
}

export class TagNotFound extends Error {
  public override readonly name = "TagNotFound";

  public constructor(packageName: string, tag: string) {
    super(`Tag not found: ${packageName}@${tag}`);
  }
}

export class TagUnresolvable extends Error {
  public override readonly name = "TagUnresolvable";

  public constructor(packageName: string, tag: string, exactVersion: string) {
    super(
      `Tag does not resolve to an existing exact version: ${packageName}@${tag} -> ${exactVersion}`,
    );
  }
}

export class RegistryRequestError extends Error {
  public override readonly name = "RegistryRequestError";
}

export class RegistryResponseError extends Error {
  public override readonly name = "RegistryResponseError";
}
