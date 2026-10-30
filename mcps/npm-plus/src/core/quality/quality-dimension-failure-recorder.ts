import { injectable } from "inversify";
import { InspectTargetQualityException } from "../model/inspect-target-quality";

@injectable()
export class QualityDimensionFailureRecorder {
  public record(error: unknown): InspectTargetQualityException {
    if (error instanceof Error) {
      return new InspectTargetQualityException(error.name, error.message);
    }
    return new InspectTargetQualityException("Error", String(error));
  }
}
