import { execFile } from "node:child_process";
import { once } from "node:events";
import { createServer, type Server } from "node:http";
import { join } from "node:path";
import { promisify } from "node:util";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);
const executable = join(import.meta.dirname, "../../dist/index.mjs");

describe("npm-plus CLI", () => {
  let server: Server;
  let registryUrl: string;
  let requestCount = 0;

  beforeAll(async () => {
    server = createServer((request, response) => {
      requestCount += 1;
      response.setHeader("content-type", "application/json");
      if (request.url?.startsWith("/missing")) {
        response.statusCode = 404;
        response.end(JSON.stringify({ error: "not_found" }));
        return;
      }
      const manifest = {
        name: "example-package",
        version: "1.0.0",
        dependencies: { helper: "^2.0.0" },
        optionalDependencies: { platform: "^3.0.0" },
        bundledDependencies: ["platform"],
      };
      if (request.url !== "/example-package") {
        response.end(JSON.stringify(manifest));
        return;
      }
      response.end(
        JSON.stringify({
          name: "example-package",
          "dist-tags": { latest: "1.0.0", stable: "1.0.0" },
          versions: { "1.0.0": manifest },
        }),
      );
    });
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("Unable to determine fixture Registry address");
    }
    registryUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    server.close();
    await once(server, "close");
  });

  async function run(...arguments_: string[]) {
    return execFileAsync(process.execPath, [executable, ...arguments_], {
      env: { ...process.env, NPM_CONFIG_REGISTRY: registryUrl },
    });
  }

  it("should inspect the latest version and emit JSON only", async () => {
    const requestsBefore = requestCount;
    const { stdout, stderr } = await run(
      "inspect",
      "example-package",
      "--json",
    );

    expect(stderr).toBe("");
    expect(requestCount).toBe(requestsBefore + 1);
    expect(stdout).toContain('\n  "delegation": {\n');
    expect(stdout.endsWith("\n")).toBe(true);
    expect(JSON.parse(stdout)).toEqual({
      delegation: { packageName: "example-package" },
      target: {
        packageName: "example-package",
        exactVersion: "1.0.0",
        tag: "latest",
      },
      quality: {
        dependencyScale: {
          directDependencyDeclarations: [
            {
              packageName: "helper",
              kind: "runtime",
              declaredRange: "^2.0.0",
              bundled: false,
            },
            {
              packageName: "platform",
              kind: "optional",
              declaredRange: "^3.0.0",
              bundled: true,
            },
          ],
          directDependencyCounts: {
            runtimeCount: 1,
            optionalCount: 1,
            peerCount: 0,
            bundledCount: 1,
          },
        },
        exceptions: [],
      },
    });
  });

  it.each([
    ["1.0.0", undefined],
    ["stable", "stable"],
  ])("should inspect version identifier %s", async (identifier, tag) => {
    const { stdout } = await run(
      "inspect",
      "example-package",
      identifier,
      "--json",
    );

    expect(JSON.parse(stdout).target).toEqual({
      packageName: "example-package",
      exactVersion: "1.0.0",
      ...(tag ? { tag } : {}),
    });
  });

  it("should fail without result JSON when the package is absent", async () => {
    await expect(run("inspect", "missing", "--json")).rejects.toMatchObject({
      code: 1,
      stdout: "",
      stderr: expect.stringContaining("PackageNotFound: Package not found: missing"),
    });
  });

  it("should reject a version range before requesting the Registry", async () => {
    const requestsBefore = requestCount;

    await expect(
      run("inspect", "example-package", "^1.0.0", "--json"),
    ).rejects.toMatchObject({
      code: 1,
      stdout: "",
      stderr: expect.stringContaining(
        "UnsupportedVersionRangeError: Version ranges are not supported: ^1.0.0",
      ),
    });
    expect(requestCount).toBe(requestsBefore);
  });
});
