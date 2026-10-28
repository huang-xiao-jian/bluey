import { z } from "zod";
import {
  PackageNotFound,
  RegistryRequestError,
  RegistryResponseError,
} from "../../core/errors/target-determination-errors";
import {
  type NpmPackageDocument,
  NpmPackageRegistry,
} from "../../core/ports/npm-package-registry";

const RegistryDocumentSchema = z.object({
  name: z.string(),
  "dist-tags": z.record(z.string()),
  versions: z.record(z.unknown()),
});

export class NodeNpmPackageRegistry extends NpmPackageRegistry {
  public constructor(
    private readonly fetcher: typeof fetch = globalThis.fetch,
    registryUrl = process.env.NPM_CONFIG_REGISTRY ?? "https://registry.npmjs.org",
  ) {
    super();
    this.registryUrl = registryUrl.replace(/\/+$/, "");
  }

  private readonly registryUrl: string;

  public async readPackage(packageName: string): Promise<NpmPackageDocument> {
    const url = `${this.registryUrl}/${encodeURIComponent(packageName)}`;
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
      const document = RegistryDocumentSchema.parse(await response.json());
      return {
        name: document.name,
        distTags: document["dist-tags"],
        versions: document.versions,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new RegistryResponseError(
        `Invalid npm Registry response for ${packageName}: ${message}`,
      );
    }
  }
}
