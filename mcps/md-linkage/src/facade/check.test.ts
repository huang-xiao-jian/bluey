import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { LinkCheckMode } from "../core/model/link-check-delegation";
import { createCheckHandler, type CheckHandlerDependencies } from "./check";

const projectRoot = join(
  import.meta.dirname,
  "../../tests/e2e/__fixtures__/project",
);

describe("CheckHandler", () => {
  it("maps parsed defaults into the JSON report", async () => {
    const output = captureOutput();
    const handler = createCheckHandler(dependenciesFor(output));

    await handler.run(["clean.md"], { json: true });

    expect(JSON.parse(output.stdout.join("")).delegation).toEqual({
      root: projectRoot,
      files: ["clean.md"],
      mode: LinkCheckMode.Shallow,
    });
  });

  it("maps an explicit root and mode into the workflow delegation", async () => {
    const output = captureOutput();
    const handler = createCheckHandler(dependenciesFor(output));

    await handler.run(["next.md"], {
      root: "nested",
      mode: LinkCheckMode.Recursive,
      json: true,
    });

    expect(JSON.parse(output.stdout.join("")).delegation).toMatchObject({
      root: join(projectRoot, "nested"),
      files: ["next.md"],
      mode: LinkCheckMode.Recursive,
    });
  });

  it("writes human output for a completed report with findings", async () => {
    const output = captureOutput();
    const handler = createCheckHandler(dependenciesFor(output));

    await handler.run(["missing.md"], {});

    expect(output.stdout.join("")).toContain("Scope issues: 1");
  });

  it("propagates a workflow failure when no report is produced", async () => {
    const output = captureOutput();
    const missingRoot = join(projectRoot, "missing");
    const handler = createCheckHandler(dependenciesFor(output, missingRoot));

    await expect(handler.run(["spec.md"], {})).rejects.toThrow(
      "Invalid project root",
    );
    expect(output.stdout).toEqual([]);
  });

  it("propagates invalid input before invoking the workflow", async () => {
    const output = captureOutput();
    const handler = createCheckHandler(dependenciesFor(output));

    await expect(handler.run(["**/*.md"], {})).rejects.toThrow("concrete paths");
    expect(output.stdout).toEqual([]);
  });
});

function captureOutput(): { stdout: string[] } {
  return { stdout: [] };
}

function dependenciesFor(
  output: { stdout: string[] },
  cwd = projectRoot,
): CheckHandlerDependencies {
  return {
    cwd: () => cwd,
    stdout: (text) => output.stdout.push(text),
  };
}
