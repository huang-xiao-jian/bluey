# MD Linkage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the complete Markdown dead-link checker described by `specs/md-linkage/`, including its shared core workflow, CLI, and MCP interfaces.

**Architecture:** Model the specification's immutable inputs and outcomes under `src/core/model/`, keep checking responsibilities in focused scope, document, batch, and workflow modules, and isolate Node filesystem access behind a core port. Assemble the dependency graph in `src/composition/create-application-container.ts`; inject the same workflow into sibling CLI and MCP adapters so both surfaces produce semantically identical reports.

**Tech Stack:** TypeScript, Node.js 26, Vitest, Commander, Zod, Inversify, `@modelcontextprotocol/sdk`, `mdast-util-from-markdown`, `unist-util-visit`, `mdast-util-to-string`, and `github-slugger`

**Spec:** `specs/md-linkage/spec.md`, `specs/md-linkage/design.md`, and `specs/md-linkage/interfaces/spec.md`

## Global Constraints

- Implement both `md-linkage check <files...>` and `md-linkage mcp` in one package.
- Keep CLI and MCP as sibling adapters over one core workflow; neither adapter may contain scope-building or link-checking rules.
- Preserve delegated file order and admit each starting or recursively discovered document at most once.
- Check project containment before target existence or anchor identity.
- Treat scope issues and dead links as completed findings, not invocation failures.
- Use GitHub-compatible heading identifiers, including duplicate-heading suffixes.
- Keep protocol output on stdout and diagnostics on stderr.
- Use classes for stateful domain behavior and dependency boundaries; keep schemas and small stateless transformations as functions or constants.
- Colocate unit tests with source files and place protocol/process tests under `tests/e2e/`.
- Keep imports extensionless and use `import type` for type-only imports.
- Preserve the user's existing uncommitted `AGENTS.md` change.

---

## File Structure

```text
mcps/md-linkage/
├── src/
│   ├── composition/
│   │   └── create-application-container.ts
│   ├── core/
│   │   ├── model/
│   │   │   ├── link-check-delegation.ts
│   │   │   ├── link-check-scope.ts
│   │   │   ├── link-check-report.ts
│   │   │   ├── specification-document.ts
│   │   │   ├── specification-link.ts
│   │   │   └── resolved-specification-link.ts
│   │   ├── ports/
│   │   │   └── specification-document-store.ts
│   │   ├── scope/
│   │   │   └── link-check-scope-builder.ts
│   │   ├── document/
│   │   │   ├── specification-link-extractor.ts
│   │   │   ├── specification-heading-cataloger.ts
│   │   │   ├── specification-link-checker.ts
│   │   │   └── specification-document-checker.ts
│   │   ├── batch/
│   │   │   ├── specification-document-repository.ts
│   │   │   ├── referenced-document-discoverer.ts
│   │   │   └── specification-document-batch-checker.ts
│   │   └── workflow/
│   │       ├── link-check-report-fabricator.ts
│   │       └── link-check-workflow-scheduler.ts
│   ├── infrastructure/filesystem/
│   │   └── node-specification-document-store.ts
│   ├── facade/
│   │   ├── cli/
│   │   │   ├── check-command.ts
│   │   │   └── report-formatter.ts
│   │   └── mcp.ts
│   ├── mcp/
│   │   ├── tools/check-specification-links.ts
│   │   └── server.ts
│   └── index.ts
└── tests/e2e/
    ├── cli.test.ts
    └── mcp.test.ts
```

Each implementation file receives a colocated `*.test.ts` where it owns independently observable behavior.

### Task 1: Domain Models and Filesystem Boundary

**Files:**

- Create: `mcps/md-linkage/src/core/model/link-check-delegation.ts`
- Create: `mcps/md-linkage/src/core/model/link-check-scope.ts`
- Create: `mcps/md-linkage/src/core/model/specification-document.ts`
- Create: `mcps/md-linkage/src/core/model/specification-link.ts`
- Create: `mcps/md-linkage/src/core/model/resolved-specification-link.ts`
- Create: `mcps/md-linkage/src/core/model/link-check-report.ts`
- Create: `mcps/md-linkage/src/core/model/link-check-delegation.test.ts`
- Create: `mcps/md-linkage/src/core/ports/specification-document-store.ts`
- Create: `mcps/md-linkage/src/infrastructure/filesystem/node-specification-document-store.ts`
- Create: `mcps/md-linkage/src/infrastructure/filesystem/node-specification-document-store.test.ts`
- Modify: `mcps/md-linkage/package.json`
- Modify: `pnpm-lock.yaml`

