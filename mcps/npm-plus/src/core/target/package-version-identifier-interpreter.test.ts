import { describe, expect, it } from "vitest";
import {
  isUnsupportedVersionRange,
  PackageVersionIdentifierInterpreter,
} from "./package-version-identifier-interpreter";

describe("PackageVersionIdentifierInterpreter", () => {
  const interpreter = new PackageVersionIdentifierInterpreter();

  it.each([
    [undefined, { kind: "tag", tag: "latest" }],
    ["latest", { kind: "tag", tag: "latest" }],
    ["v1.2.3", { kind: "exact", exactVersion: "1.2.3" }],
  ] as const)("should interpret %s", (input, expected) => {
    expect(interpreter.interpret(input)).toEqual(expected);
  });

  it.each(["^1.2.3", ">=1 <2", "1.x", "*"])(
    "should identify unsupported range %s",
    (input) => {
      expect(isUnsupportedVersionRange(input)).toBe(true);
    },
  );

  it.each(["latest", "next", "2026-preview", "1.2.3"])(
    "should not identify supported identifier %s as a range",
    (input) => {
      expect(isUnsupportedVersionRange(input)).toBe(false);
    },
  );
});
