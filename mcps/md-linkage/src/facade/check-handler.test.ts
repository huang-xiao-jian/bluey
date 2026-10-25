import { join } from "node:path";
import { stripVTControlCharacters } from "node:util";
import { describe, expect, it } from "vitest";
import { LinkCheckMode } from "../core/model/link-check-delegation";
import {
  createCheckHandler,
  type CheckHandlerDependencies,
} from "./check-handler";

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
      base: projectRoot,
      files: ["clean.md"],
      mode: LinkCheckMode.Shallow,
    });
  });

  it("resolves only starting files from cwd with a relative root", async () => {
    const output = captureOutput();
    const cwd = join(projectRoot, "nested");
    const handler = createCheckHandler(dependenciesFor(output, cwd));

    await handler.run(["next.md"], {
      root: "..",
      mode: LinkCheckMode.Recursive,
      json: true,
    });

    expect(JSON.parse(output.stdout.join("")).delegation).toMatchObject({
      root: projectRoot,
      base: cwd,
      files: ["next.md"],
      mode: LinkCheckMode.Recursive,
    });
  });

  it("preserves a glob input and expands it from cwd", async () => {
    const output = captureOutput();
    const handler = createCheckHandler(dependenciesFor(output));

    await handler.run(["*.md"], { json: true });

    const report = JSON.parse(output.stdout.join(""));
    expect(report.delegation.files).toEqual(["*.md"]);
    expect(report.scope.files).toEqual(["broken.md", "clean.md", "guide.md"]);
  });

  it("writes human output for a completed report with findings", async () => {
    const output = captureOutput();
    const handler = createCheckHandler(dependenciesFor(output));

    await handler.run(["missing.md"], {});

    expect(stripVTControlCharacters(output.stdout.join(""))).toContain(
      "Scope      1 issue",
    );
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

  it("rejects an empty starting file before resolving it", async () => {
    const output = captureOutput();
    const handler = createCheckHandler(dependenciesFor(output));

    await expect(handler.run([""], {})).rejects.toThrow("non-empty strings");
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