**Interfaces:**

- Produces: `LinkCheckDelegation`, `LinkCheckMode`, `LinkCheckScope`, `LinkCheckScopeIssue`, `SpecificationDocument`, `SpecificationLink`, `ResolvedSpecificationLink`, and `LinkCheckReport`.
- Produces: `SpecificationDocumentStore` with root canonicalization, path resolution, existence/type checks, and UTF-8 document reads.

- [ ] **Step 1: Add parser dependencies**

Run:

```bash
corepack pnpm --filter @bluey/md-linkage add mdast-util-from-markdown unist-util-visit mdast-util-to-string github-slugger
corepack pnpm --filter @bluey/md-linkage add -D @types/mdast
```

Expected: package manifest and lockfile include all five packages selected by `mcps/md-linkage/AGENTS.md`.

- [ ] **Step 2: Write failing model-validation tests**

Cover construction of a valid shallow delegation and rejection of an empty/relative root, empty file list, empty paths, globs, and unsupported modes. A representative test is:

```ts
it("rejects a relative project root", () => {
  expect(
    () => new LinkCheckDelegation("relative/root", ["spec.md"]),
  ).toThrowError("Project root must be an absolute path");
});
```

- [ ] **Step 3: Run the model test and verify RED**

Run:

```bash
corepack pnpm --filter @bluey/md-linkage exec vitest run src/core/model/link-check-delegation.test.ts
```

Expected: FAIL because `LinkCheckDelegation` does not exist.

- [ ] **Step 4: Implement immutable domain models**

Use constructor validation only for delegation invariants. Keep reports, scopes, documents, and link outcomes immutable through readonly constructor fields. Define enum string values exactly as specified, including `shallow`, `recursive`, `document-not-found`, `file-not-found`, `live`, and `dead`.

- [ ] **Step 5: Run the model test and verify GREEN**

Run the Task 1 model test command. Expected: PASS.

- [ ] **Step 6: Write failing Node store tests**

Use a temporary fixture directory to verify that the store canonicalizes an existing directory root, rejects a missing or non-directory root, resolves paths, distinguishes files from directories, identifies `.md` case-insensitively, and reads UTF-8 content.

- [ ] **Step 7: Run the store test and verify RED**

Run:

```bash
corepack pnpm --filter @bluey/md-linkage exec vitest run src/infrastructure/filesystem/node-specification-document-store.test.ts
```

Expected: FAIL because the port and Node adapter do not exist.

- [ ] **Step 8: Implement the store port and Node adapter**

The port must expose explicit operations rather than leaking `node:fs` values:

```ts
export interface SpecificationDocumentStore {
  establishRoot(root: string): Promise<string>;
  resolvePath(root: string, documentPath: string): string;
  isWithinRoot(root: string, targetPath: string): boolean;
  exists(targetPath: string): Promise<boolean>;
  isFile(targetPath: string): Promise<boolean>;
  isMarkdown(targetPath: string): boolean;
  readDocument(root: string, relativePath: string): Promise<SpecificationDocument>;
}
```

Use `realpath` for the root and `relative`-based containment checks that reject `..` escapes and absolute paths outside the root.

- [ ] **Step 9: Run Task 1 tests and commit**

Run both Task 1 test files, then:

```bash
git add mcps/md-linkage/package.json pnpm-lock.yaml mcps/md-linkage/src/core mcps/md-linkage/src/infrastructure
git commit -m "feat(md-linkage): add domain model and document store"
```

### Task 2: Scope Construction

**Files:**

- Create: `mcps/md-linkage/src/core/scope/link-check-scope-builder.ts`
- Create: `mcps/md-linkage/src/core/scope/link-check-scope-builder.test.ts`

**Interfaces:**

