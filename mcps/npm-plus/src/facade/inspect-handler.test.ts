import { describe, expect, it } from "vitest";
import { DirectDependencyKind } from "../core/model/inspect-target-quality";
import type {
  InspectNpmPackageQualityWorkflow,
  InspectNpmPackageQualityWorkflowResult,
} from "../core/workflow/inspect-npm-package-quality-workflow-scheduler";
import {
  InspectHandler,
  InspectInputError,
  UnsupportedVersionRangeError,
} from "./inspect-handler";

const workflowResult = {
  target: {
    packageName: "example-package",
    exactVersion: "1.2.3",
    tag: "latest",
  },
  quality: {
    dependencyScale: {
      directDependencyDeclarations: [
        {
          packageName: "runtime-helper",
          kind: DirectDependencyKind.Runtime,
          declaredRange: "^4.0.0",
          bundled: false,
        },
      ],
      directDependencyCounts: {
        runtimeCount: 1,
        optionalCount: 0,
        peerCount: 0,
        bundledCount: 0,
      },
    },
    exceptions: [],
  },
};

function schedulerReturning(
  result: InspectNpmPackageQualityWorkflowResult = workflowResult,
): InspectNpmPackageQualityWorkflow {
  return {
    async run() {
      return result;
    },
  };
}

describe("InspectHandler", () => {
  it("should write only the complete serialized result as JSON", async () => {
    let output = "";
    const handler = new InspectHandler(
      schedulerReturning(),
      (text) => (output += text),
    );

    await handler.run("example-package", "latest", { json: true });

    expect(output).toBe(`{
  "delegation": {
    "packageName": "example-package",
    "versionIdentifier": "latest"
  },
  "target": {
    "packageName": "example-package",
    "exactVersion": "1.2.3",
    "tag": "latest"
  },
  "quality": {
    "dependencyScale": {
      "directDependencyDeclarations": [
        {
          "packageName": "runtime-helper",
          "kind": "runtime",
          "declaredRange": "^4.0.0",
          "bundled": false
        }
      ],
      "directDependencyCounts": {
        "runtimeCount": 1,
        "optionalCount": 0,
        "peerCount": 0,
        "bundledCount": 0
      }
    },
    "exceptions": []
  }
}\n`);
  });

  it("should omit an absent version identifier from the delegation", async () => {
    let output = "";
    const handler = new InspectHandler(
      schedulerReturning(),
      (text) => (output += text),
    );

    await handler.run("example-package", undefined, { json: true });

    expect(JSON.parse(output).delegation).toEqual({
      packageName: "example-package",
    });
  });

  it("should write a concise objective human report", async () => {
    let output = "";
    const handler = new InspectHandler(
      schedulerReturning(),
      (text) => (output += text),
    );

    await handler.run("example-package", "latest", {});

    expect(output).toContain("example-package@1.2.3 (tag: latest)");
    expect(output).toContain("Runtime dependencies: 1");
    expect(output).toContain("Quality exceptions: 0");
  });

  it("should render quality exceptions as a successful report", async () => {
    let output = "";
    const handler = new InspectHandler(
      schedulerReturning({
        target: workflowResult.target,
        quality: {
          exceptions: [
            {
              name: "PackageManifestReadError",
              message: "manifest unavailable",
            },
          ],
        },
      }),
      (text) => (output += text),
    );

    await handler.run("example-package", "latest", {});

    expect(output).toContain(
      "PackageManifestReadError: manifest unavailable",
    );
  });

  it("should reject a version range before invoking the workflow", async () => {
    const scheduler = {
      async run() {
        throw new Error("workflow must not run");
      },
    } satisfies InspectNpmPackageQualityWorkflow;
    const handler = new InspectHandler(scheduler, () => undefined);

    await expect(
      handler.run("example-package", "^1.0.0", {}),
    ).rejects.toBeInstanceOf(UnsupportedVersionRangeError);
  });

  it.each([
    ["", undefined],
    ["example-package", ""],
  ])("should reject empty input", async (packageName, versionIdentifier) => {
    const handler = new InspectHandler(schedulerReturning(), () => undefined);

    await expect(
      handler.run(packageName, versionIdentifier, {}),
    ).rejects.toBeInstanceOf(InspectInputError);
  });
});
