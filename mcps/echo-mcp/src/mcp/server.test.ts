import { Client } from "@modelcontextprotocol/sdk/client";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { setupMcpServer } from "./server";
import { EchoTool } from "./tools/echo";

describe("Echo MCP server", () => {
  let client: Client;
  let server: ReturnType<typeof setupMcpServer>;

  beforeEach(async () => {
    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();

    server = setupMcpServer();
    client = new Client({ name: "echo-mcp-test", version: "1.0.0" });

    await server.connect(serverTransport);
    await client.connect(clientTransport);
  });

  afterEach(async () => {
    await client.close();
    await server.close();
    vi.restoreAllMocks();
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
        annotations: expect.objectContaining({
          readOnlyHint: true,
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

  it("maps callback failures to an MCP error response", async () => {
    vi.spyOn(EchoTool, "callback").mockRejectedValueOnce(
      new Error("Unable to echo text."),
    );

    const result = await client.callTool({
      name: "echo",
      arguments: { text: "Hello" },
    });

    expect(result).toEqual({
      isError: true,
      content: [{ type: "text", text: "Unable to echo text." }],
    });
  });
});
