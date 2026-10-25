import { describe, expect, it } from "vitest";
import { LinkCheckDelegation, LinkCheckMode } from "./link-check-delegation";

describe("LinkCheckDelegation", () => {
  it("defaults a valid delegation to shallow mode", () => {
    const delegation = new LinkCheckDelegation("/workspace/project", ["spec.md"]);

    expect(delegation).toEqual({
      root: "/workspace/project",
      base: "/workspace/project",
      files: ["spec.md"],
      mode: LinkCheckMode.Shallow,
    });
  });

  it("preserves file, directory, escaped path, and glob inputs", () => {
    const delegation = new LinkCheckDelegation(
      "/workspace/project",
      ["spec.md", "guides", String.raw`notes\[1\].md`, "reference/**/*.md"],
      LinkCheckMode.Recursive,
      "/workspace/input",
    );

    expect(delegation).toEqual({
      root: "/workspace/project",
      base: "/workspace/input",
      files: ["spec.md", "guides", String.raw`notes\[1\].md`, "reference/**/*.md"],
      mode: LinkCheckMode.Recursive,
    });
  });

  it.each([
    ["empty root", "", ["spec.md"], LinkCheckMode.Shallow],
    ["relative root", "workspace/project", ["spec.md"], LinkCheckMode.Shallow],
    ["empty files", "/workspace/project", [], LinkCheckMode.Shallow],
    ["empty file", "/workspace/project", [""], LinkCheckMode.Shallow],
    ["unsupported mode", "/workspace/project", ["spec.md"], "deep"],
  ])("rejects %s", (_name, root, files, mode) => {
    expect(
      () =>
        new LinkCheckDelegation(
          root as string,
          files as readonly string[],
          mode as LinkCheckMode,
        ),
    ).toThrow();
  });

  it("rejects an invalid input base", () => {
    expect(
      () =>
        new LinkCheckDelegation(
          "/workspace/project",
          ["spec.md"],
          LinkCheckMode.Shallow,
          "relative/base",
        ),
    ).toThrow("Input base must be a non-empty absolute path");
  });
});
