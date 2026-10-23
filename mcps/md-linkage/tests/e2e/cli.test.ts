import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const packageRoot = process.cwd();
const executable = join(packageRoot, "dist", "index.mjs");
const projectRoot = join(packageRoot, "tests", "e2e", "__fixtures__", "project");

describe("md-linkage check", () => {
  it("returns a clean JSON report with status zero", () => {
    const result = run("check", "clean.md", "--root", projectRoot, "--json");

    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
    expect(JSON.parse(result.stdout)).toMatchObject({
      delegation: { root: projectRoot, files: ["clean.md"], mode: "shallow" },
      scope: { files: ["clean.md"], issues: [] },
      deadLinks: [],
    });
  });

  it("returns status one and recursively includes reached-document findings", () => {
    const result = run(
      "check",
      "broken.md",
      "--root",
      projectRoot,
      "--mode",
      "recursive",
      "--json",
    );
    const report = JSON.parse(result.stdout) as { deadLinks: unknown[] };

    expect(result.status).toBe(1);
    expect(result.stderr).toBe("");
    expect(report.deadLinks).toHaveLength(4);
  });

  it("returns status two and stderr diagnostics for an invalid root", () => {
    const result = run(
      "check",
      "clean.md",
      "--root",
      join(projectRoot, "missing"),
    );

    expect(result.status).toBe(2);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("Invalid project root");
  });
});

function run(...args: string[]) {
  return spawnSync(process.execPath, [executable, ...args], {
    cwd: packageRoot,
    encoding: "utf8",
  });
}
