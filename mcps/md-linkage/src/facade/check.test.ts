import { describe, expect, it } from "vitest";
import { LinkCheckMode } from "../core/model/link-check-delegation";
import { LinkCheckReport } from "../core/model/link-check-report";
import {
  LinkCheckScope,
  LinkCheckScopeIssueType,
} from "../core/model/link-check-scope";
import { CheckHandler, type CheckHandlerDependencies } from "./check";

describe("CheckHandler", () => {
  it("maps parsed defaults into the JSON report", async () => {
    const output = captureOutput();
    const handler = new CheckHandler(dependenciesFor(output));

    const exitCode = await handler.run(["spec.md", "docs/a.md"], {
      json: true,
    });
    const report = JSON.parse(output.stdout.join("")) as {
      delegation: { root: string; files: string[]; mode: string };
    };

    expect(exitCode).toBe(0);
    expect(report.delegation).toEqual({
      root: "/workspace/project",
      files: ["spec.md", "docs/a.md"],
      mode: LinkCheckMode.Shallow,
    });
    expect(output.stderr).toEqual([]);
  });

  it("maps an explicit root and mode into the workflow delegation", async () => {
    const output = captureOutput();
    const handler = new CheckHandler(dependenciesFor(output));

    await handler.run(["spec.md"], {
      root: "nested",
      mode: LinkCheckMode.Recursive,
      json: true,
    });

    expect(JSON.parse(output.stdout.join("")).delegation).toMatchObject({
      root: "/workspace/project/nested",
      files: ["spec.md"],
      mode: LinkCheckMode.Recursive,
    });
  });

  it("returns status one and human output for a completed report with findings", async () => {
    const output = captureOutput();
    const handler = new CheckHandler(dependenciesFor(output, true));

    const exitCode = await handler.run(["missing.md"], {});

    expect(exitCode).toBe(1);
    expect(output.stdout.join("")).toContain("Scope issues: 1");
    expect(output.stderr).toEqual([]);
  });

  it("returns status two and writes diagnostics when no report is produced", async () => {
    const output = captureOutput();
    const dependencies = dependenciesFor(output);
    dependencies.workflow = {
      async run() {
        throw new Error("Invalid project root");
      },
    };
    const handler = new CheckHandler(dependencies);

    const exitCode = await handler.run(["spec.md"], {});

    expect(exitCode).toBe(2);
    expect(output.stdout).toEqual([]);
    expect(output.stderr.join("")).toContain("Invalid project root");
  });

  it("returns status two before invoking the workflow for invalid input", async () => {
    const output = captureOutput();
    const handler = new CheckHandler(dependenciesFor(output));

    const exitCode = await handler.run(["**/*.md"], {});

    expect(exitCode).toBe(2);
    expect(output.stdout).toEqual([]);
    expect(output.stderr.join("")).toContain("concrete paths");
  });
});

function captureOutput(): { stdout: string[]; stderr: string[] } {
  return { stdout: [], stderr: [] };
}

function dependenciesFor(
  output: { stdout: string[]; stderr: string[] },
  withFinding = false,
): CheckHandlerDependencies {
  return {
    cwd: () => "/workspace/project",
    stdout: (text) => output.stdout.push(text),
    stderr: (text) => output.stderr.push(text),
    workflow: {
      async run(delegation) {
        const scope = new LinkCheckScope(
          withFinding ? [] : delegation.files,
          withFinding
            ? [
                {
                  path: delegation.files[0]!,
                  resolvedPath: `${delegation.root}/${delegation.files[0]}`,
                  issueType: LinkCheckScopeIssueType.DocumentNotFound,
                },
              ]
            : [],
        );
        return new LinkCheckReport(delegation, scope, []);
      },
    },
  };
}