- Consumes: `LinkCheckDelegation` and `SpecificationDocumentStore`.
- Produces: `LinkCheckScopeBuilder.build(delegation): Promise<LinkCheckScope>`.

- [ ] **Step 1: Write failing scope-builder tests**

Cover stable-root establishment, ordered path evaluation, relative and absolute inputs, out-of-root paths, missing paths, directories/non-Markdown targets, deduplication by project-relative identity, and the valid empty-file scope when every delegated path has an issue.

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
corepack pnpm --filter @bluey/md-linkage exec vitest run src/core/scope/link-check-scope-builder.test.ts
```

Expected: FAIL because `LinkCheckScopeBuilder` does not exist.

- [ ] **Step 3: Implement scope construction**

Implement the algorithm in `specs/md-linkage/roles/LinkCheckScopeBuilder.md` exactly: establish root once, evaluate every supplied path independently, record one typed issue per rejected path, preserve issue order, and deduplicate valid project-relative files without reordering them.

- [ ] **Step 4: Run the test and verify GREEN, then commit**

Run the Task 2 test command, then:

```bash
git add mcps/md-linkage/src/core/scope
git commit -m "feat(md-linkage): build ordered link check scopes"
```

### Task 3: Markdown Extraction, Heading Cataloging, and Link Resolution

**Files:**

- Create: `mcps/md-linkage/src/core/document/specification-link-extractor.ts`
- Create: `mcps/md-linkage/src/core/document/specification-link-extractor.test.ts`
- Create: `mcps/md-linkage/src/core/document/specification-heading-cataloger.ts`
- Create: `mcps/md-linkage/src/core/document/specification-heading-cataloger.test.ts`
- Create: `mcps/md-linkage/src/core/document/specification-link-checker.ts`
- Create: `mcps/md-linkage/src/core/document/specification-link-checker.test.ts`
- Create: `mcps/md-linkage/src/core/document/specification-document-checker.ts`
- Create: `mcps/md-linkage/src/core/document/specification-document-checker.test.ts`

**Interfaces:**

- Produces: `SpecificationLinkExtractor.extract(document): readonly SpecificationLink[]`.
- Produces: `SpecificationHeadingCataloger.catalog(content): ReadonlyMap<string, string>`.
- Produces: `SpecificationLinkChecker.check(root, source, link, sourceHeadings): Promise<ResolvedSpecificationLink>`.
- Produces: `SpecificationDocumentChecker.check(root, document): Promise<AtomicLinkCheckArtifact>`.

- [ ] **Step 1: Write and fail extraction tests**

Verify authored Markdown preservation and classification of local-file, in-file-anchor, and cross-file-anchor links. Verify external protocols, images, empty destinations, and non-Markdown target kinds are ignored. Run the extractor test and confirm failure because the class is missing.

- [ ] **Step 2: Implement the extractor and verify GREEN**

Parse with `fromMarkdown`, visit `link` nodes, reconstruct the exact authored link from the node offsets, and classify only the three supported forms. Keep URL decoding limited to anchor comparison; preserve authored `path`, `anchor`, `name`, and `text` values in the model.

- [ ] **Step 3: Write and fail heading-catalog tests**

Verify plain and formatted headings, punctuation normalization, Unicode handling, duplicate suffixes, and explicit matching of GitHub-style generated IDs. Confirm the test fails because the cataloger is missing.

- [ ] **Step 4: Implement the cataloger and verify GREEN**

Use `mdast-util-to-string` and one `GithubSlugger` instance per document. Return an ID-to-visible-name map so resolved targets can include `anchorName` only when a heading is known.

- [ ] **Step 5: Write and fail link-checker tests**

Cover each live form and the precedence cases `TargetOutsideProjectRoot`, `FileNotFound`, and `AnchorNotFound`. Verify that cross-file missing targets produce only `FileNotFound`, and that in-file anchors resolve to the absolute source path.

- [ ] **Step 6: Implement the link checker and verify GREEN**

Resolve file paths relative to the source document directory, stop immediately when containment fails, stop on missing/non-file targets, read cross-file content only when an anchor must be checked, normalize a leading `#` away for comparison, and return exactly one immutable result.

- [ ] **Step 7: Write and fail document-checker tests**

