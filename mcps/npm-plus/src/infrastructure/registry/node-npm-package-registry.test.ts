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
  it("should read a requested manifest through the encoded version endpoint", async () => {
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

    const resolution = await registry.readManifest(
      "@scope/example",
      "stable",
    );

    expect(requestedUrl).toBe(
      "https://registry.example.test/%40scope%2Fexample/stable",
    );
    expect(resolution).toEqual({ exactVersion: "1.2.3", manifest });
  });

  it("should return undefined when a manifest is absent", async () => {
    const registry = new NodeNpmPackageRegistry(
      async () => jsonResponse({ error: "not_found" }, 404),
      "https://registry.example.test",
    );

    await expect(
      registry.readManifest("example", "missing"),
    ).resolves.toBeUndefined();
  });

  it("should read and map package metadata", async () => {
    let requestedUrl = "";
    let requestedAccept = "";
    const manifest = { name: "@scope/example", version: "1.2.3" };
    const registry = new NodeNpmPackageRegistry(async (input, init) => {
      requestedUrl = String(input);
      requestedAccept = new Headers(init?.headers).get("accept") ?? "";
      return jsonResponse({
        name: "@scope/example",
        "dist-tags": { latest: "1.2.3" },
        versions: { "1.2.3": manifest },
      });
    }, "https://registry.example.test/");

    const document = await registry.readPackage("@scope/example");

    expect(requestedUrl).toBe(
      "https://registry.example.test/%40scope%2Fexample",
    );
    expect(requestedAccept).toContain("application/vnd.npm.install-v1+json");
    expect(document).toEqual({
      name: "@scope/example",
      distTags: { latest: "1.2.3" },
      versions: { "1.2.3": manifest },
    });
  });

  it("should throw PackageNotFound when package metadata is absent", async () => {
    const registry = new NodeNpmPackageRegistry(
      async () => jsonResponse({ error: "not_found" }, 404),
      "https://registry.example.test",
    );

    await expect(registry.readPackage("missing")).rejects.toBeInstanceOf(
      PackageNotFound,
    );
  });

  it("should reject invalid package metadata", async () => {
    const registry = new NodeNpmPackageRegistry(
      async () => jsonResponse({ name: "example" }),
      "https://registry.example.test",
    );

    await expect(registry.readPackage("example")).rejects.toBeInstanceOf(
      RegistryResponseError,
    );
  });

  it("should throw RegistryRequestError for another unsuccessful response", async () => {
    const registry = new NodeNpmPackageRegistry(
      async () => jsonResponse({ error: "unavailable" }, 503),
      "https://registry.example.test",
    );

    await expect(
      registry.readManifest("example", "latest"),
    ).rejects.toBeInstanceOf(RegistryRequestError);
  });

  it("should throw RegistryRequestError when fetch fails", async () => {
    const registry = new NodeNpmPackageRegistry(
      async () => {
        throw new TypeError("network unavailable");
      },
      "https://registry.example.test",
    );

    await expect(registry.readManifest("example", "latest")).rejects.toMatchObject({
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
      registry.readManifest("example", "latest"),
    ).rejects.toBeInstanceOf(RegistryResponseError);
  });
});
