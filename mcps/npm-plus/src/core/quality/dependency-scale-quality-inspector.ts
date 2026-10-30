import { injectable } from "inversify";
import { z } from "zod";
import type { InspectTarget } from "../model/inspect-target";
import {
  DirectDependencyKind,
  type DirectDependencyDeclarationFact,
  InspectTargetDependencyScaleQuality,
} from "../model/inspect-target-quality";
import type { NpmPackageManifest } from "../ports/npm-package-registry";

const DependencyMapSchema = z.record(z.string()).optional();
const BundleSchema = z.union([z.array(z.string()), z.boolean()]).optional();
const DependencyFieldsSchema = z.object({
  dependencies: DependencyMapSchema,
  optionalDependencies: DependencyMapSchema,
  peerDependencies: DependencyMapSchema,
  peerDependenciesMeta: z
    .record(z.object({ optional: z.boolean().optional() }).passthrough())
    .optional(),
  bundledDependencies: BundleSchema,
  bundleDependencies: BundleSchema,
});

export class PackageManifestReadError extends Error {
  public override readonly name = "PackageManifestReadError";

  public constructor(message: string) {
    super(message);
  }
}

@injectable()
export class DependencyScaleQualityInspector {
  public inspect(
    _target: InspectTarget,
    manifest: NpmPackageManifest,
  ): InspectTargetDependencyScaleQuality {
    const parsed = DependencyFieldsSchema.safeParse(manifest);
    if (!parsed.success) {
      throw new PackageManifestReadError(
        "Unable to read dependency declarations from the published package manifest.",
      );
    }

    const optional = parsed.data.optionalDependencies ?? {};
    const runtime = Object.fromEntries(
      Object.entries(parsed.data.dependencies ?? {}).filter(
        ([packageName]) => !(packageName in optional),
      ),
    );
    const peer = parsed.data.peerDependencies ?? {};
    const bundled = this.bundledPackageNames(
      parsed.data.bundledDependencies,
      parsed.data.bundleDependencies,
      runtime,
      optional,
    );

    const declarations: DirectDependencyDeclarationFact[] = [
      ...this.declarations(runtime, DirectDependencyKind.Runtime, bundled),
      ...this.declarations(optional, DirectDependencyKind.Optional, bundled),
      ...Object.entries(peer)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([packageName, declaredRange]) => ({
          packageName,
          kind: DirectDependencyKind.Peer,
          declaredRange,
          bundled: false,
          ...(parsed.data.peerDependenciesMeta?.[packageName]?.optional === true
            ? { peerOptional: true }
            : {}),
        })),
    ];

    return new InspectTargetDependencyScaleQuality(declarations, {
      runtimeCount: Object.keys(runtime).length,
      optionalCount: Object.keys(optional).length,
      peerCount: Object.keys(peer).length,
      bundledCount: declarations.filter((declaration) => declaration.bundled)
        .length,
    });
  }

  private declarations(
    dependencies: Readonly<Record<string, string>>,
    kind: DirectDependencyKind.Runtime | DirectDependencyKind.Optional,
    bundled: ReadonlySet<string>,
  ): DirectDependencyDeclarationFact[] {
    return Object.entries(dependencies)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([packageName, declaredRange]) => ({
        packageName,
        kind,
        declaredRange,
        bundled: bundled.has(packageName),
      }));
  }

  private bundledPackageNames(
    primary: readonly string[] | boolean | undefined,
    alias: readonly string[] | boolean | undefined,
    runtime: Readonly<Record<string, string>>,
    optional: Readonly<Record<string, string>>,
  ): ReadonlySet<string> {
    if (primary === true || alias === true) {
      return new Set([...Object.keys(runtime), ...Object.keys(optional)]);
    }
    return new Set([
      ...(Array.isArray(primary) ? primary : []),
      ...(Array.isArray(alias) ? alias : []),
    ]);
  }
}