Verify every extracted link is checked once, original order is preserved within live/dead collections, and a document with no supported links returns two empty arrays.

- [ ] **Step 8: Implement the document checker and verify GREEN**

Coordinate the extractor, cataloger, and checker without duplicating any of their rules.

- [ ] **Step 9: Run Task 3 tests and commit**

Run:

```bash
corepack pnpm --filter @bluey/md-linkage exec vitest run src/core/document
git add mcps/md-linkage/src/core/document
git commit -m "feat(md-linkage): check links within Markdown documents"
```

### Task 4: Batch Traversal and Workflow

**Files:**

- Create: `mcps/md-linkage/src/core/batch/specification-document-repository.ts`
- Create: `mcps/md-linkage/src/core/batch/specification-document-repository.test.ts`
- Create: `mcps/md-linkage/src/core/batch/referenced-document-discoverer.ts`
- Create: `mcps/md-linkage/src/core/batch/referenced-document-discoverer.test.ts`
- Create: `mcps/md-linkage/src/core/batch/specification-document-batch-checker.ts`
- Create: `mcps/md-linkage/src/core/batch/specification-document-batch-checker.test.ts`
- Create: `mcps/md-linkage/src/core/workflow/link-check-report-fabricator.ts`
- Create: `mcps/md-linkage/src/core/workflow/link-check-workflow-scheduler.ts`
- Create: `mcps/md-linkage/src/core/workflow/link-check-workflow-scheduler.test.ts`

**Interfaces:**

- Produces: an ordered repository with `enqueue`, `takeNext`, and membership checks.
- Produces: recursive discovery limited to live, in-root Markdown file targets.
- Produces: `SpecificationDocumentBatchChecker.check(delegation, scope): Promise<readonly DeadResolvedSpecificationLink[]>`.
- Produces: `LinkCheckWorkflowScheduler.run(delegation): Promise<LinkCheckReport>`.

- [ ] **Step 1: Write and fail repository tests**

Verify FIFO order, uniqueness across pending and checked identities, cycle prevention, and an empty result after exhaustion.

- [ ] **Step 2: Implement the repository and verify GREEN**

Keep pending order private and membership normalized to project-relative path identity. Mark an item checked when it is taken so it cannot be re-enqueued during its own processing.

- [ ] **Step 3: Write and fail discovery tests**

Verify that only live local-file and cross-file-anchor targets ending in `.md` are returned, while in-file anchors, dead links, non-Markdown files, and known identities are excluded.

- [ ] **Step 4: Implement discovery and verify GREEN**

Derive project-relative target identities from already resolved absolute target paths and leave repository mutation to the batch checker.

- [ ] **Step 5: Write and fail batch-checker tests**

Verify shallow checks process only starting files, recursive checks use breadth-first discovery order, cycles terminate, duplicate links do not duplicate document checks, and dead outcomes aggregate in document/link order.

- [ ] **Step 6: Implement batch checking and verify GREEN**

Initialize one repository per check, load each next document through the port, invoke the single-document checker, aggregate dead links, and enqueue eligible live discoveries only in recursive mode.

- [ ] **Step 7: Write and fail workflow tests**

Verify the scheduler builds the scope once, checks the batch once, and fabricates a report preserving the original delegation and exact scope. Verify invalid-root errors prevent report creation.

- [ ] **Step 8: Implement workflow coordination and verify GREEN**

Keep `LinkCheckReportFabricator` as a stateless report construction boundary and `LinkCheckWorkflowScheduler` as the only end-to-end coordinator.

- [ ] **Step 9: Run Task 4 tests and commit**

Run:

```bash
corepack pnpm --filter @bluey/md-linkage exec vitest run src/core/batch src/core/workflow
git add mcps/md-linkage/src/core/batch mcps/md-linkage/src/core/workflow
git commit -m "feat(md-linkage): add recursive batch workflow"
```

### Task 5: Composition Root and CLI Adapter

**Files:**

