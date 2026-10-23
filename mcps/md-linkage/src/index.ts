#!/usr/bin/env node
import "reflect-metadata";
import { Command, CommanderError, Option } from "commander";
import { createApplicationContainer } from "./composition/create-application-container";
import { LinkCheckWorkflowScheduler } from "./core/workflow/link-check-workflow-scheduler";
import { LinkCheckMode } from "./core/model/link-check-delegation";
import { CheckHandler, type CheckOptions } from "./facade/check";
import { McpHandler } from "./facade/mcp";

const container = createApplicationContainer();
const workflow = container.get(LinkCheckWorkflowScheduler);
const check = new CheckHandler({
  workflow,
  cwd: () => process.cwd(),
  stdout: (text) => process.stdout.write(text),
  stderr: (text) => process.stderr.write(text),
});
const mcp = new McpHandler(workflow);
const program = new Command()
  .name("md-linkage")
  .description("Check local links in Markdown specification documents.")
  .exitOverride();
let exitCode = 0;

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
    exitCode = await check.run(files, options);
  });

program
  .command("mcp")
  .description("Start the MCP server over stdio.")
  .action(async () => {
    await mcp.run();
  });

try {
  if (process.argv.length === 2) {
    process.stderr.write("Error: a subcommand is required\n");
    process.exitCode = 2;
  } else {
    await program.parseAsync();
    process.exitCode = exitCode;
  }
} catch (error) {
  if (error instanceof CommanderError) {
    process.exitCode = 2;
  } else {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`Error: ${message}\n`);
    process.exitCode = 2;
  }
}
