import { Container } from "inversify";
import { describe, expect, it } from "vitest";

import { container as directContainer } from "./container.js";
import { container as publicContainer } from "./index.js";

describe("md-linkage dependency injection container", () => {
  it("exports one working Inversify container", () => {
    const token = Symbol("test-value");

    expect(publicContainer).toBe(directContainer);
    expect(publicContainer).toBeInstanceOf(Container);

    publicContainer.bind(token).toConstantValue("resolved");

    expect(publicContainer.get(token)).toBe("resolved");
  });
});
