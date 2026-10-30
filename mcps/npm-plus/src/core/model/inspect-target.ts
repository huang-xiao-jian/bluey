export class InspectTarget {
  public readonly tag = "latest";

  public constructor(
    public readonly packageName: string,
    public readonly exactVersion: string,
  ) {}
}
