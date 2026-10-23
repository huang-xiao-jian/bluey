import { readFile, stat } from "node:fs/promises";
import { extname, isAbsolute, relative, resolve, sep } from "node:path";
import { injectable } from "inversify";
import { SpecificationDocument } from "../../core/model/specification-document";
import type { SpecificationDocumentStore } from "../../core/ports/specification-document-store";

@injectable()
export class NodeSpecificationDocumentStore
  implements SpecificationDocumentStore
{
  public async establishRoot(root: string): Promise<string> {
    try {
      const stableRoot = resolve(root);
      if (!(await stat(stableRoot)).isDirectory()) {
        throw new Error("not a directory");
      }
      return stableRoot;
    } catch (error) {
      throw new Error(`Invalid project root: ${root}`, { cause: error });
    }
  }

  public resolvePath(root: string, documentPath: string): string {
    return resolve(root, documentPath);
  }

  public toProjectRelative(root: string, targetPath: string): string {
    return relative(root, targetPath).split(sep).join("/");
  }

  public isWithinRoot(root: string, targetPath: string): boolean {
    const candidate = relative(resolve(root), resolve(targetPath));
    return (
      candidate === "" ||
      (!candidate.startsWith(`..${sep}`) && candidate !== ".." && !isAbsolute(candidate))
    );
  }

  public async exists(targetPath: string): Promise<boolean> {
    try {
      await stat(targetPath);
      return true;
    } catch (error) {
      if (this.isMissing(error)) return false;
      throw error;
    }
  }

  public async isFile(targetPath: string): Promise<boolean> {
    try {
      return (await stat(targetPath)).isFile();
    } catch (error) {
      if (this.isMissing(error)) return false;
      throw error;
    }
  }

  public isMarkdown(targetPath: string): boolean {
    return extname(targetPath).toLowerCase() === ".md";
  }

  public async readDocument(
    root: string,
    relativePath: string,
  ): Promise<SpecificationDocument> {
    const content = await readFile(this.resolvePath(root, relativePath), "utf8");
    return new SpecificationDocument(relativePath, content);
  }

  private isMissing(error: unknown): boolean {
    return (
      error instanceof Error &&
      "code" in error &&
      (error as NodeJS.ErrnoException).code === "ENOENT"
    );
  }
}
