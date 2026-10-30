# npm-plus Dependency Injection Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor `@bluey/npm-plus` so its object model matches the approved design and its CLI and MCP entry points use separate Inversify composition roots over one shared core binding module.

**Architecture:** A reusable `ContainerModule` binds the core workflow and Registry adapter. CLI and MCP each create an independent Container, load that module, bind only their own adapter/runtime boundaries, and return a fully injected handler without exposing the Container.

**Tech Stack:** TypeScript, Node.js 26, pnpm, Vitest, Inversify 8, Commander, Zod, MCP SDK, tsdown.

**Spec:** `specs/npm-plus/dependency-injection-refactor.md`

## Global Constraints

- `specs/npm-plus/design.md` is the authority for domain classes, responsibilities, and collaborators.
- Preserve the current CLI command, MCP tool contract, serialized property names, report format, and error semantics.
- CLI and MCP must have separate composition roots, Containers, instances, and lifecycles.
- CLI and MCP may share only the core `ContainerModule` binding definition.
- Use concrete class or abstract class service identifiers; do not introduce string or symbol identifiers.
- Core must not depend on Commander, MCP SDK, stdio, process output, or report formatting.
- Keep all application services stateless so singleton scope is safe.
- Write new natural-language documentation and code comments in Simplified Chinese; write tests entirely in English.
- Run every non-interactive Node.js or pnpm command through `mise exec --`.
- Preserve the untracked `mcps/npm-plus/AGENTS.md`; do not stage or modify it.

## File Structure

- `src/core/model/inspect-target.ts`: target entity with an invariant `latest` tag.
- `src/core/model/inspect-target-quality.ts`: quality result classes and dependency fact records.
- `src/core/quality/inspect-target-quality-fabricator.ts`: stateless creation of aggregate quality results.
- `src/core/quality/*.ts`: concrete, injectable inspection and failure-recording services.
- `src/core/target/inspect-target-determiner.ts`: concrete, injectable target determination service.
- `src/core/workflow/inspect-npm-package-quality-workflow-scheduler.ts`: concrete workflow coordinator.
- `src/composition/npm-package-quality-module.ts`: shared core/infrastructure bindings only.
- `src/composition/cli-composition.ts`: CLI-only composition root.
- `src/composition/mcp-composition.ts`: MCP-only composition root.
- `src/facade/inspect-handler.ts`: injected CLI handler and CLI output boundary.
- `src/facade/mcp-handler.ts`: injected MCP lifecycle coordinator.
- `src/mcp/server.ts`: MCP server setup plus injectable server factory boundary.
- `src/mcp/transport.ts`: injectable MCP transport factory boundary.
- `src/index.ts`: Commander routing only.

---

### Task 1: Domain Quality Objects and Fabricator

**Files:**
- Modify: `mcps/npm-plus/src/core/model/inspect-target.ts`
- Modify: `mcps/npm-plus/src/core/model/inspect-target-quality.ts`
- Create: `mcps/npm-plus/src/core/model/inspect-target-quality.test.ts`
- Create: `mcps/npm-plus/src/core/quality/inspect-target-quality-fabricator.ts`
- Create: `mcps/npm-plus/src/core/quality/inspect-target-quality-fabricator.test.ts`

**Interfaces:**
- Produces: `new InspectTarget(packageName: string, exactVersion: string)` with readonly `tag = "latest"`.
- Produces: `new InspectTargetDependencyScaleQuality(declarations, counts)`.
- Produces: `new InspectTargetQualityException(name: string, message: string)`.
- Produces: `new InspectTargetQuality(dependencyScale, exceptions)` where `dependencyScale` may be `undefined`.
- Produces: `InspectTargetQualityFabricator.fabricate(dependencyScale, exceptions): InspectTargetQuality`.

- [ ] **Step 1: Write failing domain serialization tests**

