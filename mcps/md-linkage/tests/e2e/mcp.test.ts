import { Client } from "@modelcontextprotocol/sdk/client";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createApplicationContainer } from "../../src/composition/create-application-container";
import { LinkCheckWorkflowScheduler } from "../../src/core/workflow/link-check-workflow-scheduler";
import { setupMcpServer } from "../../src/mcp/server";

const packageRoot = process.cwd();
const executable = join(packageRoot, "dist", "index.mjs");
const projectRoot = join(packageRoot, "tests", "e2e", "__fixtures__", "project");

describe("CLI and MCP report equivalence", () => {
  let client: Client | undefined;

  afterEach(async () => {
    await client?.close();
  });

  it("returns the same report for equivalent recursive delegations", async () => {
    const cli = spawnSync(
      process.execPath,
      [
        executable,
        "check",
        "broken.md",
        "--root",
        projectRoot,
        "--mode",
        "recursive",
        "--json",
      ],
      { cwd: packageRoot, encoding: "utf8" },
    );
    const workflow = createApplicationContainer().get(LinkCheckWorkflowScheduler);
    const server = setupMcpServer(workflow);
    client = new Client({ name: "e2e-client", version: "1.0.0" });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await Promise.all([
      server.connect(serverTransport),
      client.connect(clientTransport),
    ]);

    const mcp = await client.callTool({
      name: "check_specification_links",
      arguments: {
        root: projectRoot,
        files: ["broken.md"],
        mode: "recursive",
      },
    });

    expect(cli.status).toBe(1);
    expect(mcp.isError).not.toBe(true);
    expect(mcp.structuredContent).toEqual(JSON.parse(cli.stdout));
  });
});
