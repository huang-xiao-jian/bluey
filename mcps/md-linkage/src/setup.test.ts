import { Container, injectable } from "inversify";
import { describe, expect, it } from "vitest";

@injectable()
class TestRepository {}

@injectable()
class TestService {
  constructor(readonly repository: TestRepository) {}
}

describe("md-linkage dependency injection container", () => {
  it("resolves explicitly bound classes by constructor token", () => {
    const container = new Container();

    container.bind(TestRepository).toSelf();
    container.bind(TestService).toSelf();

    const service = container.get(TestService);

    expect(service).toBeInstanceOf(TestService);
    expect(service.repository).toBeInstanceOf(TestRepository);
  });
});
