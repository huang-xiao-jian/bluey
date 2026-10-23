import { normalize, sep } from "node:path";

export class SpecificationDocumentRepository {
  private readonly pending: string[] = [];
  private readonly known = new Set<string>();
  private readonly checked = new Set<string>();

  public constructor(startingFiles: readonly string[]) {
    for (const file of startingFiles) this.enqueue(file);
  }

  public enqueue(filePath: string): boolean {
    const identity = this.normalizeIdentity(filePath);
    if (this.known.has(identity)) return false;
    this.known.add(identity);
    this.pending.push(identity);
    return true;
  }

  public takeNext(): string | undefined {
    const next = this.pending.shift();
    if (next) this.checked.add(next);
    return next;
  }

  public has(filePath: string): boolean {
    return this.known.has(this.normalizeIdentity(filePath));
  }

  public hasChecked(filePath: string): boolean {
    return this.checked.has(this.normalizeIdentity(filePath));
  }

  private normalizeIdentity(filePath: string): string {
    return normalize(filePath).split(sep).join("/");
  }
}
