import { join } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory";
import { afterEach, describe, expect, it } from "vitest";
import { createLinkCheckWorkflowScheduler } from "../application/markdown-linkage";
import { setupMcpServer } from "./server";

const projectRoot = join(
  import.meta.dirname,
  "../../tests/e2e/__fixtures__/project",
);

describe("setupMcpServer", () => {
  let client: Client | undefined;

  afterEach(async () => {
    await client?.close();
  });

  it("advertises and calls the read-only specification link tool", async () => {
    const server = setupMcpServer(createLinkCheckWorkflowScheduler());
    client = new Client({ name: "test-client", version: "1.0.0" });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await Promise.all([
      server.connect(serverTransport),
      client.connect(clientTransport),
    ]);

    const tools = await client.listTools();
    const result = await client.callTool({
      name: "check_specification_links",
      arguments: { root: projectRoot, files: ["clean.md"] },
    });

    expect(tools.tools).toHaveLength(1);
    expect(tools.tools[0]).toMatchObject({
      name: "check_specification_links",
      annotations: { readOnlyHint: true },
    });
    expect(result.structuredContent).toMatchObject({
      delegation: { root: projectRoot, mode: "shallow" },
      scope: { files: ["clean.md"] },
    });
  });

  it("returns an MCP error when report construction fails", async () => {
    const server = setupMcpServer(createLinkCheckWorkflowScheduler());
    client = new Client({ name: "test-client", version: "1.0.0" });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await Promise.all([
      server.connect(serverTransport),
      client.connect(clientTransport),
    ]);

    const result = await client.callTool({
      name: "check_specification_links",
      arguments: { root: join(projectRoot, "missing"), files: ["spec.md"] },
    });

    expect(result.isError).toBe(true);
    expect(result.content).toEqual([
      {
        type: "text",
        text: `Invalid project root: ${join(projectRoot, "missing")}`,
      },
    ]);
  });

  it("returns an MCP error for invalid input", async () => {
    const server = setupMcpServer(createLinkCheckWorkflowScheduler());
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
  });
});