- Create: `mcps/md-linkage/src/composition/create-application-container.ts`
- Create: `mcps/md-linkage/src/composition/create-application-container.test.ts`
- Create: `mcps/md-linkage/src/facade/cli/report-formatter.ts`
- Create: `mcps/md-linkage/src/facade/cli/report-formatter.test.ts`
- Create: `mcps/md-linkage/src/facade/cli/check-command.ts`
- Create: `mcps/md-linkage/src/facade/cli/check-command.test.ts`
- Modify: `mcps/md-linkage/src/index.ts`
- Modify: `mcps/md-linkage/package.json`

**Interfaces:**

- Produces: `createApplicationContainer(): Container` as the sole DI assembly point.
- Produces: `createProgram(dependencies): Command` and an executable `run(argv)` entry point.
- Produces: deterministic human and JSON report rendering.

- [ ] **Step 1: Write and fail container tests**

Verify that a new container resolves `LinkCheckWorkflowScheduler` and that its filesystem port is the Node adapter without exposing container access from adapters.

- [ ] **Step 2: Implement composition and verify GREEN**

Bind the port token and every stateful service explicitly. Keep all Inversify imports and binding decisions inside `src/composition/`; adapters receive resolved dependencies through constructors or factory arguments.

- [ ] **Step 3: Write and fail formatter tests**

Verify human output includes document, scope-issue, and dead-link counts plus every finding; verify JSON output equals `JSON.stringify(report)` with no extra text.

- [ ] **Step 4: Implement formatting and verify GREEN**

Keep presentation separate from Commander parsing and workflow execution.

- [ ] **Step 5: Write and fail command tests**

Inject a fake workflow and captured stdout/stderr. Verify current-directory and shallow defaults, explicit root/mode mapping, file arguments preserved as supplied, human/JSON output, and exit codes `0`, `1`, and `2`.

- [ ] **Step 6: Implement the CLI command and verify GREEN**

Use Commander for `check <files...>`, validate user inputs before delegation construction, resolve only the CLI root, invoke the workflow once, and return an exit code rather than calling `process.exit` inside the command module.

- [ ] **Step 7: Wire the executable**

Add a package `bin` entry for `md-linkage`, a shebang-compatible bundled entry, and top-level error handling that writes diagnostics to stderr. The `mcp` subcommand will be wired in Task 6.

- [ ] **Step 8: Run Task 5 tests, build, and commit**

Run:

```bash
corepack pnpm --filter @bluey/md-linkage exec vitest run src/composition src/facade/cli
corepack pnpm --filter @bluey/md-linkage build
git add mcps/md-linkage/src/composition mcps/md-linkage/src/facade/cli mcps/md-linkage/src/index.ts mcps/md-linkage/package.json
git commit -m "feat(md-linkage): expose link checking CLI"
```

### Task 6: MCP Adapter

**Files:**

- Create: `mcps/md-linkage/src/mcp/tools/check-specification-links.ts`
- Create: `mcps/md-linkage/src/mcp/tools/check-specification-links.test.ts`
- Create: `mcps/md-linkage/src/mcp/server.ts`
- Create: `mcps/md-linkage/src/mcp/server.test.ts`
- Create: `mcps/md-linkage/src/facade/mcp.ts`
- Create: `mcps/md-linkage/src/facade/mcp.test.ts`
- Modify: `mcps/md-linkage/src/index.ts`

**Interfaces:**

- Produces: `CheckSpecificationLinksInputSchema` and `CheckSpecificationLinksOutputSchema`.
- Produces: `CheckSpecificationLinksTool` with an injected workflow callback.
- Produces: `setupMcpServer(workflow): McpServer` and stdio startup through the CLI `mcp` subcommand.

- [ ] **Step 1: Write and fail tool-schema tests**

Verify rejection of relative/empty roots, empty file collections, empty paths, globs, and unsupported mode values. Verify omission of `mode` becomes `shallow` and no root default exists.

- [ ] **Step 2: Implement schemas and verify GREEN**

Use Zod refinements at the MCP boundary and map parsed input to `LinkCheckDelegation` exactly once.

- [ ] **Step 3: Write and fail callback tests**

Inject a workflow spy and verify delegation mapping, full report `structuredContent`, and concise text counts. Verify scope issues and dead links remain successful results and workflow-preventing errors reject the callback.

- [ ] **Step 4: Implement the callback and verify GREEN**

Return the complete report as structured content and a text content block with document, issue, and dead-link counts.

