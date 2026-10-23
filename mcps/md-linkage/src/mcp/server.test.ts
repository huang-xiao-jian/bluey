import { Client } from "@modelcontextprotocol/sdk/client";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory";
import { afterEach, describe, expect, it } from "vitest";
import { LinkCheckReport } from "../core/model/link-check-report";
import { LinkCheckScope } from "../core/model/link-check-scope";
import { setupMcpServer } from "./server";

describe("setupMcpServer", () => {
  let client: Client | undefined;

  afterEach(async () => {
    await client?.close();
  });

  it("advertises and calls the read-only specification link tool", async () => {
    const server = setupMcpServer({
      async run(delegation) {
        return new LinkCheckReport(
          delegation,
          new LinkCheckScope(delegation.files, []),
          [],
        );
      },
    });
    client = new Client({ name: "test-client", version: "1.0.0" });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await Promise.all([
      server.connect(serverTransport),
      client.connect(clientTransport),
    ]);

    const tools = await client.listTools();
    const result = await client.callTool({
      name: "check_specification_links",
      arguments: { root: "/workspace/project", files: ["spec.md"] },
    });

    expect(tools.tools).toHaveLength(1);
    expect(tools.tools[0]).toMatchObject({
      name: "check_specification_links",
      annotations: { readOnlyHint: true },
    });
    expect(result.structuredContent).toMatchObject({
      delegation: { root: "/workspace/project", mode: "shallow" },
      scope: { files: ["spec.md"] },
    });
  });

  it("returns an MCP error when report construction fails", async () => {
    const server = setupMcpServer({
      async run() {
        throw new Error("Invalid project root");
      },
    });
    client = new Client({ name: "test-client", version: "1.0.0" });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await Promise.all([
      server.connect(serverTransport),
      client.connect(clientTransport),
    ]);

    const result = await client.callTool({
      name: "check_specification_links",
      arguments: { root: "/workspace/missing", files: ["spec.md"] },
    });

    expect(result.isError).toBe(true);
    expect(result.content).toEqual([
      { type: "text", text: "Invalid project root" },
    ]);
  });

  it("rejects invalid input before workflow execution", async () => {
    const server = setupMcpServer({
      async run() {
        throw new Error("workflow should not run");
      },
    });
    client = new Client({ name: "test-client", version: "1.0.0" });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await Promise.all([
      server.connect(serverTransport),
      client.connect(clientTransport),
    ]);

    const result = await client.callTool({
      name: "check_specification_links",
      arguments: { root: "relative", files: ["spec.md"] },
    });

    expect(result.isError).toBe(true);
    expect(JSON.stringify(result.content)).not.toContain("workflow should not run");
  });
});
