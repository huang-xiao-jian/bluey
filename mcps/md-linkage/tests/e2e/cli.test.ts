import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const packageRoot = process.cwd();
const executable = join(packageRoot, "dist", "index.mjs");
const projectRoot = join(packageRoot, "tests", "e2e", "__fixtures__", "project");

describe("md-linkage check", () => {
  it("returns a clean JSON report with status zero", () => {
    const result = runFrom(
      projectRoot,
      "check",
      "clean.md",
      "--root",
      projectRoot,
      "--json",
    );

    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
    expect(JSON.parse(result.stdout)).toMatchObject({
      delegation: {
        root: projectRoot,
        files: [join(projectRoot, "clean.md")],
        mode: "shallow",
      },
      scope: { files: ["clean.md"], issues: [] },
      deadLinks: [],
    });
  });

  it("resolves only starting files from cwd during a recursive check", () => {
    const cwd = join(projectRoot, "nested");
    const result = runFrom(
      cwd,
      "check",
      "next.md",
      "--mode",
      "recursive",
      "--json",
      "--root",
      "..",
    );
    const report = JSON.parse(result.stdout) as {
      deadLinks: Array<{
        location: { filePath: string };
        target: { filePath: string };
      }>;
    };

    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
    expect(report).toMatchObject({
      delegation: {
        root: projectRoot,
        files: [join(cwd, "next.md")],
        mode: "recursive",
      },
      scope: { files: ["nested/next.md"], issues: [] },
    });
    expect(report.deadLinks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          location: expect.objectContaining({ filePath: "nested/next.md" }),
          target: expect.objectContaining({
            filePath: join(cwd, "missing.md"),
          }),
        }),
        expect.objectContaining({
          location: expect.objectContaining({ filePath: "broken.md" }),
          target: expect.objectContaining({
            filePath: join(projectRoot, "missing.md"),
          }),
        }),
      ]),
    );
  });

  it("returns status zero and recursively includes reached-document findings", () => {
    const result = runFrom(
      projectRoot,
      "check",
      "broken.md",
      "--root",
      projectRoot,
      "--mode",
      "recursive",
      "--json",
    );
    const report = JSON.parse(result.stdout) as { deadLinks: unknown[] };

    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
    expect(report.deadLinks).toHaveLength(4);
  });

  it("returns a nonzero status and stderr diagnostics for an invalid root", () => {
    const result = run(
      "check",
      "clean.md",
      "--root",
      join(projectRoot, "missing"),
    );

    expect(result.status).not.toBe(0);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("Invalid project root");
  });

  it("returns a nonzero status for invalid command arguments", () => {
    const result = run("check");

    expect(result.status).not.toBe(0);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("missing required argument 'files'");
  });

  it("preserves the default root in command help", () => {
    const result = run("check", "--help");

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Project boundary (default:");
    expect(result.stdout).toContain(packageRoot);
    expect(result.stderr).toBe("");
  });
});

function run(...args: string[]) {
  return runFrom(packageRoot, ...args);
}

function runFrom(cwd: string, ...args: string[]) {
  return spawnSync(process.execPath, [executable, ...args], {
    cwd,
    encoding: "utf8",
  });
}
