#!/usr/bin/env node
import "reflect-metadata";
import { Command } from "commander";
import { createInspectHandler } from "./composition/cli-composition";
import { createMcpHandler } from "./composition/mcp-composition";
import type { InspectOptions } from "./facade/inspect-handler";

const program = new Command()
  .name("npm-plus")
  .description("Inspect objective npm package quality facts.");

program
  .command("inspect")
  .description("Inspect the latest version of an npm package.")
  .argument("<package-name>", "npm package name")
  .option("--json", "Write only the serialized inspection result")
  .action(
    async (
      packageName: string,
      options: InspectOptions,
    ) => {
      await createInspectHandler().run(packageName, options);
    },
  );

program
  .command("mcp")
  .description("Start the MCP server over stdio.")
  .action(async () => {
    await createMcpHandler().run();
  });

await program.parseAsync();
