import { lstat, readFile, readdir, realpath, stat } from "node:fs/promises";
import {
  basename,
  dirname,
  extname,
  isAbsolute,
  relative,
  resolve,
  sep,
} from "node:path";
import { glob } from "glob";
import { injectable } from "inversify";
import {
  GLOBSTAR,
  Minimatch,
  type MinimatchOptions,
} from "minimatch";
import { SpecificationDocument } from "../../core/model/specification-document";
import type { SpecificationDocumentStore } from "../../core/ports/specification-document-store";

@injectable()
export class NodeSpecificationDocumentStore
  implements SpecificationDocumentStore
{
  public async establishRoot(root: string): Promise<string> {
    return this.establishDirectory(root, "project root");
  }

  public async establishBase(base: string): Promise<string> {
    return this.establishDirectory(base, "input base");
  }

  private async establishDirectory(
    path: string,
    label: string,
  ): Promise<string> {
    try {
      const stablePath = await realpath(resolve(path));
      if (!(await stat(stablePath)).isDirectory()) {
        throw new Error("not a directory");
      }
      return stablePath;
    } catch (error) {
      throw new Error(`Invalid ${label}: ${path}`, { cause: error });
    }
  }

  public resolvePath(root: string, documentPath: string): string {
    return resolve(root, documentPath);
  }

  public async canonicalize(targetPath: string): Promise<string> {
    try {
      return await realpath(targetPath);
    } catch (error) {
      if (!this.isMissing(error)) throw error;
      const parent = dirname(targetPath);
      if (parent === targetPath) throw error;
      return resolve(await this.canonicalize(parent), basename(targetPath));
    }
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

  public isGlobPattern(input: string): boolean {
    return new Minimatch(input, {
      magicalBraces: true,
      nocomment: true,
      nonegate: true,
    }).hasMagic();
  }

  public unescapePath(input: string): string {
    return input.replace(/\\([*?[\]{}()!+@])/g, "$1");
  }

  public async matchGlob(
    base: string,
    pattern: string,
  ): Promise<readonly string[]> {
    const searchRoot = await this.findGlobSearchRoot(base, pattern);
    if (searchRoot === undefined) return [];

    const options: MinimatchOptions = {
      dot: false,
      nocomment: true,
      nocase: process.platform === "darwin" || process.platform === "win32",
      nonegate: true,
    };
    const matcher = new Minimatch(pattern, options);
    const entries = await this.walkWithoutDirectorySymbolicLinks(
      searchRoot,
      base,
      matcher,
    );

    return entries
      .filter(({ path, isDirectory }) => {
        const relativePath = this.toProjectRelative(base, path);
        return (
          matcher.match(relativePath) ||
          (isDirectory && matcher.match(`${relativePath}/`))
        );
      })
      .map(({ path }) => path);
  }

  public async listMarkdownFiles(directory: string): Promise<readonly string[]> {
    return glob("**/*.md", {
      absolute: true,
      cwd: directory,
      dot: false,
      follow: false,
      nodir: true,
      ignore: {
        childrenIgnored: (path) => path.isSymbolicLink(),
      },
    });
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

  public async isDirectory(targetPath: string): Promise<boolean> {
    try {
      return (await lstat(targetPath)).isDirectory();
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

  private async findGlobSearchRoot(
    base: string,
    pattern: string,
  ): Promise<string | undefined> {
    let searchRoot = resolve(base);
    for (const segment of pattern.split("/")) {
      if (segment === "" || segment === ".") continue;
      if (this.hasUnescapedGlobSyntax(segment)) break;

      searchRoot = resolve(searchRoot, this.unescapePath(segment));
      try {
        if ((await lstat(searchRoot)).isSymbolicLink()) return undefined;
      } catch (error) {
        if (this.isMissing(error)) return searchRoot;
        throw error;
      }
    }
    return searchRoot;
  }

  private async walkWithoutDirectorySymbolicLinks(
    directory: string,
    base: string,
    matcher: Minimatch,
  ): Promise<readonly { path: string; isDirectory: boolean }[]> {
    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch (error) {
      if (
        this.isMissing(error) ||
        (error instanceof Error &&
          "code" in error &&
          (error as NodeJS.ErrnoException).code === "ENOTDIR")
      ) {
        return [];
      }
      throw error;
    }

    const matches: { path: string; isDirectory: boolean }[] = [];
    for (const entry of entries) {
      const path = resolve(directory, entry.name);
      matches.push({ path, isDirectory: entry.isDirectory() });
      if (
        entry.isDirectory() &&
        this.canMatchDescendant(this.toProjectRelative(base, path), matcher)
      ) {
        matches.push(
          ...(await this.walkWithoutDirectorySymbolicLinks(
            path,
            base,
            matcher,
          )),
        );
      }
    }
    return matches;
  }

  private hasUnescapedGlobSyntax(segment: string): boolean {
    let escaped = false;
    for (const character of segment) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (character === "\\") {
        escaped = true;
        continue;
      }
      if ("*?[]{}()!+@".includes(character)) return true;
    }
    return false;
  }

  private canMatchDescendant(path: string, matcher: Minimatch): boolean {
    const pathParts = matcher.slashSplit(path);
    return matcher.set.some(
      (patternParts) =>
        matcher.matchOne(pathParts, patternParts, true) &&
        (pathParts.length < patternParts.length ||
          patternParts.includes(GLOBSTAR)),
    );
  }
}
