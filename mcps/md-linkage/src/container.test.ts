import { Container, inject, injectable } from "inversify";
import { describe, expect, it } from "vitest";

import { container as directContainer } from "./container.js";
import { container as publicContainer } from "./index.js";

@injectable()
class TestRepository {}

@injectable()
class TestService {
  constructor(
    @inject(TestRepository) readonly repository: TestRepository,
  ) {}
}

describe("md-linkage dependency injection container", () => {
  it("resolves explicitly bound classes by constructor token", () => {
    expect(publicContainer).toBe(directContainer);
    expect(publicContainer).toBeInstanceOf(Container);
    expect(() => publicContainer.get(TestService)).toThrow();

    publicContainer.bind(TestRepository).toSelf();
    publicContainer.bind(TestService).toSelf();

    const service = publicContainer.get(TestService);

    expect(service).toBeInstanceOf(TestService);
    expect(service.repository).toBeInstanceOf(TestRepository);
  });
});
