import { describe, expect, it } from "vitest";
import { PackageNotFound } from "../errors/target-determination-errors";
import { InspectDelegation } from "../model/inspect-delegation";
import { InspectTarget } from "../model/inspect-target";
import {
  type NpmPackageDocument,
  type NpmPackageManifestResolution,
  NpmPackageRegistry,
} from "../ports/npm-package-registry";
import { InspectTargetDeterminer } from "./inspect-target-determiner";
import { PackageVersionIdentifierInterpreter } from "./package-version-identifier-interpreter";

class StubRegistry implements NpmPackageRegistry {
  public requestedVersionIdentifier: string | undefined;

  public constructor(
    private readonly resolution: NpmPackageManifestResolution | Error,
  ) {}

  public async readManifest(
    _packageName?: string,
    versionIdentifier?: string,
  ): Promise<NpmPackageManifestResolution | undefined> {
    this.requestedVersionIdentifier = versionIdentifier;
    if (this.resolution instanceof Error) throw this.resolution;
    return this.resolution;
  }

  public async readPackage(): Promise<never> {
    throw new Error("Unexpected package metadata fallback");
  }
}

class MissingManifestRegistry extends NpmPackageRegistry {
  public constructor(
    private readonly document: NpmPackageDocument = {
      name: "example-package",
      distTags: { latest: "2.0.0" },
      versions: { "2.0.0": { version: "2.0.0" } },
    },
  ) {
    super();
  }

  public async readManifest(): Promise<undefined> {
    return undefined;
  }

  public async readPackage(): Promise<NpmPackageDocument> {
    return this.document;
  }
}

function createDeterminer(registry: NpmPackageRegistry): InspectTargetDeterminer {
  return new InspectTargetDeterminer(
    registry,
    new PackageVersionIdentifierInterpreter(),
  );
}

describe("InspectTargetDeterminer", () => {
  it("should retain an explicitly requested tag", async () => {
    const manifest = {
      name: "example-package",
      version: "1.2.3",
      dependencies: { dependency: "^4.0.0" },
    };
    const determiner = createDeterminer(
      new StubRegistry({ exactVersion: "1.2.3", manifest }),
    );

    const result = await determiner.determine(
      new InspectDelegation("example-package", "stable"),
    );

    expect(result).toEqual({
      target: {
        packageName: "example-package",
        exactVersion: "1.2.3",
        tag: "stable",
      },
      manifest,
    });
  });

  it("should normalize an exact version and omit the target tag", async () => {
    const manifest = { name: "example-package", version: "1.2.3" };
    const registry = new StubRegistry({ exactVersion: "1.2.3", manifest });
    const determiner = createDeterminer(registry);

    const result = await determiner.determine(
      new InspectDelegation("example-package", "v1.2.3"),
    );

    expect(registry.requestedVersionIdentifier).toBe("1.2.3");
    expect(result.target).toEqual({
      packageName: "example-package",
      exactVersion: "1.2.3",
    });
  });

  it("should report an absent exact version", async () => {
    const determiner = createDeterminer(
      new MissingManifestRegistry(),
    );

    await expect(
      determiner.determine(
        new InspectDelegation("example-package", "3.0.0"),
      ),
    ).rejects.toMatchObject({ name: "ExactVersionNotFound" });
  });

  it("should report an absent tag", async () => {
    const determiner = createDeterminer(
      new MissingManifestRegistry(),
    );

    await expect(
      determiner.determine(new InspectDelegation("example-package", "next")),
    ).rejects.toMatchObject({ name: "TagNotFound" });
  });

  it("should report a tag that points to an absent version", async () => {
    const determiner = createDeterminer(
      new MissingManifestRegistry({
        name: "example-package",
        distTags: { dangling: "3.0.0" },
        versions: {},
      }),
    );

    await expect(
      determiner.determine(
        new InspectDelegation("example-package", "dangling"),
      ),
    ).rejects.toMatchObject({ name: "TagUnresolvable" });
  });

  it("should determine the latest published version", async () => {
    const manifest = {
      name: "example-package",
      version: "2.0.0",
      dependencies: { dependency: "^4.0.0" },
    };
    const determiner = createDeterminer(
      new StubRegistry({ exactVersion: "2.0.0", manifest }),
    );

    const result = await determiner.determine(
      new InspectDelegation("example-package"),
    );

    expect(result.target).toBeInstanceOf(InspectTarget);
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
    const determiner = createDeterminer(
      new StubRegistry(new PackageNotFound("missing-package")),
    );

    await expect(
      determiner.determine(new InspectDelegation("missing-package")),
    ).rejects.toBeInstanceOf(PackageNotFound);
  });
});