```ts
import { describe, expect, it } from "vitest";
import { InspectTarget } from "./inspect-target";
import {
  InspectTargetDependencyScaleQuality,
  InspectTargetQuality,
  InspectTargetQualityException,
} from "./inspect-target-quality";

describe("npm inspection domain objects", () => {
  it("should fix every inspect target to the latest tag", () => {
    expect(new InspectTarget("example-package", "1.2.3")).toEqual({
      packageName: "example-package",
      exactVersion: "1.2.3",
      tag: "latest",
    });
  });

  it("should preserve the public quality serialization shape", () => {
    const dependencyScale = new InspectTargetDependencyScaleQuality([], {
      runtimeCount: 0,
      optionalCount: 0,
      peerCount: 0,
      bundledCount: 0,
    });
    const quality = new InspectTargetQuality(dependencyScale, [
      new InspectTargetQualityException("ExampleError", "example"),
    ]);

    expect(JSON.parse(JSON.stringify(quality))).toEqual({
      dependencyScale: {
        directDependencyDeclarations: [],
        directDependencyCounts: {
          runtimeCount: 0,
          optionalCount: 0,
          peerCount: 0,
          bundledCount: 0,
        },
      },
      exceptions: [{ name: "ExampleError", message: "example" }],
    });
  });
});
```

- [ ] **Step 2: Run the domain test and verify it fails**

Run: `mise exec -- pnpm --filter @bluey/npm-plus exec vitest run src/core/model/inspect-target-quality.test.ts`

Expected: FAIL because the three quality concepts are still interfaces and `InspectTarget` accepts an optional tag.

- [ ] **Step 3: Implement the domain classes**

```ts
export class InspectTarget {
  public readonly tag = "latest";

  public constructor(
    public readonly packageName: string,
    public readonly exactVersion: string,
  ) {}
}

export class InspectTargetDependencyScaleQuality {
  public constructor(
    public readonly directDependencyDeclarations: readonly DirectDependencyDeclarationFact[],
    public readonly directDependencyCounts: DirectDependencyCountFact,
  ) {}
}

export class InspectTargetQualityException {
  public constructor(
    public readonly name: string,
    public readonly message: string,
  ) {}
}

export class InspectTargetQuality {
  public constructor(
    public readonly dependencyScale: InspectTargetDependencyScaleQuality | undefined,
    public readonly exceptions: readonly InspectTargetQualityException[],
  ) {}
}
```

- [ ] **Step 4: Write the failing fabricator tests**

```ts
import { describe, expect, it } from "vitest";
import {
  InspectTargetDependencyScaleQuality,
  InspectTargetQuality,
  InspectTargetQualityException,
} from "../model/inspect-target-quality";
import { InspectTargetQualityFabricator } from "./inspect-target-quality-fabricator";

describe("InspectTargetQualityFabricator", () => {
  it("should create quality from successful dimensions and flat exceptions", () => {
    const scale = new InspectTargetDependencyScaleQuality([], {
      runtimeCount: 0,
      optionalCount: 0,
      peerCount: 0,
      bundledCount: 0,
    });
    const exception = new InspectTargetQualityException("ExampleError", "example");

    const result = new InspectTargetQualityFabricator().fabricate(scale, [exception]);

    expect(result).toBeInstanceOf(InspectTargetQuality);
    expect(result).toEqual({ dependencyScale: scale, exceptions: [exception] });
  });
});
```

- [ ] **Step 5: Run the fabricator test and verify it fails**

Run: `mise exec -- pnpm --filter @bluey/npm-plus exec vitest run src/core/quality/inspect-target-quality-fabricator.test.ts`

Expected: FAIL because `InspectTargetQualityFabricator` does not exist.

- [ ] **Step 6: Implement the stateless fabricator**