- [ ] **Step 5: Write and fail MCP server contract tests**

Use the SDK's in-memory transport pair and `Client` to list and call `check_specification_links`. Verify advertised schemas, successful structured output, and protocol error behavior.

- [ ] **Step 6: Implement server registration and verify GREEN**

Register one read-only tool with `readOnlyHint: true`, pass both input/output schemas, and keep the server metadata stable at `bluey-md-linkage` version `0.1.0`.

- [ ] **Step 7: Implement stdio facade and CLI dispatch**

Create `McpHandler` that accepts the injected workflow, constructs the server and `StdioServerTransport`, and connects them. Add the `mcp` subcommand without writing non-protocol data to stdout.

- [ ] **Step 8: Run Task 6 tests and commit**

Run:

```bash
corepack pnpm --filter @bluey/md-linkage exec vitest run src/mcp src/facade/mcp.test.ts
git add mcps/md-linkage/src/mcp mcps/md-linkage/src/facade/mcp.ts mcps/md-linkage/src/facade/mcp.test.ts mcps/md-linkage/src/index.ts
git commit -m "feat(md-linkage): expose link checking MCP tool"
```

### Task 7: Cross-Interface E2E Verification and Documentation

**Files:**

- Create: `mcps/md-linkage/tests/e2e/__fixtures__/project/...`
- Create: `mcps/md-linkage/tests/e2e/cli.test.ts`
- Create: `mcps/md-linkage/tests/e2e/mcp.test.ts`
- Modify: `mcps/md-linkage/vitest.config.ts`
- Modify: `mcps/md-linkage/README.md`
- Delete: `mcps/md-linkage/src/setup.test.ts`

**Interfaces:**

- Verifies: packaged CLI behavior, MCP protocol behavior, recursive traversal, and semantic report equality across adapters.

- [ ] **Step 1: Add a representative E2E fixture**

Create Markdown files containing live file links, live and dead in-file anchors, cross-file anchors, a missing file, an out-of-root target, duplicate headings, a recursion cycle, and a non-Markdown delegated path.

- [ ] **Step 2: Write and fail CLI E2E tests**

Spawn the built executable and verify human and JSON output, stderr separation, and statuses `0`, `1`, and `2` against real fixture files.

- [ ] **Step 3: Implement any missing executable details and verify GREEN**

Change only adapter/bootstrap behavior exposed by the E2E failure; do not move business rules out of core.

- [ ] **Step 4: Write and fail MCP E2E tests**

Connect an SDK client over in-memory transport, call the real tool against the same fixture, and compare its structured report with the CLI JSON report after removing only transport presentation.

- [ ] **Step 5: Fix protocol integration and verify GREEN**

Change only MCP registration or serialization behavior exposed by the E2E failure.

- [ ] **Step 6: Replace scaffold documentation**

Document installation, CLI syntax and statuses, MCP startup/tool schema, supported Markdown links, shallow/recursive behavior, and package development commands. Remove the obsolete DI smoke test because composition behavior is now covered directly.

- [ ] **Step 7: Run focused and package verification**

Run:

```bash
corepack pnpm --filter @bluey/md-linkage test
corepack pnpm --filter @bluey/md-linkage typecheck
corepack pnpm --filter @bluey/md-linkage build
```

Expected: all commands exit `0` with no test failures or type errors.

- [ ] **Step 8: Run repository-wide verification**

Run:

```bash
corepack pnpm check
git diff --check
```

Expected: all workspace builds/tests and skill checks pass; the diff check prints nothing.

- [ ] **Step 9: Commit the completed integration**

```bash
git add mcps/md-linkage
git commit -m "test(md-linkage): verify CLI and MCP interfaces"
```

## Plan Self-Review

- Every normative core behavior maps to Tasks 1–4.
- CLI requirements and all three exit statuses map to Task 5 and CLI E2E coverage in Task 7.
- MCP schema, result, and error behavior map to Task 6 and MCP E2E coverage in Task 7.
- Cross-interface semantic equality maps to Task 7.
- The composition root is isolated under `src/composition/`, and adapters never resolve dependencies themselves.
- No task modifies the user's unrelated `AGENTS.md` work.
