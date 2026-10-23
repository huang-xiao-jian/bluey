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

    const result = await handler.run(["spec.md", "docs/a.md"], {
      json: true,
    });
    const report = JSON.parse(output.stdout.join("")) as {
      delegation: { root: string; files: string[]; mode: string };
    };

    expect(result).toBeUndefined();
    expect(report.delegation).toEqual({
      root: "/workspace/project",
      files: ["spec.md", "docs/a.md"],
      mode: LinkCheckMode.Shallow,
    });
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

  it("writes human output for a completed report with findings", async () => {
    const output = captureOutput();
    const handler = new CheckHandler(dependenciesFor(output, true));

    const result = await handler.run(["missing.md"], {});

    expect(result).toBeUndefined();
    expect(output.stdout.join("")).toContain("Scope issues: 1");
  });

  it("propagates a workflow failure when no report is produced", async () => {
    const output = captureOutput();
    const dependencies = dependenciesFor(output);
    dependencies.workflow = {
      async run() {
        throw new Error("Invalid project root");
      },
    };
    const handler = new CheckHandler(dependencies);

    await expect(handler.run(["spec.md"], {})).rejects.toThrow(
      "Invalid project root",
    );
    expect(output.stdout).toEqual([]);
  });

  it("propagates invalid input before invoking the workflow", async () => {
    const output = captureOutput();
    const handler = new CheckHandler(dependenciesFor(output));

    await expect(handler.run(["**/*.md"], {})).rejects.toThrow("concrete paths");
    expect(output.stdout).toEqual([]);
  });
});

function captureOutput(): { stdout: string[] } {
  return { stdout: [] };
}

function dependenciesFor(
  output: { stdout: string[] },
  withFinding = false,
): CheckHandlerDependencies {
  return {
    cwd: () => "/workspace/project",
    stdout: (text) => output.stdout.push(text),
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
