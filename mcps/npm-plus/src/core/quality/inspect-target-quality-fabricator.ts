import { injectable } from "inversify";
import {
  InspectTargetQuality,
  type InspectTargetDependencyScaleQuality,
  type InspectTargetQualityException,
} from "../model/inspect-target-quality";

@injectable()
export class InspectTargetQualityFabricator {
  public fabricate(
    dependencyScale: InspectTargetDependencyScaleQuality | undefined,
    exceptions: readonly InspectTargetQualityException[],
  ): InspectTargetQuality {
    return new InspectTargetQuality(dependencyScale, exceptions);
  }
}