```ts
import { injectable } from "inversify";
import {
  InspectTargetQuality,
  type InspectTargetDependencyScaleQuality,
  type InspectTargetQualityException,
} from "../model/inspect-target-quality";

@injectable()
export class InspectTargetQualityFabricator {
  public fabricate(
    dependencyScale: InspectTargetDependencyScaleQuality | undefined,
    exceptions: readonly InspectTargetQualityException[],
  ): InspectTargetQuality {
    return new InspectTargetQuality(dependencyScale, exceptions);
  }
}
```

- [ ] **Step 7: Run focused tests and commit**

Run: `mise exec -- pnpm --filter @bluey/npm-plus exec vitest run src/core/model/inspect-target-quality.test.ts src/core/quality/inspect-target-quality-fabricator.test.ts`

Expected: PASS.

```bash
git add mcps/npm-plus/src/core/model/inspect-target.ts mcps/npm-plus/src/core/model/inspect-target-quality.ts mcps/npm-plus/src/core/model/inspect-target-quality.test.ts mcps/npm-plus/src/core/quality/inspect-target-quality-fabricator.ts mcps/npm-plus/src/core/quality/inspect-target-quality-fabricator.test.ts
git commit -m "refactor(npm-plus): model quality results as domain objects"
```

### Task 2: Concrete Core Collaborators

**Files:**
- Modify: `mcps/npm-plus/src/core/quality/dependency-scale-quality-inspector.ts`
- Modify: `mcps/npm-plus/src/core/quality/dependency-scale-quality-inspector.test.ts`
- Modify: `mcps/npm-plus/src/core/quality/quality-dimension-failure-recorder.ts`
- Modify: `mcps/npm-plus/src/core/quality/inspect-target-quality-inspector.ts`
- Modify: `mcps/npm-plus/src/core/quality/inspect-target-quality-inspector.test.ts`
- Modify: `mcps/npm-plus/src/core/target/inspect-target-determiner.ts`
- Modify: `mcps/npm-plus/src/core/target/inspect-target-determiner.test.ts`
- Modify: `mcps/npm-plus/src/core/workflow/inspect-npm-package-quality-workflow-scheduler.ts`
- Modify: `mcps/npm-plus/src/core/workflow/inspect-npm-package-quality-workflow-scheduler.test.ts`

**Interfaces:**
- Changes: `DependencyScaleQualityInspector.inspect(target, manifest): InspectTargetDependencyScaleQuality`.
- Changes: `QualityDimensionFailureRecorder.record(error): InspectTargetQualityException`.
- Changes: `InspectTargetQualityInspector` constructor consumes the three concrete quality services.
- Changes: workflow scheduler constructor consumes concrete determiner and quality inspector classes.
- Preserves: `InspectNpmPackageQualityWorkflow` as a public callable contract for MCP tool/server functions; it is not a DI token.

- [ ] **Step 1: Update dependency-inspector tests to require domain instances and the target argument**

```ts
const result = inspector.inspect(
  new InspectTarget("example-package", "1.0.0"),
  manifest,
);

expect(result).toBeInstanceOf(InspectTargetDependencyScaleQuality);
expect(result.directDependencyCounts).toEqual({
  runtimeCount: 1,
  optionalCount: 0,
  peerCount: 0,
  bundledCount: 0,
});
```

- [ ] **Step 2: Run the dependency-inspector test and verify it fails**

Run: `mise exec -- pnpm --filter @bluey/npm-plus exec vitest run src/core/quality/dependency-scale-quality-inspector.test.ts`

Expected: FAIL because `inspect` currently accepts only a manifest and returns an object literal.

- [ ] **Step 3: Remove the one-to-one inspection interface and return a domain object**

```ts
@injectable()
export class DependencyScaleQualityInspector {
  public inspect(
    _target: InspectTarget,
    manifest: NpmPackageManifest,
  ): InspectTargetDependencyScaleQuality {
    // Keep the current Zod parsing and normalization unchanged.
    return new InspectTargetDependencyScaleQuality(declarations, counts);
  }
}
```

