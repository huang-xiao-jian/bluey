#!/usr/bin/env node
import "reflect-metadata";
import { Command, Option } from "commander";
import { LinkCheckMode } from "./core/model/link-check-delegation";
import { CheckHandler, type CheckOptions } from "./facade/check";
import { McpHandler } from "./facade/mcp";

const check = new CheckHandler({
  cwd: () => process.cwd(),
  stdout: (text) => process.stdout.write(text),
});
const mcp = new McpHandler();
const program = new Command()
  .name("md-linkage")
  .description("Check local links in Markdown specification documents.");

program
  .command("check")
  .description("Check one or more Markdown specification documents.")
  .argument("<files...>", "Concrete Markdown document paths to check")
  .option("--root <path>", "Project boundary", process.cwd())
  .addOption(
    new Option("--mode <mode>", "Traversal mode")
      .choices(Object.values(LinkCheckMode))
      .default(LinkCheckMode.Shallow),
  )
  .option("--json", "Write only the serialized report")
  .action(async (files: string[], options: CheckOptions) => {
    await check.run(files, options);
  });

program
  .command("mcp")
  .description("Start the MCP server over stdio.")
  .action(async () => {
    await mcp.run();
  });

if (process.argv.length === 2) {
  program.error("a subcommand is required");
}

await program.parseAsync();
