import type { SpecificationDocument } from "../model/specification-document";

export abstract class SpecificationDocumentStore {
  public abstract establishRoot(root: string): Promise<string>;
  public abstract resolvePath(root: string, documentPath: string): string;
  public abstract toProjectRelative(root: string, targetPath: string): string;
  public abstract isWithinRoot(root: string, targetPath: string): boolean;
  public abstract exists(targetPath: string): Promise<boolean>;
  public abstract isFile(targetPath: string): Promise<boolean>;
  public abstract isMarkdown(targetPath: string): boolean;
  public abstract readDocument(
    root: string,
    relativePath: string,
  ): Promise<SpecificationDocument>;
}
