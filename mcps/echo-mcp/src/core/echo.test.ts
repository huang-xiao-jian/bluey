import { describe, expect, it } from "vitest";

import { echo } from "./echo";

describe("echo capability", () => {
  it("returns non-empty text unchanged", () => {
    expect(echo("Hello, Bluey!")).toBe("Hello, Bluey!");
  });
});
