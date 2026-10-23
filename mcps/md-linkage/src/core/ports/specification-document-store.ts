import type { SpecificationDocument } from "../model/specification-document";

export const SpecificationDocumentStoreToken = Symbol.for(
  "SpecificationDocumentStore",
);

export interface SpecificationDocumentStore {
  establishRoot(root: string): Promise<string>;
  resolvePath(root: string, documentPath: string): string;
  toProjectRelative(root: string, targetPath: string): string;
  isWithinRoot(root: string, targetPath: string): boolean;
  exists(targetPath: string): Promise<boolean>;
  isFile(targetPath: string): Promise<boolean>;
  isMarkdown(targetPath: string): boolean;
  readDocument(root: string, relativePath: string): Promise<SpecificationDocument>;
}