Delete `DependencyScaleQualityInspection`; update all tests and callers to use the concrete class.

- [ ] **Step 4: Update quality-inspector tests for concrete collaborators and fabricator**

Use a test subclass for the failure path because the concrete class is now the DI token:

```ts
class FailingDependencyScaleQualityInspector extends DependencyScaleQualityInspector {
  public override inspect(): never {
    const error = new Error("manifest unavailable");
    error.name = "PackageManifestReadError";
    throw error;
  }
}

const inspector = new InspectTargetQualityInspector(
  new FailingDependencyScaleQualityInspector(),
  new QualityDimensionFailureRecorder(),
  new InspectTargetQualityFabricator(),
);
```

Assert successful results are `InspectTargetQuality` instances and failure records are `InspectTargetQualityException` instances.

- [ ] **Step 5: Run the quality-inspector tests and verify they fail**

Run: `mise exec -- pnpm --filter @bluey/npm-plus exec vitest run src/core/quality/inspect-target-quality-inspector.test.ts`

Expected: FAIL because the constructor lacks the fabricator and the services return object literals.

- [ ] **Step 6: Implement concrete quality collaboration**

```ts
@injectable()
export class QualityDimensionFailureRecorder {
  public record(error: unknown): InspectTargetQualityException {
    return error instanceof Error
      ? new InspectTargetQualityException(error.name, error.message)
      : new InspectTargetQualityException("Error", String(error));
  }
}

@injectable()
export class InspectTargetQualityInspector {
  public constructor(
    private readonly dependencyScaleInspector: DependencyScaleQualityInspector,
    private readonly failureRecorder: QualityDimensionFailureRecorder,
    private readonly fabricator: InspectTargetQualityFabricator,
  ) {}

  public async inspect(
    target: InspectTarget,
    manifest: NpmPackageManifest,
  ): Promise<InspectTargetQuality> {
    try {
      const scale = this.dependencyScaleInspector.inspect(target, manifest);
      return this.fabricator.fabricate(scale, []);
    } catch (error) {
      return this.fabricator.fabricate(undefined, [
        this.failureRecorder.record(error),
      ]);
    }
  }
}
```

- [ ] **Step 7: Replace core DI interfaces with concrete constructor dependencies**

Remove `InspectTargetDetermination` and `InspectTargetQualityInspection`. Update the scheduler constructor:

```ts
public constructor(
  private readonly targetDeterminer: InspectTargetDeterminer,
  private readonly qualityInspector: InspectTargetQualityInspector,
) {}
```

Keep `InspectNpmPackageQualityWorkflow` because MCP adapter functions consume a callable workflow contract and do not use it as an Inversify token.

- [ ] **Step 8: Run all core tests and commit**

Run: `mise exec -- pnpm --filter @bluey/npm-plus exec vitest run src/core`

Expected: PASS.

```bash
git add mcps/npm-plus/src/core
git commit -m "refactor(npm-plus): inject concrete core collaborators"
```

### Task 3: Shared Core Binding Module

**Files:**
- Delete: `mcps/npm-plus/src/composition/npm-package-quality-composition.ts`
- Replace: `mcps/npm-plus/src/composition/npm-package-quality-composition.test.ts`
- Create: `mcps/npm-plus/src/composition/npm-package-quality-module.ts`
- Create: `mcps/npm-plus/src/composition/npm-package-quality-module.test.ts`

**Interfaces:**
- Produces: `npmPackageQualityModule: ContainerModule`.
- Binds: Registry port to Node adapter and every core service to itself in singleton scope.
- Does not produce or expose a Container.

- [ ] **Step 1: Write a failing module integration test**

