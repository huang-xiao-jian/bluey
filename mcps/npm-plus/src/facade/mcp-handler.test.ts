import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import { describe, expect, it } from "vitest";
import { NpmPackageRegistry } from "../core/ports/npm-package-registry";
import { DependencyScaleQualityInspector } from "../core/quality/dependency-scale-quality-inspector";
import { InspectTargetQualityFabricator } from "../core/quality/inspect-target-quality-fabricator";
import { InspectTargetQualityInspector } from "../core/quality/inspect-target-quality-inspector";
import { QualityDimensionFailureRecorder } from "../core/quality/quality-dimension-failure-recorder";
import { InspectTargetDeterminer } from "../core/target/inspect-target-determiner";
import { InspectTargetFailureExplainer } from "../core/target/inspect-target-failure-explainer";
import { PackageVersionIdentifierInterpreter } from "../core/target/package-version-identifier-interpreter";
import {
  InspectNpmPackageQualityWorkflowScheduler,
} from "../core/workflow/inspect-npm-package-quality-workflow-scheduler";
import { InspectResultSummarizer } from "../mcp/report/inspect-result-summarizer";
import { McpTransportFactory } from "../mcp/transport";
import { InspectDelegationInterpreter } from "./inspect-delegation-interpreter";
import { McpHandler } from "./mcp-handler";
import { PlainInspectExceptionFormatter } from "./report/plain-inspect-exception-formatter";

class UnusedRegistry extends NpmPackageRegistry {
  public async readManifest(): Promise<never> {
    throw new Error("The workflow must not run during connection");
  }

  public async readPackage(): Promise<never> {
    throw new Error("The workflow must not run during connection");
  }
}

class RecordingTransport implements Transport {
  public started = false;

  public constructor(private readonly connectionError?: Error) {}

  public async start(): Promise<void> {
    if (this.connectionError) throw this.connectionError;
    this.started = true;
  }

  public async send(): Promise<void> {}

  public async close(): Promise<void> {
    this.onclose?.();
  }

  public onclose: (() => void) | undefined;
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
    new InspectTargetDeterminer(
      new UnusedRegistry(),
      new PackageVersionIdentifierInterpreter(),
      new InspectTargetFailureExplainer(),
    ),
    new InspectTargetQualityInspector(
      new DependencyScaleQualityInspector(),
      new QualityDimensionFailureRecorder(),
      new InspectTargetQualityFabricator(),
    ),
  );
}

function createHandler(transport: Transport): McpHandler {
  return new McpHandler(
    createScheduler(),
    new InspectResultSummarizer(),
    new InspectDelegationInterpreter(),
    new PlainInspectExceptionFormatter(),
    new FakeTransportFactory(transport),
  );
}

describe("McpHandler", () => {
  it("should connect the MCP server to the injected transport", async () => {
    const transport = new RecordingTransport();
    const handler = createHandler(transport);

    await handler.run();

    expect(transport.started).toBe(true);
  });

  it("should propagate a server connection failure", async () => {
    const error = new Error("transport unavailable");
    const handler = createHandler(new RecordingTransport(error));

    await expect(handler.run()).rejects.toBe(error);
  });
});
