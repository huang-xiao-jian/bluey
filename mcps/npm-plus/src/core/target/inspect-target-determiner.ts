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

export interface DeterminedInspectTarget {
  readonly target: InspectTarget;
  readonly manifest: NpmPackageManifest;
}

export interface InspectTargetDetermination {
  determine(delegation: InspectDelegation): Promise<DeterminedInspectTarget>;
}

@injectable()
export class InspectTargetDeterminer implements InspectTargetDetermination {
  public constructor(
    private readonly registry: NpmPackageRegistry,
    private readonly interpreter: PackageVersionIdentifierInterpreter,
  ) {}

  public async determine(
    delegation: InspectDelegation,
  ): Promise<DeterminedInspectTarget> {
    const document = await this.registry.readPackage(delegation.packageName);
    const identifier = this.interpreter.interpret(
      delegation.versionIdentifier,
    );

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
