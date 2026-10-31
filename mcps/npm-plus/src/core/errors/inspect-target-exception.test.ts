import { describe, expect, it } from "vitest";
import {
  InspectTargetException,
  InspectTargetExceptionCode,
} from "./inspect-target-exception";

describe("InspectTargetException", () => {
  it("should be a standard error", () => {
    expect(
      new InspectTargetException(
        InspectTargetExceptionCode.PackageNotFound,
        "package not found",
      ),
    ).toBeInstanceOf(Error);
  });
});
