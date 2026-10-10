# md-linkage Inversify Container Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Configure `@bluey/md-linkage` with one package-owned Inversify container and prove that consumers can bind and resolve through it.

**Architecture:** A dedicated `container.ts` module imports reflection metadata and constructs the package's sole `Container`. The public entry point re-exports that instance; domain services and bindings remain outside this change.

**Tech Stack:** TypeScript, Inversify, reflect-metadata, Vitest, pnpm, tsdown

**Spec:** `docs/superpowers/specs/2026-10-10-md-linkage-inversify-container-design.md`

## Global Constraints

- Maintain exactly one module-owned container instance; do not expose a container factory.
- Prefer explicit class-constructor bindings; keep automatic binding disabled.
- Use symbol or string service identifiers only when a class cannot identify the dependency.
- Do not scaffold or bind md-linkage domain services.
- Keep the user's existing `specs/md-linkage/object-oriented-design.md` changes untouched.

---

### Task 1: Add and verify the package-owned container

**Files:**
- Create: `mcps/md-linkage/src/container.ts`
- Create: `mcps/md-linkage/src/container.test.ts`
- Modify: `mcps/md-linkage/src/index.ts`
- Modify: `mcps/md-linkage/package.json`
- Modify: `mcps/md-linkage/tsconfig.json`
- Modify: `pnpm-lock.yaml`

**Interfaces:**
- Consumes: Inversify's `Container` class and reflect-metadata initialization.
- Produces: `container: Container`, exported from both `src/container.ts` and the package entry point, with explicit class-constructor bindings as the default convention.

- [x] **Step 1: Install the runtime dependencies and enable decorator metadata**

Run:

```bash
corepack pnpm --filter @bluey/md-linkage add inversify reflect-metadata
```

Add these options to `mcps/md-linkage/tsconfig.json` under `compilerOptions`:

```json
"experimentalDecorators": true,
"emitDecoratorMetadata": true
```

- [x] **Step 2: Write the failing container test**

Create `mcps/md-linkage/src/container.test.ts`:

```ts
import { Container, inject, injectable } from "inversify";
import { describe, expect, it } from "vitest";

import { container as directContainer } from "./container.js";
import { container as publicContainer } from "./index.js";

@injectable()
class TestRepository {}

@injectable()
class TestService {
  constructor(
    @inject(TestRepository) readonly repository: TestRepository,
  ) {}
}

describe("md-linkage dependency injection container", () => {
  it("resolves explicitly bound classes by constructor token", () => {
    expect(publicContainer).toBe(directContainer);
    expect(publicContainer).toBeInstanceOf(Container);
    expect(() => publicContainer.get(TestService)).toThrow();

    publicContainer.bind(TestRepository).toSelf();
    publicContainer.bind(TestService).toSelf();

    const service = publicContainer.get(TestService);

    expect(service).toBeInstanceOf(TestService);
    expect(service.repository).toBeInstanceOf(TestRepository);
  });
});
```

- [x] **Step 3: Run the test and verify the intended failure**

Run:

```bash
corepack pnpm --filter @bluey/md-linkage test -- src/container.test.ts
```

Expected: FAIL because `src/container.ts` does not exist and `src/index.ts` does not export `container`.

- [x] **Step 4: Add the minimal container implementation**

Create `mcps/md-linkage/src/container.ts`:

```ts
import "reflect-metadata";

import { Container } from "inversify";

export const container = new Container();
```

Replace `mcps/md-linkage/src/index.ts` with:

```ts
export { container } from "./container.js";
```

- [x] **Step 5: Run the focused test and verify it passes**

Run:

```bash
corepack pnpm --filter @bluey/md-linkage test -- src/container.test.ts
```

Expected: PASS with one passing test and no warnings.

- [x] **Step 6: Verify the complete package**

Run:

```bash
corepack pnpm --filter @bluey/md-linkage test
corepack pnpm --filter @bluey/md-linkage typecheck
corepack pnpm --filter @bluey/md-linkage build
```

Expected: all three commands exit successfully with no TypeScript or build errors.

- [x] **Step 7: Commit the implementation**

```bash
git add mcps/md-linkage/src/container.ts mcps/md-linkage/src/container.test.ts mcps/md-linkage/src/index.ts mcps/md-linkage/package.json mcps/md-linkage/tsconfig.json pnpm-lock.yaml docs/superpowers/plans/2026-10-10-md-linkage-inversify-container.md
git commit -m "chore(md-linkage): configure Inversify container"
```
