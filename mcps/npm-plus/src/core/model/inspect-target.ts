export class InspectTarget {
  public constructor(
    public readonly packageName: string,
    public readonly exactVersion: string,
    public readonly tag?: string,
  ) {}
}
