import { resolve } from "node:path";
import { Command, CommanderError, Option } from "commander";
import { LinkCheckDelegation, LinkCheckMode } from "../../core/model/link-check-delegation";
import type { LinkCheckReport } from "../../core/model/link-check-report";
import type { LinkCheckWorkflowScheduler } from "../../core/workflow/link-check-workflow-scheduler";
import { formatHumanReport, formatJsonReport } from "./report-formatter";

interface CheckOptions {
  readonly root?: string;
  readonly mode?: LinkCheckMode;
  readonly json?: boolean;
}

export interface CliDependencies {
  workflow: Pick<LinkCheckWorkflowScheduler, "run">;
  readonly cwd: () => string;
  readonly stdout: (text: string) => void;
  readonly stderr: (text: string) => void;
  readonly startMcp?: () => Promise<void>;
}

export async function executeCli(
  argv: readonly string[],
  dependencies: CliDependencies,
): Promise<number> {
  if (argv.length === 0) {
    dependencies.stderr("Error: a subcommand is required\n");
    return 2;
  }

  let exitCode = 0;
  const program = new Command()
    .name("md-linkage")
    .description("Check local links in Markdown specification documents.")
    .exitOverride()
    .configureOutput({
      writeOut: dependencies.stdout,
      writeErr: dependencies.stderr,
    });

  program
    .command("check")
    .description("Check one or more Markdown specification documents.")
    .argument("<files...>", "Concrete Markdown document paths to check")
    .option("--root <path>", "Project boundary", dependencies.cwd())
    .addOption(
      new Option("--mode <mode>", "Traversal mode")
        .choices(Object.values(LinkCheckMode))
        .default(LinkCheckMode.Shallow),
    )
    .option("--json", "Write only the serialized report")
    .action(async (files: string[], options: CheckOptions) => {
      try {
        const root = resolve(dependencies.cwd(), options.root ?? dependencies.cwd());
        const delegation = new LinkCheckDelegation(root, files, options.mode);
        const report = await dependencies.workflow.run(delegation);
        dependencies.stdout(`${renderReport(report, options.json === true)}\n`);
        exitCode = hasFindings(report) ? 1 : 0;
      } catch (error) {
        dependencies.stderr(`Error: ${errorMessage(error)}\n`);
        exitCode = 2;
      }
    });

  if (dependencies.startMcp) {
    program
      .command("mcp")
      .description("Start the MCP server over stdio.")
      .action(async () => {
        try {
          await dependencies.startMcp?.();
        } catch (error) {
          dependencies.stderr(`Error: ${errorMessage(error)}\n`);
          exitCode = 2;
        }
      });
  }

  try {
    await program.parseAsync(["node", "md-linkage", ...argv]);
  } catch (error) {
    if (error instanceof CommanderError) return 2;
    dependencies.stderr(`Error: ${errorMessage(error)}\n`);
    return 2;
  }
  return exitCode;
}

function renderReport(report: LinkCheckReport, json: boolean): string {
  return json ? formatJsonReport(report) : formatHumanReport(report);
}

function hasFindings(report: LinkCheckReport): boolean {
  return report.scope.issues.length > 0 || report.deadLinks.length > 0;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