```ts
import { Container } from "inversify";
import { describe, expect, it } from "vitest";
import { InspectDelegation } from "../core/model/inspect-delegation";
import {
  type NpmPackageManifestResolution,
  NpmPackageRegistry,
} from "../core/ports/npm-package-registry";
import { InspectNpmPackageQualityWorkflowScheduler } from "../core/workflow/inspect-npm-package-quality-workflow-scheduler";
import { npmPackageQualityModule } from "./npm-package-quality-module";

class InMemoryRegistry extends NpmPackageRegistry {
  public async readLatestManifest(): Promise<NpmPackageManifestResolution> {
    return {
      exactVersion: "1.0.0",
      manifest: { version: "1.0.0", dependencies: { helper: "^2.0.0" } },
    };
  }
}

it("should resolve the complete workflow with a replaceable Registry port", async () => {
  const container = new Container({ defaultScope: "Singleton" });
  container.load(npmPackageQualityModule);
  container.rebind(NpmPackageRegistry).to(InMemoryRegistry).inSingletonScope();

  const scheduler = container.get(InspectNpmPackageQualityWorkflowScheduler);
  const result = await scheduler.run(new InspectDelegation("example-package"));

  expect(result.target).toEqual({
    packageName: "example-package",
    exactVersion: "1.0.0",
    tag: "latest",
  });
  expect(result.quality.dependencyScale?.directDependencyCounts.runtimeCount).toBe(1);
});
```

- [ ] **Step 2: Run the module test and verify it fails**

Run: `mise exec -- pnpm --filter @bluey/npm-plus exec vitest run src/composition/npm-package-quality-module.test.ts`

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement the shared ContainerModule**

```ts
import { ContainerModule } from "inversify";

export const npmPackageQualityModule = new ContainerModule(({ bind }) => {
  bind(NpmPackageRegistry).to(NodeNpmPackageRegistry).inSingletonScope();
  bind(InspectTargetDeterminer).toSelf().inSingletonScope();
  bind(DependencyScaleQualityInspector).toSelf().inSingletonScope();
  bind(QualityDimensionFailureRecorder).toSelf().inSingletonScope();
  bind(InspectTargetQualityFabricator).toSelf().inSingletonScope();
  bind(InspectTargetQualityInspector).toSelf().inSingletonScope();
  bind(InspectNpmPackageQualityWorkflowScheduler).toSelf().inSingletonScope();
});
```

- [ ] **Step 4: Delete the manual composition object and run the module test**

Remove `npm-package-quality-composition.ts` and its obsolete test after the new integration test covers Registry replacement and complete workflow resolution.

Run: `mise exec -- pnpm --filter @bluey/npm-plus exec vitest run src/composition/npm-package-quality-module.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add mcps/npm-plus/src/composition
git commit -m "refactor(npm-plus): define shared core bindings"
```

### Task 4: Independent CLI Composition Root

**Files:**
- Modify: `mcps/npm-plus/src/facade/report/inspect-report-formatter.ts`
- Modify: `mcps/npm-plus/src/facade/inspect-handler.ts`
- Modify: `mcps/npm-plus/src/facade/inspect-handler.test.ts`
- Create: `mcps/npm-plus/src/composition/cli-composition.ts`
- Create: `mcps/npm-plus/src/composition/cli-composition.test.ts`

**Interfaces:**
- Produces: abstract `InspectHandlerDependencies.stdout(text: string): void`.
- Produces: injectable `NodeInspectHandlerDependencies` using `process.stdout.write`.
- Changes: `InspectHandler` constructor consumes the concrete scheduler, formatter, and abstract runtime dependency.
- Produces: `createInspectHandler(): InspectHandler` from a fresh CLI Container.

- [ ] **Step 1: Update handler tests for injected class dependencies**

```ts
class CapturingDependencies extends InspectHandlerDependencies {
  public output = "";

  public stdout(text: string): void {
    this.output += text;
  }
}

const dependencies = new CapturingDependencies();
const handler = new InspectHandler(
  scheduler,
  new InspectReportFormatter(),
  dependencies,
);
```

Use a scheduler subclass or a real scheduler with an in-memory Registry. Preserve every existing JSON, human report, exception, and empty-input assertion.

