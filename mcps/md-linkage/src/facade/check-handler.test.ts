import { join } from "node:path";
import { pathToFileURL } from "node:url";
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

  it("links source files when stdout supports terminal hyperlinks", async () => {
    const output = captureOutput();
    const handler = createCheckHandler(dependenciesFor(output, projectRoot, true));

    await handler.run(["broken.md"], {});

    const target = pathToFileURL(join(projectRoot, "broken.md")).href;
    expect(output.stdout.join("")).toContain(
      `Source: \u001B]8;;${target}\u001B\\broken.md\u001B]8;;\u001B\\`,
    );
  });

  it("keeps source files as plain text without terminal hyperlink support", async () => {
    const output = captureOutput();
    const handler = createCheckHandler(dependenciesFor(output));

    await handler.run(["broken.md"], {});

    expect(output.stdout.join("")).toContain("Source: broken.md");
    expect(output.stdout.join("")).not.toContain("\u001B]8;;");
  });

  it("keeps JSON output free of terminal hyperlinks", async () => {
    const output = captureOutput();
    const handler = createCheckHandler(dependenciesFor(output, projectRoot, true));

    await handler.run(["broken.md"], { json: true });

    expect(() => JSON.parse(output.stdout.join(""))).not.toThrow();
    expect(output.stdout.join("")).not.toContain("\u001B]8;;");
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
  hyperlinks = false,
): CheckHandlerDependencies & { supportsHyperlinks(): boolean } {
  return {
    cwd: () => cwd,
    supportsHyperlinks: () => hyperlinks,
    stdout: (text) => output.stdout.push(text),
  };
}
