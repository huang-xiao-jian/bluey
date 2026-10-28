export type NpmPackageManifest = unknown;

export interface NpmPackageDocument {
  readonly name: string;
  readonly distTags: Readonly<Record<string, string>>;
  readonly versions: Readonly<Record<string, NpmPackageManifest>>;
}

export abstract class NpmPackageRegistry {
  public abstract readPackage(packageName: string): Promise<NpmPackageDocument>;
}