- [ ] **Step 2: Run handler tests and verify they fail**

Run: `mise exec -- pnpm --filter @bluey/npm-plus exec vitest run src/facade/inspect-handler.test.ts`

Expected: FAIL because the handler still accepts a function and constructs its formatter by default.

- [ ] **Step 3: Implement the CLI runtime boundary and injectable handler**

```ts
export abstract class InspectHandlerDependencies {
  public abstract stdout(text: string): void;
}

@injectable()
export class NodeInspectHandlerDependencies extends InspectHandlerDependencies {
  public stdout(text: string): void {
    process.stdout.write(text);
  }
}

@injectable()
export class InspectHandler {
  public constructor(
    private readonly scheduler: InspectNpmPackageQualityWorkflowScheduler,
    private readonly formatter: InspectReportFormatter,
    private readonly dependencies: InspectHandlerDependencies,
  ) {}
}
```

Mark `InspectReportFormatter` with `@injectable()` because the Container constructs it.

- [ ] **Step 4: Write the failing CLI composition test**

```ts
it("should resolve a fully injected CLI handler", () => {
  expect(createInspectHandler()).toBeInstanceOf(InspectHandler);
});
```

- [ ] **Step 5: Implement the independent CLI composition root**

```ts
export function createInspectHandler(): InspectHandler {
  const container = new Container({ defaultScope: "Singleton" });
  container.load(npmPackageQualityModule);
  container.bind(InspectHandlerDependencies).to(NodeInspectHandlerDependencies);
  container.bind(InspectReportFormatter).toSelf();
  container.bind(InspectHandler).toSelf();
  return container.get(InspectHandler);
}
```

- [ ] **Step 6: Run CLI-focused tests and commit**

Run: `mise exec -- pnpm --filter @bluey/npm-plus exec vitest run src/facade/inspect-handler.test.ts src/composition/cli-composition.test.ts`

Expected: PASS.

```bash
git add mcps/npm-plus/src/facade/inspect-handler.ts mcps/npm-plus/src/facade/inspect-handler.test.ts mcps/npm-plus/src/facade/report/inspect-report-formatter.ts mcps/npm-plus/src/composition/cli-composition.ts mcps/npm-plus/src/composition/cli-composition.test.ts
git commit -m "refactor(npm-plus): add CLI composition root"
```

### Task 5: Independent MCP Composition Root

**Files:**
- Modify: `mcps/npm-plus/src/mcp/server.ts`
- Preserve and adjust: `mcps/npm-plus/src/mcp/server.test.ts`
- Create: `mcps/npm-plus/src/mcp/transport.ts`
- Modify: `mcps/npm-plus/src/facade/mcp-handler.ts`
- Modify: `mcps/npm-plus/src/facade/mcp-handler.test.ts`
- Create: `mcps/npm-plus/src/composition/mcp-composition.ts`
- Create: `mcps/npm-plus/src/composition/mcp-composition.test.ts`

**Interfaces:**
- Produces: abstract `NpmPlusMcpServerFactory.create(workflow): McpServer`.
- Produces: injectable `DefaultNpmPlusMcpServerFactory` delegating to `setupMcpServer`.
- Produces: abstract `McpTransportFactory.create(): Transport`.
- Produces: injectable `StdioMcpTransportFactory` returning `StdioServerTransport`.
- Changes: `McpHandler` constructor consumes the concrete scheduler plus the two abstract MCP boundaries.
- Produces: `createMcpHandler(): McpHandler` from a fresh MCP Container.

- [ ] **Step 1: Write failing MCP handler lifecycle tests**

