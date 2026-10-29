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
  it("should read the latest manifest through the encoded package endpoint", async () => {
    let requestedUrl = "";
    const manifest = {
      name: "@scope/example",
      version: "1.2.3",
      dependencies: { dependency: "^4.0.0" },
    };
    const registry = new NodeNpmPackageRegistry(async (input) => {
      requestedUrl = String(input);
      return jsonResponse(manifest);
    }, "https://registry.example.test/");

    const resolution = await registry.readLatestManifest("@scope/example");

    expect(requestedUrl).toBe(
      "https://registry.example.test/%40scope%2Fexample/latest",
    );
    expect(resolution).toEqual({ exactVersion: "1.2.3", manifest });
  });

  it("should throw PackageNotFound for a 404 response", async () => {
    const registry = new NodeNpmPackageRegistry(
      async () => jsonResponse({ error: "not_found" }, 404),
      "https://registry.example.test",
    );

    await expect(
      registry.readLatestManifest("missing"),
    ).rejects.toBeInstanceOf(PackageNotFound);
  });

  it("should throw RegistryRequestError for another unsuccessful response", async () => {
    const registry = new NodeNpmPackageRegistry(
      async () => jsonResponse({ error: "unavailable" }, 503),
      "https://registry.example.test",
    );

    await expect(
      registry.readLatestManifest("example"),
    ).rejects.toBeInstanceOf(RegistryRequestError);
  });

  it("should throw RegistryRequestError when fetch fails", async () => {
    const registry = new NodeNpmPackageRegistry(
      async () => {
        throw new TypeError("network unavailable");
      },
      "https://registry.example.test",
    );

    await expect(registry.readLatestManifest("example")).rejects.toMatchObject({
      name: "RegistryRequestError",
      message: "Unable to request npm Registry package example: network unavailable",
    });
  });

  it("should throw RegistryResponseError for a manifest without a version", async () => {
    const registry = new NodeNpmPackageRegistry(
      async () => jsonResponse({ name: "example" }),
      "https://registry.example.test",
    );

    await expect(
      registry.readLatestManifest("example"),
    ).rejects.toBeInstanceOf(RegistryResponseError);
  });
});
