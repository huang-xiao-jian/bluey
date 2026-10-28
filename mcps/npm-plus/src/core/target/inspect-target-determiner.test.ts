import { describe, expect, it } from "vitest";
import {
  ExactVersionNotFound,
  PackageNotFound,
  TagNotFound,
  TagUnresolvable,
} from "../errors/target-determination-errors";
import { InspectDelegation } from "../model/inspect-delegation";
import type {
  NpmPackageDocument,
  NpmPackageManifestResolution,
  NpmPackageRegistry,
} from "../ports/npm-package-registry";
import { InspectTargetDeterminer } from "./inspect-target-determiner";
import { PackageVersionIdentifierInterpreter } from "./package-version-identifier-interpreter";

class StubRegistry implements NpmPackageRegistry {
  public constructor(
    private readonly document: NpmPackageDocument | Error,
    private readonly manifests:
      | Readonly<Record<string, NpmPackageManifestResolution>>
      | Error = {},
  ) {}

  public async readManifest(
    _packageName: string,
    versionIdentifier: string,
  ): Promise<NpmPackageManifestResolution | undefined> {
    if (this.manifests instanceof Error) throw this.manifests;
    return this.manifests[versionIdentifier];
  }

  public async readPackage(): Promise<NpmPackageDocument> {
    if (this.document instanceof Error) throw this.document;
    return this.document;
  }
}

const packageDocument: NpmPackageDocument = {
  name: "example-package",
  distTags: { latest: "2.0.0", stable: "1.2.3", dangling: "9.9.9" },
  versions: {
    "1.2.3": { name: "example-package", version: "1.2.3" },
    "2.0.0": { name: "example-package", version: "2.0.0" },
  },
};

function createDeterminer(
  document: NpmPackageDocument | Error = packageDocument,
  manifests:
    | Readonly<Record<string, NpmPackageManifestResolution>>
    | Error = {},
): InspectTargetDeterminer {
  return new InspectTargetDeterminer(
    new StubRegistry(document, manifests),
    new PackageVersionIdentifierInterpreter(),
  );
}

describe("InspectTargetDeterminer", () => {
  it("should resolve a tag through one manifest request without reading package metadata", async () => {
    const manifest = {
      name: "example-package",
      version: "1.2.3",
      dependencies: { dependency: "^4.0.0" },
    };
    const result = await createDeterminer(new Error("unexpected fallback"), {
      stable: { exactVersion: "1.2.3", manifest },
    }).determine(new InspectDelegation("example-package", "stable"));

    expect(result).toEqual({
      target: {
        packageName: "example-package",
        exactVersion: "1.2.3",
        tag: "stable",
      },
      manifest,
    });
  });

  it("should normalize an exact version before requesting its manifest", async () => {
    const manifest = { name: "example-package", version: "1.2.3" };
    const result = await createDeterminer(new Error("unexpected fallback"), {
      "1.2.3": { exactVersion: "1.2.3", manifest },
    }).determine(new InspectDelegation("example-package", "v1.2.3"));

    expect(result).toEqual({
      target: {
        packageName: "example-package",
        exactVersion: "1.2.3",
      },
      manifest,
    });
  });

  it("should request the latest manifest when the version identifier is omitted", async () => {
    const manifest = { name: "example-package", version: "2.0.0" };
    const result = await createDeterminer(new Error("unexpected fallback"), {
      latest: { exactVersion: "2.0.0", manifest },
    }).determine(new InspectDelegation("example-package"));

    expect(result).toEqual({
      target: {
        packageName: "example-package",
        exactVersion: "2.0.0",
        tag: "latest",
      },
      manifest,
    });
  });

  it("should propagate a manifest request failure without reading package metadata", async () => {
    const requestError = new Error("request failed");

    await expect(
      createDeterminer(packageDocument, requestError).determine(
        new InspectDelegation("example-package"),
      ),
    ).rejects.toBe(requestError);
  });

  it("should retain the tag and resolved exact version", async () => {
    const result = await createDeterminer().determine(
      new InspectDelegation("example-package", "stable"),
    );

    expect(result.target).toEqual({
      packageName: "example-package",
      exactVersion: "1.2.3",
      tag: "stable",
    });
    expect(result.manifest).toBe(packageDocument.versions["1.2.3"]);
  });

  it("should normalize and resolve an exact version", async () => {
    const result = await createDeterminer().determine(
      new InspectDelegation("example-package", "v1.2.3"),
    );

    expect(result.target).toEqual({
      packageName: "example-package",
      exactVersion: "1.2.3",
    });
  });

  it("should use latest when the version identifier is omitted", async () => {
    const result = await createDeterminer().determine(
      new InspectDelegation("example-package"),
    );

    expect(result.target).toEqual({
      packageName: "example-package",
      exactVersion: "2.0.0",
      tag: "latest",
    });
  });

  it("should propagate PackageNotFound", async () => {
    await expect(
      createDeterminer(new PackageNotFound("missing-package")).determine(
        new InspectDelegation("missing-package"),
      ),
    ).rejects.toBeInstanceOf(PackageNotFound);
  });

  it("should throw ExactVersionNotFound for an absent exact version", async () => {
    await expect(
      createDeterminer().determine(
        new InspectDelegation("example-package", "3.0.0"),
      ),
    ).rejects.toBeInstanceOf(ExactVersionNotFound);
  });

  it("should throw TagNotFound for an absent tag", async () => {
    await expect(
      createDeterminer().determine(
        new InspectDelegation("example-package", "next"),
      ),
    ).rejects.toBeInstanceOf(TagNotFound);
  });

  it("should throw TagUnresolvable when a tag points to an absent version", async () => {
    await expect(
      createDeterminer().determine(
        new InspectDelegation("example-package", "dangling"),
      ),
    ).rejects.toBeInstanceOf(TagUnresolvable);
  });
});
