import { isAbsolute } from "node:path";

export enum LinkCheckMode {
  Shallow = "shallow",
  Recursive = "recursive",
}

export function isConcreteDocumentPath(value: string): boolean {
  return value.trim().length > 0 && !/[*!?{}[\]]/.test(value);
}

export class LinkCheckDelegation {
  public readonly root: string;
  public readonly files: readonly string[];
  public readonly mode: LinkCheckMode;

  public constructor(
    root: string,
    files: readonly string[],
    mode: LinkCheckMode = LinkCheckMode.Shallow,
  ) {
    if (!root.trim() || !isAbsolute(root)) {
      throw new Error("Project root must be a non-empty absolute path");
    }
    if (files.length === 0) {
      throw new Error("At least one document path is required");
    }
    if (!files.every(isConcreteDocumentPath)) {
      throw new Error("Document paths must be non-empty concrete paths");
    }
    if (!Object.values(LinkCheckMode).includes(mode)) {
      throw new Error(`Unsupported link check mode: ${String(mode)}`);
    }

    this.root = root;
    this.files = Object.freeze([...files]);
    this.mode = mode;
  }
}
