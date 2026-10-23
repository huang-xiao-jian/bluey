import { describe, expect, it } from "vitest";
import { SpecificationDocumentRepository } from "./specification-document-repository";

describe("SpecificationDocumentRepository", () => {
  it("supplies unique document identities in FIFO order", () => {
    const repository = new SpecificationDocumentRepository(["a.md", "b.md", "a.md"]);

    expect(repository.takeNext()).toBe("a.md");
    expect(repository.enqueue("a.md")).toBe(false);
    expect(repository.enqueue("c.md")).toBe(true);
    expect(repository.takeNext()).toBe("b.md");
    expect(repository.takeNext()).toBe("c.md");
    expect(repository.takeNext()).toBeUndefined();
  });

  it("recognizes identities in both pending and checked collections", () => {
    const repository = new SpecificationDocumentRepository(["a.md"]);

    expect(repository.has("a.md")).toBe(true);
    repository.takeNext();
    expect(repository.has("a.md")).toBe(true);
    expect(repository.has("missing.md")).toBe(false);
  });
});
