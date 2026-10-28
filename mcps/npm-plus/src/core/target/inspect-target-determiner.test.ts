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
  NpmPackageRegistry,
} from "../ports/npm-package-registry";
import { InspectTargetDeterminer } from "./inspect-target-determiner";
import { PackageVersionIdentifierInterpreter } from "./package-version-identifier-interpreter";

class StubRegistry implements NpmPackageRegistry {
  public constructor(
    private readonly document: NpmPackageDocument | Error,
  ) {}

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
): InspectTargetDeterminer {
  return new InspectTargetDeterminer(
    new StubRegistry(document),
    new PackageVersionIdentifierInterpreter(),
  );
}

describe("InspectTargetDeterminer", () => {
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
