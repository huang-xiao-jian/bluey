import { describe, expect, it } from "vitest";
import { PackageNotFound } from "../errors/target-determination-errors";
import { InspectDelegation } from "../model/inspect-delegation";
import type {
  NpmPackageManifestResolution,
  NpmPackageRegistry,
} from "../ports/npm-package-registry";
import { InspectTargetDeterminer } from "./inspect-target-determiner";

class StubRegistry implements NpmPackageRegistry {
  public constructor(
    private readonly resolution: NpmPackageManifestResolution | Error,
  ) {}

  public async readLatestManifest(): Promise<NpmPackageManifestResolution> {
    if (this.resolution instanceof Error) throw this.resolution;
    return this.resolution;
  }
}

describe("InspectTargetDeterminer", () => {
  it("should determine the latest published version", async () => {
    const manifest = {
      name: "example-package",
      version: "2.0.0",
      dependencies: { dependency: "^4.0.0" },
    };
    const determiner = new InspectTargetDeterminer(
      new StubRegistry({ exactVersion: "2.0.0", manifest }),
    );

    const result = await determiner.determine(
      new InspectDelegation("example-package"),
    );

    expect(result).toEqual({
      target: {
        packageName: "example-package",
        exactVersion: "2.0.0",
        tag: "latest",
      },
      manifest,
    });
  });

  it("should propagate PackageNotFound", async () => {
    const determiner = new InspectTargetDeterminer(
      new StubRegistry(new PackageNotFound("missing-package")),
    );

    await expect(
      determiner.determine(new InspectDelegation("missing-package")),
    ).rejects.toBeInstanceOf(PackageNotFound);
  });
});
