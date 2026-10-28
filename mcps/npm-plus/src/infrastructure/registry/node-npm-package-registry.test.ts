import { describe, expect, it } from "vitest";
import {
  PackageNotFound,
  RegistryRequestError,
  RegistryResponseError,
} from "../../core/errors/target-determination-errors";
import { NodeNpmPackageRegistry } from "./node-npm-package-registry";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("NodeNpmPackageRegistry", () => {
  it("should encode a scoped package and map the Registry document", async () => {
    let requestedUrl = "";
    const registry = new NodeNpmPackageRegistry(async (input) => {
      requestedUrl = String(input);
      return jsonResponse({
        name: "@scope/example",
        "dist-tags": { latest: "1.0.0" },
        versions: {
          "1.0.0": { name: "@scope/example", version: "1.0.0" },
          broken: null,
        },
      });
    }, "https://registry.example.test/");

    const document = await registry.readPackage("@scope/example");

    expect(requestedUrl).toBe(
      "https://registry.example.test/%40scope%2Fexample",
    );
    expect(document).toEqual({
      name: "@scope/example",
      distTags: { latest: "1.0.0" },
      versions: {
        "1.0.0": { name: "@scope/example", version: "1.0.0" },
        broken: null,
      },
    });
  });

  it("should throw PackageNotFound for a 404 response", async () => {
    const registry = new NodeNpmPackageRegistry(
      async () => jsonResponse({ error: "not_found" }, 404),
      "https://registry.example.test",
    );

    await expect(registry.readPackage("missing")).rejects.toBeInstanceOf(
      PackageNotFound,
    );
  });

  it("should throw RegistryRequestError for another unsuccessful response", async () => {
    const registry = new NodeNpmPackageRegistry(
      async () => jsonResponse({ error: "unavailable" }, 503),
      "https://registry.example.test",
    );

    await expect(registry.readPackage("example")).rejects.toBeInstanceOf(
      RegistryRequestError,
    );
  });

  it("should throw RegistryRequestError when fetch fails", async () => {
    const registry = new NodeNpmPackageRegistry(
      async () => {
        throw new TypeError("network unavailable");
      },
      "https://registry.example.test",
    );

    await expect(registry.readPackage("example")).rejects.toMatchObject({
      name: "RegistryRequestError",
      message: "Unable to request npm Registry package example: network unavailable",
    });
  });

  it("should throw RegistryResponseError for an invalid Registry document", async () => {
    const registry = new NodeNpmPackageRegistry(
      async () => jsonResponse({ name: "example" }),
      "https://registry.example.test",
    );

    await expect(registry.readPackage("example")).rejects.toBeInstanceOf(
      RegistryResponseError,
    );
  });
});
