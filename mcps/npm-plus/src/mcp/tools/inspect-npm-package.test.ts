import { describe, expect, it } from "vitest";
import { PackageNotFound } from "../../core/errors/target-determination-errors";
import type { InspectNpmPackageQualityWorkflow } from "../../core/workflow/inspect-npm-package-quality-workflow-scheduler";
import {
  createInspectNpmPackageTool,
  InspectNpmPackageInputSchema,
} from "./inspect-npm-package";

function schedulerWithResult(): InspectNpmPackageQualityWorkflow {
  return {
    async run() {
      return {
        target: {
          packageName: "example-package",
          exactVersion: "1.2.3",
          tag: "latest",
        },
        quality: {
          exceptions: [
            {
              name: "PackageManifestReadError",
              message: "manifest unavailable",
            },
          ],
        },
      };
    },
  };
}

describe("InspectNpmPackageInputSchema", () => {
  it("should accept an omitted version identifier", () => {
    expect(
      InspectNpmPackageInputSchema.parse({ packageName: "example-package" }),
    ).toEqual({ packageName: "example-package" });
  });

  it.each([
    { packageName: "" },
    { packageName: "example-package", versionIdentifier: "" },
    { packageName: "example-package", versionIdentifier: "^1.0.0" },
    { packageName: "example-package", versionIdentifier: "1.x" },
  ])("should reject unsupported input %#", (input) => {
    expect(() => InspectNpmPackageInputSchema.parse(input)).toThrow();
  });
});

describe("createInspectNpmPackageTool", () => {
  it("should define the required read-only annotations", () => {
    expect(createInspectNpmPackageTool(schedulerWithResult()).annotations).toEqual(
      {
        readOnlyHint: true,
        idempotentHint: true,
        openWorldHint: true,
        destructiveHint: false,
      },
    );
  });

  it("should preserve the delegation in a successful result", async () => {
    const tool = createInspectNpmPackageTool(schedulerWithResult());

    const result = await tool.callback({
      packageName: "example-package",
      versionIdentifier: "latest",
    });

    expect(result.result).toEqual({
      delegation: {
        packageName: "example-package",
        versionIdentifier: "latest",
      },
      target: {
        packageName: "example-package",
        exactVersion: "1.2.3",
        tag: "latest",
      },
      quality: {
        exceptions: [
          {
            name: "PackageManifestReadError",
            message: "manifest unavailable",
          },
        ],
      },
    });
    expect(result.summary).toContain("example-package@1.2.3");
    expect(result.summary).toContain("quality exceptions: 1");
  });

  it("should propagate target determination errors", async () => {
    const scheduler = {
      async run() {
        throw new PackageNotFound("missing");
      },
    } satisfies InspectNpmPackageQualityWorkflow;

    await expect(
      createInspectNpmPackageTool(scheduler).callback({ packageName: "missing" }),
    ).rejects.toBeInstanceOf(PackageNotFound);
  });
});
