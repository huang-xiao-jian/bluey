import { Client } from "@modelcontextprotocol/sdk/client";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory";
import { afterEach, describe, expect, it } from "vitest";
import {
  InspectTargetException,
  InspectTargetExceptionCode,
} from "../core/errors/inspect-target-exception";
import { InspectTarget } from "../core/model/inspect-target";
import {
  InspectTargetQuality,
  InspectTargetQualityException,
} from "../core/model/inspect-target-quality";
import type { InspectNpmPackageQualityWorkflow } from "../core/workflow/inspect-npm-package-quality-workflow-scheduler";
import { InspectResultSummarizer } from "./report/inspect-result-summarizer";
import { DefaultNpmPlusMcpServerFactory, setupMcpServer } from "./server";

function successfulScheduler(): InspectNpmPackageQualityWorkflow {
  return {
    async run() {
      return {
        target: new InspectTarget("example-package", "1.2.3", "latest"),
        quality: new InspectTargetQuality(undefined, [
          new InspectTargetQualityException(
            "PackageManifestReadError",
            "manifest unavailable",
          ),
        ]),
      };
    },
  };
}

describe.each([
  {
    name: "setupMcpServer",
    create: (workflow: InspectNpmPackageQualityWorkflow) =>
      setupMcpServer(workflow, new InspectResultSummarizer()),
  },
  {
    name: "DefaultNpmPlusMcpServerFactory",
    create: (workflow: InspectNpmPackageQualityWorkflow) =>
      new DefaultNpmPlusMcpServerFactory(
        new InspectResultSummarizer(),
      ).create(workflow),
  },
])("$name", ({ create }) => {
  let client: Client | undefined;

  afterEach(async () => {
    await client?.close();
  });

  async function connect(
    scheduler: InspectNpmPackageQualityWorkflow,
  ): Promise<Client> {
    const server = create(scheduler);
    client = new Client({ name: "test-client", version: "1.0.0" });
    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();
    await Promise.all([
      server.connect(serverTransport),
      client.connect(clientTransport),
    ]);
    return client;
  }

  it("should advertise and call the npm inspection tool", async () => {
    const connectedClient = await connect(successfulScheduler());

    const tools = await connectedClient.listTools();
    const result = await connectedClient.callTool({
      name: "inspect_npm_package",
      arguments: {
        packageName: "example-package",
      },
    });

    expect(tools.tools).toHaveLength(1);
    expect(tools.tools[0]).toMatchObject({
      name: "inspect_npm_package",
      annotations: {
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: true,
        destructiveHint: false,
      },
    });
    expect(result.isError).not.toBe(true);
    expect(result.content).toEqual([
      {
        type: "text",
        text: `检查目标  example-package@1.2.3
版本来源  latest tag

依赖规模  数据不可用

异常详情
  PackageManifestReadError
  manifest unavailable`,
      },
    ]);
    expect(result.structuredContent).toEqual({
      delegation: {
        packageName: "example-package",
        versionIdentifier: undefined,
      },
      target: {
        packageName: "example-package",
        exactVersion: "1.2.3",
        tag: "latest",
      },
      quality: {
        dependencyScale: undefined,
        exceptions: [
          {
            name: "PackageManifestReadError",
            message: "manifest unavailable",
          },
        ],
      },
    });
  });

  it("should map target determination failures to an MCP error", async () => {
    const scheduler = {
      async run() {
        throw new InspectTargetException(
          InspectTargetExceptionCode.PackageNotFound,
          "npm Registry 中未找到 package“missing”，请确认名称是否正确以及该 package 是否已发布。",
        );
      },
    } satisfies InspectNpmPackageQualityWorkflow;
    const connectedClient = await connect(scheduler);

    const result = await connectedClient.callTool({
      name: "inspect_npm_package",
      arguments: { packageName: "missing" },
    });

    expect(result.isError).toBe(true);
    expect(result.structuredContent).toBeUndefined();
    expect(result.content).toEqual([
      {
        type: "text",
        text: `无法检查 npm package

原因
  npm Registry 中未找到 package“missing”，请确认名称是否正确以及该 package 是否已发布。`,
      },
    ]);
  });

  it("should return an MCP error for invalid input", async () => {
    const connectedClient = await connect(successfulScheduler());

    const result = await connectedClient.callTool({
      name: "inspect_npm_package",
      arguments: {
        packageName: "example-package",
        versionIdentifier: "^1.0.0",
      },
    });

    expect(result.isError).toBe(true);
    expect(result.structuredContent).toBeUndefined();
    expect(result.content).toEqual([
      {
        type: "text",
        text: `无法检查 npm package

原因
  暂不支持版本范围“^1.0.0”，请提供精确版本号或 tag。`,
      },
    ]);
  });

  it("should preserve an unexpected semantic exception message", async () => {
    const scheduler = {
      async run() {
        throw new Error("工作流调度器无法生成检查结果。");
      },
    } satisfies InspectNpmPackageQualityWorkflow;
    const connectedClient = await connect(scheduler);

    const result = await connectedClient.callTool({
      name: "inspect_npm_package",
      arguments: { packageName: "example-package" },
    });

    expect(result).toMatchObject({
      isError: true,
      content: [
        {
          type: "text",
          text: `无法检查 npm package

原因
  执行 npm package 检查时发生异常：工作流调度器无法生成检查结果。`,
        },
      ],
    });
  });

  it("should explain an invalid workflow result without exposing schema details", async () => {
    const scheduler = {
      async run() {
        return {
          target: { packageName: "example-package", exactVersion: 123 },
          quality: { exceptions: [] },
        } as unknown as Awaited<
          ReturnType<InspectNpmPackageQualityWorkflow["run"]>
        >;
      },
    } satisfies InspectNpmPackageQualityWorkflow;
    const connectedClient = await connect(scheduler);

    const result = await connectedClient.callTool({
      name: "inspect_npm_package",
      arguments: { packageName: "example-package" },
    });

    expect(result).toMatchObject({
      isError: true,
      content: [
        {
          type: "text",
          text: `无法检查 npm package

原因
  无法生成 MCP 检查结果：工作流返回的数据不符合输出契约。`,
        },
      ],
    });
    expect(JSON.stringify(result)).not.toContain("expected string");
  });
});
