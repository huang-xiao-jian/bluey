import { describe, expect, it } from "vitest";
import {
  InspectTargetDependencyScaleQuality,
  InspectTargetQuality,
  InspectTargetQualityException,
} from "../model/inspect-target-quality";
import { InspectTargetQualityFabricator } from "./inspect-target-quality-fabricator";

describe("InspectTargetQualityFabricator", () => {
  it("should create quality from successful dimensions and flat exceptions", () => {
    const scale = new InspectTargetDependencyScaleQuality([], {
      runtimeCount: 0,
      optionalCount: 0,
      peerCount: 0,
      bundledCount: 0,
    });
    const exception = new InspectTargetQualityException("ExampleError", "example");

    const result = new InspectTargetQualityFabricator().fabricate(scale, [exception]);

    expect(result).toBeInstanceOf(InspectTargetQuality);
    expect(result).toEqual({ dependencyScale: scale, exceptions: [exception] });
  });
});
