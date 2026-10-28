export type NpmPackageManifest = unknown;

export interface NpmPackageManifestResolution {
  readonly exactVersion: string;
  readonly manifest: NpmPackageManifest;
}

export interface NpmPackageDocument {
  readonly name: string;
  readonly distTags: Readonly<Record<string, string>>;
  readonly versions: Readonly<Record<string, NpmPackageManifest>>;
}

export abstract class NpmPackageRegistry {
  public abstract readManifest(
    packageName: string,
    versionIdentifier: string,
  ): Promise<NpmPackageManifestResolution | undefined>;

  public abstract readPackage(packageName: string): Promise<NpmPackageDocument>;
}
