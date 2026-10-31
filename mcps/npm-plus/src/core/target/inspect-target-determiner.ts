import { injectable } from "inversify";
import {
  ExactVersionNotFound,
  TagNotFound,
  TagUnresolvable,
} from "../errors/target-determination-errors";
import type { InspectDelegation } from "../model/inspect-delegation";
import { InspectTarget } from "../model/inspect-target";
import {
  type NpmPackageManifest,
  NpmPackageRegistry,
} from "../ports/npm-package-registry";
import { PackageVersionIdentifierInterpreter } from "./package-version-identifier-interpreter";
import { InspectTargetFailureExplainer } from "./inspect-target-failure-explainer";

export interface DeterminedInspectTarget {
  readonly target: InspectTarget;
  readonly manifest: NpmPackageManifest;
}

@injectable()
export class InspectTargetDeterminer {
  public constructor(
    private readonly registry: NpmPackageRegistry,
    private readonly interpreter: PackageVersionIdentifierInterpreter,
    private readonly failureExplainer: InspectTargetFailureExplainer,
  ) {}

  public async determine(
    delegation: InspectDelegation,
  ): Promise<DeterminedInspectTarget> {
    try {
      return await this.determineTarget(delegation);
    } catch (error) {
      throw this.failureExplainer.explain(error, delegation);
    }
  }

  private async determineTarget(
    delegation: InspectDelegation,
  ): Promise<DeterminedInspectTarget> {
    const identifier = this.interpreter.interpret(
      delegation.versionIdentifier,
    );
    const versionIdentifier =
      identifier.kind === "exact" ? identifier.exactVersion : identifier.tag;
    const resolution = await this.registry.readManifest(
      delegation.packageName,
      versionIdentifier,
    );
    if (resolution) {
      return {
        target: new InspectTarget(
          delegation.packageName,
          resolution.exactVersion,
          identifier.kind === "tag" ? identifier.tag : undefined,
        ),
        manifest: resolution.manifest,
      };
    }

    const document = await this.registry.readPackage(delegation.packageName);

    if (identifier.kind === "exact") {
      if (!Object.hasOwn(document.versions, identifier.exactVersion)) {
        throw new ExactVersionNotFound(
          delegation.packageName,
          identifier.exactVersion,
        );
      }
      const manifest = document.versions[identifier.exactVersion];
      return {
        target: new InspectTarget(
          delegation.packageName,
          identifier.exactVersion,
        ),
        manifest,
      };
    }

    const exactVersion = document.distTags[identifier.tag];
    if (!exactVersion) {
      throw new TagNotFound(delegation.packageName, identifier.tag);
    }
    if (!Object.hasOwn(document.versions, exactVersion)) {
      throw new TagUnresolvable(
        delegation.packageName,
        identifier.tag,
        exactVersion,
      );
    }
    const manifest = document.versions[exactVersion];
    return {
      target: new InspectTarget(
        delegation.packageName,
        exactVersion,
        identifier.tag,
      ),
      manifest,
    };
  }

}
