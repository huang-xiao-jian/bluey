import type { SpecificationDocument } from "../model/specification-document";

export abstract class SpecificationDocumentStore {
  public abstract establishRoot(root: string): Promise<string>;
  public abstract establishBase(base: string): Promise<string>;
  public abstract resolvePath(root: string, documentPath: string): string;
  public abstract canonicalize(targetPath: string): Promise<string>;
  public abstract toProjectRelative(root: string, targetPath: string): string;
  public abstract isWithinRoot(root: string, targetPath: string): boolean;
  public abstract isGlobPattern(input: string): boolean;
  public abstract unescapePath(input: string): string;
  public abstract matchGlob(base: string, pattern: string): Promise<readonly string[]>;
  public abstract listMarkdownFiles(directory: string): Promise<readonly string[]>;
  public abstract exists(targetPath: string): Promise<boolean>;
  public abstract isFile(targetPath: string): Promise<boolean>;
  public abstract isDirectory(targetPath: string): Promise<boolean>;
  public abstract isMarkdown(targetPath: string): boolean;
  public abstract readDocument(
    root: string,
    relativePath: string,
  ): Promise<SpecificationDocument>;
}
