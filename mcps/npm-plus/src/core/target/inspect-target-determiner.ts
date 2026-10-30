import { injectable } from "inversify";
import type { InspectDelegation } from "../model/inspect-delegation";
import { InspectTarget } from "../model/inspect-target";
import {
  type NpmPackageManifest,
  NpmPackageRegistry,
} from "../ports/npm-package-registry";

export interface DeterminedInspectTarget {
  readonly target: InspectTarget;
  readonly manifest: NpmPackageManifest;
}

@injectable()
export class InspectTargetDeterminer {
  public constructor(private readonly registry: NpmPackageRegistry) {}

  public async determine(
    delegation: InspectDelegation,
  ): Promise<DeterminedInspectTarget> {
    const resolution = await this.registry.readLatestManifest(
      delegation.packageName,
    );
    return {
      target: new InspectTarget(
        delegation.packageName,
        resolution.exactVersion,
      ),
      manifest: resolution.manifest,
    };
  }
}
