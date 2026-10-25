import { isAbsolute } from "node:path";

export enum LinkCheckMode {
  Shallow = "shallow",
  Recursive = "recursive",
}

export function isLinkCheckInput(value: string): boolean {
  return value.trim().length > 0;
}

export class LinkCheckDelegation {
  public readonly root: string;
  public readonly base: string;
  public readonly files: readonly string[];
  public readonly mode: LinkCheckMode;

  public constructor(
    root: string,
    files: readonly string[],
    mode: LinkCheckMode = LinkCheckMode.Shallow,
    base: string = root,
  ) {
    if (!root.trim() || !isAbsolute(root)) {
      throw new Error("Project root must be a non-empty absolute path");
    }
    if (files.length === 0) {
      throw new Error("At least one document path is required");
    }
    if (!base.trim() || !isAbsolute(base)) {
      throw new Error("Input base must be a non-empty absolute path");
    }
    if (!files.every(isLinkCheckInput)) {
      throw new Error("File inputs must be non-empty strings");
    }
    if (!Object.values(LinkCheckMode).includes(mode)) {
      throw new Error(`Unsupported link check mode: ${String(mode)}`);
    }

    this.root = root;
    this.base = base;
    this.files = Object.freeze([...files]);
    this.mode = mode;
  }
}
