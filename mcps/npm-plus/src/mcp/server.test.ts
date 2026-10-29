import { Client } from "@modelcontextprotocol/sdk/client";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory";
import { afterEach, describe, expect, it } from "vitest";
import { PackageNotFound } from "../core/errors/target-determination-errors";
import type { InspectNpmPackageQualityWorkflow } from "../core/workflow/inspect-npm-package-quality-workflow-scheduler";
import { setupMcpServer } from "./server";

function successfulScheduler(): InspectNpmPackageQualityWorkflow {
  return {
    async run() {
      return {
        target: {
          packageName: "example-package",
          exactVersion: "1.2.3",
          tag: "latest",
        },
        quality: {
          exceptions: [
            {
              name: "PackageManifestReadError",
              message: "manifest unavailable",
            },
          ],
        },
      };
    },
  };
}

describe("setupMcpServer", () => {
  let client: Client | undefined;

  afterEach(async () => {
    await client?.close();
  });

  async function connect(
    scheduler: InspectNpmPackageQualityWorkflow,
  ): Promise<Client> {
    const server = setupMcpServer(scheduler);
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
    expect(result.structuredContent).toEqual({
      delegation: {
        packageName: "example-package",
      },
      target: {
        packageName: "example-package",
        exactVersion: "1.2.3",
        tag: "latest",
      },
      quality: {
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
        throw new PackageNotFound("missing");
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
      { type: "text", text: "Package not found: missing" },
    ]);
  });

  it("should return an MCP error for invalid input", async () => {
    const connectedClient = await connect(successfulScheduler());

    const result = await connectedClient.callTool({
      name: "inspect_npm_package",
      arguments: {
        packageName: "example-package",
        versionIdentifier: "latest",
      },
    });

    expect(result.isError).toBe(true);
    expect(result.structuredContent).toBeUndefined();
  });
});
