import { z } from "zod";
import {
  PackageNotFound,
  RegistryRequestError,
  RegistryResponseError,
} from "../../core/errors/target-determination-errors";
import {
  type NpmPackageDocument,
  type NpmPackageManifestResolution,
  NpmPackageRegistry,
} from "../../core/ports/npm-package-registry";

const RegistryManifestSchema = z.object({ version: z.string() }).passthrough();
const RegistryDocumentSchema = z.object({
  name: z.string(),
  "dist-tags": z.record(z.string()),
  versions: z.record(z.unknown()),
});
const AbbreviatedMetadataAccept =
  "application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8";

export class NodeNpmPackageRegistry extends NpmPackageRegistry {
  public constructor(
    private readonly fetcher: typeof fetch,
    registryUrl: string,
  ) {
    super();
    this.registryUrl = registryUrl.replace(/\/+$/, "");
  }

  private readonly registryUrl: string;

  public async readManifest(
    packageName: string,
    versionIdentifier = "latest",
  ): Promise<NpmPackageManifestResolution | undefined> {
    const url = [
      this.registryUrl,
      encodeURIComponent(packageName),
      encodeURIComponent(versionIdentifier),
    ].join("/");
    let response: Response;
    try {
      response = await this.fetcher(url, {
        headers: { accept: "application/json" },
      });
    } catch {
      throw new RegistryRequestError(
        `无法连接 npm Registry，未能获取 package“${packageName}”的信息，请检查网络连接或稍后重试。`,
      );
    }

    if (response.status === 404) return undefined;
    if (!response.ok) {
      throw new RegistryRequestError(
        `npm Registry 返回 HTTP ${response.status}，当前无法获取 package“${packageName}”的信息。`,
      );
    }

    try {
      const manifest = RegistryManifestSchema.parse(await response.json());
      return { exactVersion: manifest.version, manifest };
    } catch {
      throw new RegistryResponseError(
        `npm Registry 返回的 package“${packageName}”数据无效，无法确定检查版本。`,
      );
    }
  }

  public async readPackage(packageName: string): Promise<NpmPackageDocument> {
    const url = `${this.registryUrl}/${encodeURIComponent(packageName)}`;
    let response: Response;
    try {
      response = await this.fetcher(url, {
        headers: { accept: AbbreviatedMetadataAccept },
      });
    } catch {
      throw new RegistryRequestError(
        `无法连接 npm Registry，未能获取 package“${packageName}”的信息，请检查网络连接或稍后重试。`,
      );
    }

    if (response.status === 404) throw new PackageNotFound(packageName);
    if (!response.ok) {
      throw new RegistryRequestError(
        `npm Registry 返回 HTTP ${response.status}，当前无法获取 package“${packageName}”的信息。`,
      );
    }

    try {
      const document = RegistryDocumentSchema.parse(await response.json());
      return {
        name: document.name,
        distTags: document["dist-tags"],
        versions: document.versions,
      };
    } catch {
      throw new RegistryResponseError(
        `npm Registry 返回的 package“${packageName}”数据无效，无法确定检查版本。`,
      );
    }
  }
}
