import { Command } from "commander";

import { EchoHandler } from "./facade/echo";
import { McpHandler } from "./facade/mcp";

const program = new Command();

program
  .command("echo <text>")
  .description("reflect incoming text unchanged.")
  .action(async (text: string) => {
    const handler = new EchoHandler();

    await handler.run(text);
  });

program
  .command("mcp")
  .description("start the MCP server over for AI Agent.")
  .action(async () => {
    const handler = new McpHandler();

    await handler.run();
  });

await program.parseAsync();
