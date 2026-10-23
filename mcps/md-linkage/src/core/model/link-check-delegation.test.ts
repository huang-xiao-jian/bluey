import { describe, expect, it } from "vitest";
import { LinkCheckDelegation, LinkCheckMode } from "./link-check-delegation";

describe("LinkCheckDelegation", () => {
  it("defaults a valid delegation to shallow mode", () => {
    const delegation = new LinkCheckDelegation("/workspace/project", ["spec.md"]);

    expect(delegation).toEqual({
      root: "/workspace/project",
      files: ["spec.md"],
      mode: LinkCheckMode.Shallow,
    });
  });

  it.each([
    ["empty root", "", ["spec.md"], LinkCheckMode.Shallow],
    ["relative root", "workspace/project", ["spec.md"], LinkCheckMode.Shallow],
    ["empty files", "/workspace/project", [], LinkCheckMode.Shallow],
    ["empty file", "/workspace/project", [""], LinkCheckMode.Shallow],
    ["glob file", "/workspace/project", ["specs/**/*.md"], LinkCheckMode.Shallow],
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
});