```ts
class FakeServerFactory extends NpmPlusMcpServerFactory {
  public connectedTransport: Transport | undefined;

  public create(): McpServer {
    return {
      connect: async (transport: Transport) => {
        this.connectedTransport = transport;
      },
    } as McpServer;
  }
}

class FakeTransportFactory extends McpTransportFactory {
  public constructor(private readonly transport: Transport) {
    super();
  }

  public create(): Transport {
    return this.transport;
  }
}

it("should connect the injected server to the injected transport", async () => {
  const serverFactory = new FakeServerFactory();
  const transport = {} as Transport;
  const handler = new McpHandler(
    scheduler,
    serverFactory,
    new FakeTransportFactory(transport),
  );

  await handler.run();

  expect(serverFactory.connectedTransport).toBe(transport);
});
```

- [ ] **Step 2: Run the handler test and verify it fails**

Run: `mise exec -- pnpm --filter @bluey/npm-plus exec vitest run src/facade/mcp-handler.test.ts`

Expected: FAIL because the handler still receives the old composition object and constructs stdio directly.

- [ ] **Step 3: Implement MCP server and transport factories**

```ts
export abstract class NpmPlusMcpServerFactory {
  public abstract create(workflow: InspectNpmPackageQualityWorkflow): McpServer;
}

@injectable()
export class DefaultNpmPlusMcpServerFactory extends NpmPlusMcpServerFactory {
  public create(workflow: InspectNpmPackageQualityWorkflow): McpServer {
    return setupMcpServer(workflow);
  }
}

export abstract class McpTransportFactory {
  public abstract create(): Transport;
}

@injectable()
export class StdioMcpTransportFactory extends McpTransportFactory {
  public create(): Transport {
    return new StdioServerTransport();
  }
}
```

- [ ] **Step 4: Refactor the injectable MCP handler**

```ts
@injectable()
export class McpHandler {
  public constructor(
    private readonly scheduler: InspectNpmPackageQualityWorkflowScheduler,
    private readonly serverFactory: NpmPlusMcpServerFactory,
    private readonly transportFactory: McpTransportFactory,
  ) {}

  public async run(): Promise<void> {
    const server = this.serverFactory.create(this.scheduler);
    await server.connect(this.transportFactory.create());
  }
}
```

- [ ] **Step 5: Write and implement the independent MCP composition root**

```ts
export function createMcpHandler(): McpHandler {
  const container = new Container({ defaultScope: "Singleton" });
  container.load(npmPackageQualityModule);
  container.bind(NpmPlusMcpServerFactory).to(DefaultNpmPlusMcpServerFactory);
  container.bind(McpTransportFactory).to(StdioMcpTransportFactory);
  container.bind(McpHandler).toSelf();
  return container.get(McpHandler);
}
```

Add a composition test asserting `createMcpHandler()` returns `McpHandler`. Keep `server.test.ts` as the protocol contract test using in-memory transport.

- [ ] **Step 6: Run MCP-focused tests and commit**

Run: `mise exec -- pnpm --filter @bluey/npm-plus exec vitest run src/facade/mcp-handler.test.ts src/composition/mcp-composition.test.ts src/mcp/server.test.ts src/mcp/tools/inspect-npm-package.test.ts`

Expected: PASS.

```bash
git add mcps/npm-plus/src/facade/mcp-handler.ts mcps/npm-plus/src/facade/mcp-handler.test.ts mcps/npm-plus/src/mcp/server.ts mcps/npm-plus/src/mcp/server.test.ts mcps/npm-plus/src/mcp/transport.ts mcps/npm-plus/src/composition/mcp-composition.ts mcps/npm-plus/src/composition/mcp-composition.test.ts
git commit -m "refactor(npm-plus): add MCP composition root"
```

### Task 6: Entry Routing, Contract Preservation, and Full Verification

**Files:**
- Modify: `mcps/npm-plus/src/index.ts`
- Modify as required by class construction: `mcps/npm-plus/src/mcp/tools/inspect-npm-package.test.ts`
- Modify as required by class construction: `mcps/npm-plus/src/mcp/server.test.ts`
- Modify as required by class construction: `mcps/npm-plus/tests/e2e/cli.test.ts`
- Delete if still present: `mcps/npm-plus/src/composition/npm-package-quality-composition.ts`
- Delete if still present: `mcps/npm-plus/src/composition/npm-package-quality-composition.test.ts`

