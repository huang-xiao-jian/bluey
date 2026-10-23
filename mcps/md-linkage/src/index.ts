#!/usr/bin/env node
import "reflect-metadata";
import { createApplicationContainer } from "./composition/create-application-container";
import { LinkCheckWorkflowScheduler } from "./core/workflow/link-check-workflow-scheduler";
import { executeCli } from "./facade/cli/check-command";
import { McpHandler } from "./facade/mcp";

const container = createApplicationContainer();
const workflow = container.get(LinkCheckWorkflowScheduler);
const mcp = new McpHandler(workflow);

process.exitCode = await executeCli(process.argv.slice(2), {
  workflow,
  cwd: () => process.cwd(),
  stdout: (text) => process.stdout.write(text),
  stderr: (text) => process.stderr.write(text),
  startMcp: () => mcp.run(),
});
