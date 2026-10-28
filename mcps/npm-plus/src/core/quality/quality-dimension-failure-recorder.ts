import { injectable } from "inversify";
import type { InspectTargetQualityException } from "../model/inspect-target-quality";

@injectable()
export class QualityDimensionFailureRecorder {
  public record(error: unknown): InspectTargetQualityException {
    if (error instanceof Error) {
      return { name: error.name, message: error.message };
    }
    return { name: "Error", message: String(error) };
  }
}
