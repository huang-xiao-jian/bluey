import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import { describe, expect, it } from "vitest";
import { NpmPackageRegistry } from "../core/ports/npm-package-registry";
import { DependencyScaleQualityInspector } from "../core/quality/dependency-scale-quality-inspector";
import { InspectTargetQualityFabricator } from "../core/quality/inspect-target-quality-fabricator";
import { InspectTargetQualityInspector } from "../core/quality/inspect-target-quality-inspector";
import { QualityDimensionFailureRecorder } from "../core/quality/quality-dimension-failure-recorder";
import { InspectTargetDeterminer } from "../core/target/inspect-target-determiner";
import {
  type InspectNpmPackageQualityWorkflow,
  InspectNpmPackageQualityWorkflowScheduler,
} from "../core/workflow/inspect-npm-package-quality-workflow-scheduler";
import { NpmPlusMcpServerFactory } from "../mcp/server";
import { McpTransportFactory } from "../mcp/transport";
import { McpHandler } from "./mcp-handler";

class UnusedRegistry extends NpmPackageRegistry {
  public async readLatestManifest(): Promise<never> {
    throw new Error("The workflow must not run during connection");
  }
}

class FakeServerFactory extends NpmPlusMcpServerFactory {
  public connectedTransport: Transport | undefined;
  public workflow: InspectNpmPackageQualityWorkflow | undefined;

  public constructor(private readonly connectionError?: Error) {
    super();
  }

  public create(workflow: InspectNpmPackageQualityWorkflow): McpServer {
    this.workflow = workflow;
    return {
      connect: async (transport: Transport) => {
        if (this.connectionError) throw this.connectionError;
        this.connectedTransport = transport;
      },
    } as McpServer;
  }
}

class FakeTransportFactory extends McpTransportFactory {
  public constructor(private readonly transport: Transport) {
    super();
  }

  public create(): Transport {
    return this.transport;
  }
}

function createScheduler(): InspectNpmPackageQualityWorkflowScheduler {
  return new InspectNpmPackageQualityWorkflowScheduler(
    new InspectTargetDeterminer(new UnusedRegistry()),
    new InspectTargetQualityInspector(
      new DependencyScaleQualityInspector(),
      new QualityDimensionFailureRecorder(),
      new InspectTargetQualityFabricator(),
    ),
  );
}

describe("McpHandler", () => {
  it("should connect the injected server to the injected transport", async () => {
    const scheduler = createScheduler();
    const serverFactory = new FakeServerFactory();
    const transport = {} as Transport;
    const handler = new McpHandler(
      scheduler,
      serverFactory,
      new FakeTransportFactory(transport),
    );

    await handler.run();

    expect(serverFactory.workflow).toBe(scheduler);
    expect(serverFactory.connectedTransport).toBe(transport);
  });

  it("should propagate a server connection failure", async () => {
    const error = new Error("transport unavailable");
    const handler = new McpHandler(
      createScheduler(),
      new FakeServerFactory(error),
      new FakeTransportFactory({} as Transport),
    );

    await expect(handler.run()).rejects.toBe(error);
  });
});
