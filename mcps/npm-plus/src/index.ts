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
  .description("Inspect an npm package at an exact version or dist-tag.")
  .argument("<package-name>", "npm package name")
  .argument("[version-identifier]", "exact version or dist-tag")
  .option("--json", "Write only the serialized inspection result")
  .action(
    async (
      packageName: string,
      versionIdentifier: string | undefined,
      options: InspectOptions,
    ) => {
      await createInspectHandler().run(packageName, versionIdentifier, options);
    },
  );

program
  .command("mcp")
  .description("Start the MCP server over stdio.")
  .action(async () => {
    await createMcpHandler().run();
  });

await program.parseAsync();
