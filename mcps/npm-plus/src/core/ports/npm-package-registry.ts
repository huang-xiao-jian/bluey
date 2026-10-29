export type NpmPackageManifest = unknown;

export interface NpmPackageManifestResolution {
  readonly exactVersion: string;
  readonly manifest: NpmPackageManifest;
}

export abstract class NpmPackageRegistry {
  public abstract readLatestManifest(
    packageName: string,
  ): Promise<NpmPackageManifestResolution>;
}