**Interfaces:**
- Consumes: `createInspectHandler(): InspectHandler` from CLI composition.
- Consumes: `createMcpHandler(): McpHandler` from MCP composition.
- Preserves: `npm-plus inspect <package-name> [--json]` and `npm-plus mcp`.

- [ ] **Step 1: Refactor Commander actions to call only their own roots**

```ts
import { createInspectHandler } from "./composition/cli-composition";
import { createMcpHandler } from "./composition/mcp-composition";

// inspect action
await createInspectHandler().run(packageName, options);

// mcp action
await createMcpHandler().run();
```

Remove imports of `NpmPackageQualityComposition`, direct scheduler construction, direct formatter construction, and handler runtime lambdas from `index.ts`.

- [ ] **Step 2: Run the unit suite and fix only migration-related type/test fixtures**

Run: `mise exec -- pnpm --filter @bluey/npm-plus run test:unit`

Expected: PASS. Update object-literal workflow fixtures to use the new domain constructors where a runtime instance assertion requires it; do not alter public expected JSON.

- [ ] **Step 3: Run typecheck**

Run: `mise exec -- pnpm --filter @bluey/npm-plus run typecheck`

Expected: exit code 0 with no TypeScript diagnostics.

- [ ] **Step 4: Run build and E2E**

Run: `mise exec -- pnpm --filter @bluey/npm-plus run build`

Expected: exit code 0 and regenerated `dist/index.mjs`/types.

Run: `mise exec -- pnpm --filter @bluey/npm-plus run test:e2e`

Expected: PASS with unchanged CLI JSON and human output contracts.

- [ ] **Step 5: Audit architecture constraints**

Run:

```bash
rg -n "new (InspectTargetDeterminer|DependencyScaleQualityInspector|QualityDimensionFailureRecorder|InspectTargetQualityFabricator|InspectTargetQualityInspector|InspectNpmPackageQualityWorkflowScheduler)" mcps/npm-plus/src --glob '!*.test.ts'
rg -n "Container" mcps/npm-plus/src --glob '!composition/*.ts' --glob '!*.test.ts'
rg -n "NpmPackageQualityComposition|DependencyScaleQualityInspection|InspectTargetQualityInspection|InspectTargetDetermination" mcps/npm-plus/src
```

Expected:

- The first command has no production matches outside binding declarations.
- The second command has no production matches outside `src/composition`.
- The third command has no matches.

- [ ] **Step 6: Run package verification once more**

Run: `mise exec -- pnpm --filter @bluey/npm-plus test && mise exec -- pnpm --filter @bluey/npm-plus run typecheck && mise exec -- pnpm --filter @bluey/npm-plus run build`

Expected: all commands exit 0.

- [ ] **Step 7: Review the final diff and commit**

Run: `git diff --check && git status --short && git diff --stat`

Verify that `mcps/npm-plus/AGENTS.md` remains untracked and unstaged.

```bash
git add mcps/npm-plus/src mcps/npm-plus/tests/e2e/cli.test.ts docs/superpowers/plans/2026-10-30-npm-plus-dependency-injection-refactor.md
git commit -m "refactor(npm-plus): separate CLI and MCP composition"
```

## Final Acceptance

- CLI and MCP resolve handlers from different Containers.
- Both Containers load the same core `ContainerModule` and share no instances.
- Every injected core collaborator uses a concrete or abstract class token.
- The object model and Fabricator match `specs/npm-plus/design.md`.
- Target errors still escape the workflow; dimension errors remain successful quality results.
- CLI and MCP public contracts are unchanged.
- Unit tests, E2E tests, typecheck, and build pass.
