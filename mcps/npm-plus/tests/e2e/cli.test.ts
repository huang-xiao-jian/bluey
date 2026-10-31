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
      if (
        request.url === "/example-package/3.0.0" ||
        request.url === "/example-package/next" ||
        request.url === "/example-package/dangling"
      ) {
        response.statusCode = 404;
        response.end(JSON.stringify({ error: "not_found" }));
        return;
      }
      if (request.url === "/example-package") {
        response.end(
          JSON.stringify({
            name: "example-package",
            "dist-tags": {
              latest: "1.0.0",
              stable: "1.0.0",
              dangling: "3.0.0",
            },
            versions: { "1.0.0": manifest },
          }),
        );
        return;
      }
      response.end(JSON.stringify(manifest));
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
    ["v1.0.0", undefined],
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
      stderr: `无法检查 npm package

原因
  npm Registry 中未找到 package“missing”，请确认名称是否正确以及该 package 是否已发布。
`,
    });
  });

  it.each([
    [
      "3.0.0",
      "npm package“example-package”没有发布版本“3.0.0”，请确认精确版本号是否正确。",
    ],
    [
      "next",
      "npm package“example-package”没有“next”tag，请确认 tag 是否正确。",
    ],
    [
      "dangling",
      "npm package“example-package”的“dangling”tag 未指向已发布版本，请尝试其他 tag 或精确版本号。",
    ],
  ])("should explain target determination failure for %s", async (identifier, explanation) => {
    const requestsBefore = requestCount;

    await expect(
      run("inspect", "example-package", identifier, "--json"),
    ).rejects.toMatchObject({
      code: 1,
      stdout: "",
      stderr: expect.stringContaining(explanation),
    });
    expect(requestCount).toBe(requestsBefore + 2);
  });

  it("should inspect the latest version and emit a human-readable report", async () => {
    const requestsBefore = requestCount;
    const { stdout, stderr } = await run("inspect", "example-package");

    expect(stderr).toBe("");
    expect(requestCount).toBe(requestsBefore + 1);
    expect(stdout).toBe(
      "检查目标  example-package@1.0.0\n" +
        "版本来源  latest tag\n" +
        "\n" +
        "依赖规模\n" +
        "  运行时依赖  1\n" +
        "  可选依赖    1\n" +
        "  对等依赖    0\n" +
        "  捆绑依赖    1\n" +
        "\n" +
        "数据获取异常  0\n",
    );
  });

  it("should reject a version range before requesting the Registry", async () => {
    const requestsBefore = requestCount;

    await expect(
      run("inspect", "example-package", "^1.0.0", "--json"),
    ).rejects.toMatchObject({
      code: 1,
      stdout: "",
      stderr: expect.stringContaining(
        "暂不支持版本范围“^1.0.0”，请提供精确版本号或 tag。",
      ),
    });
    expect(requestCount).toBe(requestsBefore);
  });
});
