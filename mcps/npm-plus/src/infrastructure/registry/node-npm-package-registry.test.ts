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
  it("should read one manifest through the encoded version endpoint", async () => {
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

    const resolution = await registry.readManifest("@scope/example", "stable");

    expect(requestedUrl).toBe(
      "https://registry.example.test/%40scope%2Fexample/stable",
    );
    expect(resolution).toEqual({ exactVersion: "1.2.3", manifest });
  });

  it("should return undefined when a manifest endpoint responds with 404", async () => {
    const registry = new NodeNpmPackageRegistry(
      async () => jsonResponse({ error: "not_found" }, 404),
      "https://registry.example.test",
    );

    await expect(
      registry.readManifest("example", "missing"),
    ).resolves.toBeUndefined();
  });

  it("should throw RegistryResponseError for a manifest without a version", async () => {
    const registry = new NodeNpmPackageRegistry(
      async () => jsonResponse({ name: "example" }),
      "https://registry.example.test",
    );

    await expect(
      registry.readManifest("example", "latest"),
    ).rejects.toBeInstanceOf(RegistryResponseError);
  });

  it("should encode a scoped package and map the Registry document", async () => {
    let requestedUrl = "";
    let requestedAccept = "";
    const registry = new NodeNpmPackageRegistry(async (input, init) => {
      requestedUrl = String(input);
      requestedAccept = new Headers(init?.headers).get("accept") ?? "";
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
    expect(requestedAccept).toBe(
      "application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8",
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
