import type { InspectDelegation } from "../core/model/inspect-delegation";
import type { InspectTarget } from "../core/model/inspect-target";
import type { InspectTargetQuality } from "../core/model/inspect-target-quality";

export interface InspectResult {
  readonly delegation: InspectDelegation;
  readonly target: InspectTarget;
  readonly quality: InspectTargetQuality;
}
