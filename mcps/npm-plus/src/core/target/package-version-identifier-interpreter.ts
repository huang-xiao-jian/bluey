import { valid, validRange } from "semver";

export type InterpretedVersionIdentifier =
  | { readonly kind: "exact"; readonly exactVersion: string }
  | { readonly kind: "tag"; readonly tag: string };

export function isUnsupportedVersionRange(value: string): boolean {
  return valid(value) === null && validRange(value) !== null;
}

export class PackageVersionIdentifierInterpreter {
  public interpret(value?: string): InterpretedVersionIdentifier {
    if (value === undefined) return { kind: "tag", tag: "latest" };

    const exactVersion = valid(value);
    return exactVersion
      ? { kind: "exact", exactVersion }
      : { kind: "tag", tag: value };
  }
}
