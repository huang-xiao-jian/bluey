import { describe, expect, it } from "vitest";
import { DirectDependencyKind } from "../core/model/inspect-target-quality";
import type {
  InspectNpmPackageQualityWorkflow,
  InspectNpmPackageQualityWorkflowResult,
} from "../core/workflow/inspect-npm-package-quality-workflow-scheduler";
import {
  InspectHandler,
  InspectInputError,
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

    await handler.run("example-package", { json: true });

    expect(output).toBe(`{
  "delegation": {
    "packageName": "example-package"
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

  it("should write a concise objective human report", async () => {
    let output = "";
    const handler = new InspectHandler(
      schedulerReturning(),
      (text) => (output += text),
    );

    await handler.run("example-package", {});

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

    await handler.run("example-package", {});

    expect(output).toContain(
      "PackageManifestReadError: manifest unavailable",
    );
  });

  it("should reject an empty package name", async () => {
    const handler = new InspectHandler(schedulerReturning(), () => undefined);

    await expect(handler.run("", {})).rejects.toBeInstanceOf(InspectInputError);
  });
});
