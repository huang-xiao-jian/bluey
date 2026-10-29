import { z } from "zod";
import {
  PackageNotFound,
  RegistryRequestError,
  RegistryResponseError,
} from "../../core/errors/target-determination-errors";
import {
  type NpmPackageManifestResolution,
  NpmPackageRegistry,
} from "../../core/ports/npm-package-registry";

const RegistryManifestSchema = z.object({ version: z.string() }).passthrough();

export class NodeNpmPackageRegistry extends NpmPackageRegistry {
  public constructor(
    private readonly fetcher: typeof fetch = globalThis.fetch,
    registryUrl = process.env.NPM_CONFIG_REGISTRY ?? "https://registry.npmjs.org",
  ) {
    super();
    this.registryUrl = registryUrl.replace(/\/+$/, "");
  }

  private readonly registryUrl: string;

  public async readLatestManifest(
    packageName: string,
  ): Promise<NpmPackageManifestResolution> {
    const url = [
      this.registryUrl,
      encodeURIComponent(packageName),
      "latest",
    ].join("/");
    let response: Response;
    try {
      response = await this.fetcher(url, {
        headers: { accept: "application/json" },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new RegistryRequestError(
        `Unable to request npm Registry package ${packageName}: ${message}`,
      );
    }

    if (response.status === 404) throw new PackageNotFound(packageName);
    if (!response.ok) {
      throw new RegistryRequestError(
        `npm Registry request failed for ${packageName}: HTTP ${response.status}`,
      );
    }

    try {
      const manifest = RegistryManifestSchema.parse(await response.json());
      return { exactVersion: manifest.version, manifest };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new RegistryResponseError(
        `Invalid npm Registry response for ${packageName}: ${message}`,
      );
    }
  }
}
