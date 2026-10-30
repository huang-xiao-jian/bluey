import { describe, expect, it } from "vitest";
import { InspectHandler } from "../facade/inspect-handler";
import { createInspectHandler } from "./cli-composition";

describe("createInspectHandler", () => {
  it("should resolve a fully injected CLI handler", () => {
    expect(createInspectHandler()).toBeInstanceOf(InspectHandler);
  });

  it("should create an independent handler for each CLI application", () => {
    expect(createInspectHandler()).not.toBe(createInspectHandler());
  });
});
