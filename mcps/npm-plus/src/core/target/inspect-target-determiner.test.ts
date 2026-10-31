import { describe, expect, it } from "vitest";
import {
  PackageNotFound,
  RegistryRequestError,
  RegistryResponseError,
} from "../errors/target-determination-errors";
import {
  InspectTargetException,
  InspectTargetExceptionCode,
} from "../errors/inspect-target-exception";
import { InspectDelegation } from "../model/inspect-delegation";
import { InspectTarget } from "../model/inspect-target";
import {
  type NpmPackageDocument,
  type NpmPackageManifestResolution,
  NpmPackageRegistry,
} from "../ports/npm-package-registry";
import { InspectTargetDeterminer } from "./inspect-target-determiner";
import { InspectTargetFailureExplainer } from "./inspect-target-failure-explainer";
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
    new InspectTargetFailureExplainer(),
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

  it("should explain an absent exact version without exposing the internal error", async () => {
    const determiner = createDeterminer(
      new MissingManifestRegistry(),
    );

    await expect(
      determiner.determine(
        new InspectDelegation("example-package", "3.0.0"),
      ),
    ).rejects.toEqual(
      new InspectTargetException(
        InspectTargetExceptionCode.ExactVersionNotFound,
        "npm package“example-package”没有发布版本“3.0.0”，请确认精确版本号是否正确。",
      ),
    );
  });

  it("should explain an absent tag without exposing the internal error", async () => {
    const determiner = createDeterminer(
      new MissingManifestRegistry(),
    );

    await expect(
      determiner.determine(new InspectDelegation("example-package", "next")),
    ).rejects.toEqual(
      new InspectTargetException(
        InspectTargetExceptionCode.TagNotFound,
        "npm package“example-package”没有“next”tag，请确认 tag 是否正确。",
      ),
    );
  });

  it("should explain a tag that points to an absent version", async () => {
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
    ).rejects.toEqual(
      new InspectTargetException(
        InspectTargetExceptionCode.TagUnresolvable,
        "npm package“example-package”的“dangling”tag 未指向已发布版本，请尝试其他 tag 或精确版本号。",
      ),
    );
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

  it("should explain an absent package without exposing the internal error", async () => {
    const determiner = createDeterminer(
      new StubRegistry(new PackageNotFound("missing-package")),
    );

    await expect(
      determiner.determine(new InspectDelegation("missing-package")),
    ).rejects.toEqual(
      new InspectTargetException(
        InspectTargetExceptionCode.PackageNotFound,
        "npm Registry 中未找到 package“missing-package”，请确认名称是否正确以及该 package 是否已发布。",
      ),
    );
  });

  it.each([
    new RegistryRequestError(
      "无法连接 npm Registry，未能获取 package“example-package”的信息，请检查网络连接或稍后重试。",
    ),
    new RegistryResponseError(
      "npm Registry 返回的 package“example-package”数据无效，无法确定检查版本。",
    ),
  ])("should preserve semantic Registry exception messages", async (registryError) => {
    const determiner = createDeterminer(new StubRegistry(registryError));

    await expect(
      determiner.determine(new InspectDelegation("example-package")),
    ).rejects.toEqual(
      new InspectTargetException(
        InspectTargetExceptionCode.RegistryError,
        registryError.message,
      ),
    );
  });

  it("should add target context to an unexpected semantic message", async () => {
    const determiner = createDeterminer(
      new StubRegistry(new Error("版本解释器无法识别委托中的版本标识。")),
    );

    await expect(
      determiner.determine(new InspectDelegation("example-package")),
    ).rejects.toEqual(
      new InspectTargetException(
        InspectTargetExceptionCode.InspectTargetDeterminationFailed,
        "确定 npm package“example-package”的检查版本时发生异常：版本解释器无法识别委托中的版本标识。",
      ),
    );
  });
});
