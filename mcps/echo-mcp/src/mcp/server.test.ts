import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { setupMcpServer } from "./server";

describe("Echo MCP server", () => {
  let client: Client;
  let server: ReturnType<typeof setupMcpServer>;

  beforeEach(async () => {
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    server = setupMcpServer();
    client = new Client({ name: "echo-mcp-test", version: "1.0.0" });

    await server.connect(serverTransport);
    await client.connect(clientTransport);
  });

  afterEach(async () => {
    await client.close();
    await server.close();
  });

  it("advertises the echo tool and its text schemas", async () => {
    const { tools } = await client.listTools();

    expect(tools).toEqual([
      expect.objectContaining({
        name: "echo",
        title: "Echo text",
        description: "reflect supplied text unchanged.",
        inputSchema: expect.objectContaining({
          required: ["text"],
        }),
        outputSchema: expect.objectContaining({
          required: ["text"],
        }),
      }),
    ]);
  });

  it("returns supplied text unchanged in both MCP response representations", async () => {
    const text = "  Hello, 世界! 👋  ";

    const result = await client.callTool({ name: "echo", arguments: { text } });

    expect(result).toMatchObject({
      content: [{ type: "text", text }],
      structuredContent: { text },
    });
  });
});
