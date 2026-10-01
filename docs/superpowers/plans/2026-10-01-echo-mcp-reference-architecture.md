# Echo MCP Reference Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor `@bluey/echo-mcp` into the copyable CLI-first and MCP adapter reference defined by the approved architecture.

**Architecture:** A dependency-free domain operation sits behind an application use case that validates Zod DTOs and exposes typed errors. Commander provides the CLI command tree; the MCP SDK provides the stdio server. The composition root builds one use-case instance and injects an MCP-starting port into the CLI, so the CLI and MCP adapters do not import one another.

**Tech Stack:** Node.js 26, TypeScript 5.7, pnpm, tsdown, Vitest, Commander 15 with `@commander-js/extra-typings`, Zod 3, and `@modelcontextprotocol/sdk` 1.30.

**Spec:** `docs/superpowers/specs/2026-10-01-echo-mcp-design.md`

## Global Constraints

- Preserve CLI-first behavior: `bluey-echo echo <text>` and `bluey-echo mcp` are the only public commands.
- `src/domain/**` imports no Node, Commander, Zod, or MCP SDK modules.
- `src/application/**` imports no Node process APIs, Commander, or MCP SDK modules.
- CLI and MCP adapters share one `EchoTextUseCase` instance and never import one another.
- The CLI `mcp` command receives only the injected `McpServerStarter` port.
- CLI success writes to stdout; CLI failures write to stderr with nonzero exit status.
- MCP stdout contains JSON-RPC only; diagnostics use stderr.
- MCP input is non-empty text with a 4,000-character maximum.
- Keep scope limited to this package; do not add generic configuration, logging, DI, HTTP, or persistence infrastructure.

---

## File structure

```text
mcps/echo-mcp/
├── src/
│   ├── index.ts                         # Composition root and executable entry
│   ├── domain/echo.ts                   # Pure echo operation
│   ├── application/
│   │   ├── echo-text.contract.ts        # Zod DTO and inferred types
│   │   ├── echo-text.ts                 # EchoTextUseCase implementation
│   │   └── errors.ts                    # Typed application errors
│   ├── cli/
│   │   ├── program.ts                   # Commander program factory
│   │   ├── echo-command.ts              # Echo command registration
│   │   ├── mcp-command.ts               # MCP command and starter port
│   │   └── cli-error-presenter.ts       # Error-to-stderr/exit mapping
│   └── mcp/
│       ├── server.ts                    # MCP server factory
│       ├── echo-tool.ts                 # Echo MCP tool registration
│       ├── mcp-error-presenter.ts       # Error-to-tool-result mapping
│       └── stdio.ts                     # Stdio transport lifecycle
├── test/
│   ├── domain/echo.test.ts
│   ├── application/echo-text.test.ts
│   ├── cli/program.test.ts
│   ├── mcp/echo-tool.test.ts
│   └── integration/
│       ├── cli.test.ts
│       └── mcp-stdio.test.ts
├── README.md
├── package.json
├── tsconfig.json
└── tsdown.config.ts
```

## Task 1: Establish the dependency-free domain and application boundary

**Files:**
- Create: `mcps/echo-mcp/src/domain/echo.ts`
- Create: `mcps/echo-mcp/src/application/echo-text.contract.ts`
- Create: `mcps/echo-mcp/src/application/errors.ts`
- Create: `mcps/echo-mcp/src/application/echo-text.ts`
- Create: `mcps/echo-mcp/test/domain/echo.test.ts`
- Create: `mcps/echo-mcp/test/application/echo-text.test.ts`
- Modify: `mcps/echo-mcp/package.json`
- Modify: `pnpm-lock.yaml`

**Interfaces:**
- Produces `echo(text: string): string`.
- Produces `EchoTextInputSchema`, `EchoTextInput`, and `EchoTextResult`.
- Produces `ApplicationError` and `InvalidEchoTextInputError`.
- Produces `EchoTextUseCase` with `execute(input: unknown): EchoTextResult` and `createEchoTextUseCase(): EchoTextUseCase`.

- [ ] **Step 1: Add the CLI runtime and type dependencies**

Run:

```sh
pnpm --filter @bluey/echo-mcp add commander@^15.0.0 @commander-js/extra-typings@^15.0.0
pnpm --filter @bluey/echo-mcp remove tsx
```

Confirm `package.json` lists `commander` and `@commander-js/extra-typings` in
`dependencies`, retains the MCP SDK and Zod, and no longer lists `tsx`.

- [ ] **Step 2: Write the failing domain and application tests**

```ts
// test/domain/echo.test.ts
import { describe, expect, it } from "vitest";
import { echo } from "../../src/domain/echo.js";

describe("echo", () => {
  it("returns text unchanged", () => {
    expect(echo("Hello, Bluey!")).toBe("Hello, Bluey!");
  });
});
```

```ts
// test/application/echo-text.test.ts
import { describe, expect, it } from "vitest";
import {
  InvalidEchoTextInputError,
  createEchoTextUseCase,
} from "../../src/application/echo-text.js";

describe("EchoTextUseCase", () => {
  const useCase = createEchoTextUseCase();

  it("returns a typed result for valid text", () => {
    expect(useCase.execute({ text: "Hello, Bluey!" })).toEqual({ text: "Hello, Bluey!" });
  });

  it("rejects an empty text value", () => {
    expect(() => useCase.execute({ text: "" })).toThrow(InvalidEchoTextInputError);
  });

  it("rejects text longer than 4,000 characters", () => {
    expect(() => useCase.execute({ text: "x".repeat(4_001) })).toThrow(InvalidEchoTextInputError);
  });
});
```

- [ ] **Step 3: Run the focused tests and confirm they fail because the modules do not exist**

Run: `pnpm --filter @bluey/echo-mcp test -- test/domain/echo.test.ts test/application/echo-text.test.ts`

Expected: FAIL with module-resolution errors for the new domain and application modules.

- [ ] **Step 4: Implement the domain operation, DTO contract, error, and use case**

```ts
// src/domain/echo.ts
export function echo(text: string): string {
  return text;
}
```

```ts
// src/application/echo-text.contract.ts
import { z } from "zod";

export const EchoTextInputSchema = z.object({
  text: z.string().min(1).max(4_000),
});
export type EchoTextInput = z.infer<typeof EchoTextInputSchema>;
export type EchoTextResult = Readonly<{ text: string }>;
```

```ts
// src/application/errors.ts
export class ApplicationError extends Error {}

export class InvalidEchoTextInputError extends ApplicationError {
  public constructor(cause: unknown) {
    super("Text must contain between 1 and 4,000 characters.", { cause });
    this.name = "InvalidEchoTextInputError";
  }
}
```

```ts
// src/application/echo-text.ts
import { echo } from "../domain/echo.js";
import { InvalidEchoTextInputError } from "./errors.js";
import { EchoTextInputSchema, type EchoTextResult } from "./echo-text.contract.js";

export interface EchoTextUseCase {
  execute(input: unknown): EchoTextResult;
}

export function createEchoTextUseCase(): EchoTextUseCase {
  return {
    execute(input) {
      const parsed = EchoTextInputSchema.safeParse(input);
      if (!parsed.success) throw new InvalidEchoTextInputError(parsed.error);
      return { text: echo(parsed.data.text) };
    },
  };
}

export { InvalidEchoTextInputError } from "./errors.js";
```

- [ ] **Step 5: Run focused tests and type checking**

Run:

```sh
pnpm --filter @bluey/echo-mcp test -- test/domain/echo.test.ts test/application/echo-text.test.ts
pnpm --filter @bluey/echo-mcp typecheck
```

Expected: both commands exit 0.

- [ ] **Step 6: Commit the domain and application boundary**

```sh
git add mcps/echo-mcp/package.json pnpm-lock.yaml \
  mcps/echo-mcp/src/domain mcps/echo-mcp/src/application \
  mcps/echo-mcp/test/domain mcps/echo-mcp/test/application
git commit -m "refactor(echo-mcp): add application boundary"
```

## Task 2: Add the MCP adapter behind the application boundary

**Files:**
- Create: `mcps/echo-mcp/src/mcp/echo-tool.ts`
- Create: `mcps/echo-mcp/src/mcp/mcp-error-presenter.ts`
- Create: `mcps/echo-mcp/src/mcp/server.ts`
- Create: `mcps/echo-mcp/src/mcp/stdio.ts`
- Create: `mcps/echo-mcp/test/mcp/echo-tool.test.ts`

**Interfaces:**
- Consumes `EchoTextUseCase` and `EchoTextInputSchema` from Task 1.
- Produces `registerEchoTool(server: McpServer, useCase: EchoTextUseCase): void`.
- Produces `createMcpServer(useCase: EchoTextUseCase): McpServer`.
- Produces `startStdioMcpServer(server: McpServer): Promise<void>`.

- [ ] **Step 1: Write the failing tool behavior test**

```ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it, vi } from "vitest";
import { createEchoTextUseCase } from "../../src/application/echo-text.js";
import { registerEchoTool } from "../../src/mcp/echo-tool.js";

describe("registerEchoTool", () => {
  it("registers echo with the application schema and result mapping", async () => {
    const server = new McpServer({ name: "test", version: "1.0.0" });
    const registerTool = vi.spyOn(server, "registerTool");

    registerEchoTool(server, createEchoTextUseCase());

    expect(registerTool).toHaveBeenCalledWith(
      "echo",
      expect.objectContaining({
        description: expect.stringContaining("no side effects"),
        inputSchema: expect.any(Object),
      }),
      expect.any(Function),
    );

    const handler = registerTool.mock.calls[0]?.[2];
    await expect(handler?.({ text: "Hello from MCP!" }, {} as never)).resolves.toEqual({
      content: [{ type: "text", text: "Hello from MCP!" }],
    });
  });
});
```

- [ ] **Step 2: Run the MCP tool test and confirm it fails because the adapter module does not exist**

Run: `pnpm --filter @bluey/echo-mcp test -- test/mcp/echo-tool.test.ts`

Expected: FAIL with a module-resolution error for `src/mcp/echo-tool.ts`.

- [ ] **Step 3: Implement error presentation, registration, server factory, and stdio lifecycle**

```ts
// src/mcp/mcp-error-presenter.ts
import { ApplicationError } from "../application/errors.js";

export function presentMcpError(error: unknown): { isError: true; content: [{ type: "text"; text: string }] } {
  const text = error instanceof ApplicationError ? error.message : "Unexpected server error.";
  return { isError: true, content: [{ type: "text", text }] };
}
```

```ts
// src/mcp/echo-tool.ts
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { EchoTextInputSchema } from "../application/echo-text.contract.js";
import type { EchoTextUseCase } from "../application/echo-text.js";
import { presentMcpError } from "./mcp-error-presenter.js";

export function registerEchoTool(server: McpServer, useCase: EchoTextUseCase): void {
  server.registerTool(
    "echo",
    {
      title: "Echo text",
      description: "Returns supplied text unchanged. This tool has no side effects.",
      inputSchema: EchoTextInputSchema.shape,
    },
    async (input) => {
      try {
        const result = useCase.execute(input);
        return { content: [{ type: "text" as const, text: result.text }] };
      } catch (error) {
        return presentMcpError(error);
      }
    },
  );
}
```

```ts
// src/mcp/server.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { EchoTextUseCase } from "../application/echo-text.js";
import { registerEchoTool } from "./echo-tool.js";

export function createMcpServer(useCase: EchoTextUseCase): McpServer {
  const server = new McpServer({ name: "bluey-echo", version: "0.1.0" });
  registerEchoTool(server, useCase);
  return server;
}
```

```ts
// src/mcp/stdio.ts
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export async function startStdioMcpServer(server: McpServer): Promise<void> {
  await server.connect(new StdioServerTransport());
}
```

- [ ] **Step 4: Run the MCP unit test and type checking**

Run:

```sh
pnpm --filter @bluey/echo-mcp test -- test/mcp/echo-tool.test.ts
pnpm --filter @bluey/echo-mcp typecheck
```

Expected: both commands exit 0.

- [ ] **Step 5: Commit the MCP adapter**

```sh
git add mcps/echo-mcp/src/mcp mcps/echo-mcp/test/mcp
git commit -m "refactor(echo-mcp): add MCP adapter"
```

## Task 3: Add the Commander CLI adapter and injected MCP-start port

**Files:**
- Create: `mcps/echo-mcp/src/cli/cli-error-presenter.ts`
- Create: `mcps/echo-mcp/src/cli/echo-command.ts`
- Create: `mcps/echo-mcp/src/cli/mcp-command.ts`
- Create: `mcps/echo-mcp/src/cli/program.ts`
- Create: `mcps/echo-mcp/test/cli/program.test.ts`

**Interfaces:**
- Consumes `EchoTextUseCase` from Task 1.
- Produces `McpServerStarter` with `start(): Promise<void>`.
- Produces `createProgram(dependencies: CliDependencies): Command`.
- `CliDependencies` contains `echoText: EchoTextUseCase`, `mcpServerStarter: McpServerStarter`, `stdout: NodeJS.WritableStream`, and `stderr: NodeJS.WritableStream`.

- [ ] **Step 1: Write failing command behavior tests using in-memory streams**

```ts
import { PassThrough } from "node:stream";
import { describe, expect, it, vi } from "vitest";
import { createEchoTextUseCase } from "../../src/application/echo-text.js";
import { createProgram } from "../../src/cli/program.js";

function output(stream: PassThrough): Promise<string> {
  return new Promise((resolve) => {
    let text = "";
    stream.on("data", (chunk) => { text += chunk.toString(); });
    stream.on("end", () => resolve(text));
  });
}

describe("createProgram", () => {
  it("writes the use-case result to stdout for echo", async () => {
    const stdout = new PassThrough();
    const stderr = new PassThrough();
    const value = output(stdout);
    const program = createProgram({
      echoText: createEchoTextUseCase(),
      mcpServerStarter: { start: vi.fn() },
      stdout,
      stderr,
    });

    await program.parseAsync(["node", "bluey-echo", "echo", "Hello, Bluey!"]);
    stdout.end();
    await expect(value).resolves.toBe("Hello, Bluey!\\n");
  });

  it("starts MCP only through the injected port", async () => {
    const start = vi.fn().mockResolvedValue(undefined);
    const program = createProgram({
      echoText: createEchoTextUseCase(),
      mcpServerStarter: { start },
      stdout: new PassThrough(),
      stderr: new PassThrough(),
    });

    await program.parseAsync(["node", "bluey-echo", "mcp"]);
    expect(start).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run the CLI unit test and confirm it fails because the CLI modules do not exist**

Run: `pnpm --filter @bluey/echo-mcp test -- test/cli/program.test.ts`

Expected: FAIL with a module-resolution error for `src/cli/program.ts`.

- [ ] **Step 3: Implement CLI error presentation, command registration, and program factory**

```ts
// src/cli/cli-error-presenter.ts
import type { Writable } from "node:stream";
import { ApplicationError } from "../application/errors.js";

export function presentCliError(error: unknown, stderr: Writable): number {
  const message = error instanceof ApplicationError ? error.message : "Unexpected command error.";
  stderr.write(`${message}\\n`);
  return 1;
}
```

```ts
// src/cli/mcp-command.ts
import type { Command } from "@commander-js/extra-typings";

export interface McpServerStarter {
  start(): Promise<void>;
}

export function addMcpCommand(program: Command, starter: McpServerStarter): void {
  program.command("mcp").description("Start the MCP server over stdio.").action(async () => {
    await starter.start();
  });
}
```

```ts
// src/cli/echo-command.ts
import type { Command } from "@commander-js/extra-typings";
import type { Writable } from "node:stream";
import type { EchoTextUseCase } from "../application/echo-text.js";
import { presentCliError } from "./cli-error-presenter.js";

export function addEchoCommand(program: Command, useCase: EchoTextUseCase, stdout: Writable, stderr: Writable): void {
  program.command("echo <text>").description("Return text unchanged.").action((text: string) => {
    try {
      stdout.write(`${useCase.execute({ text }).text}\\n`);
    } catch (error) {
      process.exitCode = presentCliError(error, stderr);
    }
  });
}
```

```ts
// src/cli/program.ts
import type { Writable } from "node:stream";
import { Command } from "@commander-js/extra-typings";
import type { EchoTextUseCase } from "../application/echo-text.js";
import { addEchoCommand } from "./echo-command.js";
import { addMcpCommand, type McpServerStarter } from "./mcp-command.js";

export interface CliDependencies {
  echoText: EchoTextUseCase;
  mcpServerStarter: McpServerStarter;
  stdout: Writable;
  stderr: Writable;
}

export function createProgram(dependencies: CliDependencies): Command {
  const program = new Command()
    .name("bluey-echo")
    .description("Bluey CLI and MCP reference package.")
    .version("0.1.0")
    .exitOverride();
  program.configureOutput({ writeOut: (text) => dependencies.stdout.write(text), writeErr: (text) => dependencies.stderr.write(text) });
  addEchoCommand(program, dependencies.echoText, dependencies.stdout, dependencies.stderr);
  addMcpCommand(program, dependencies.mcpServerStarter);
  return program;
}
```

- [ ] **Step 4: Run CLI unit tests and type checking**

Run:

```sh
pnpm --filter @bluey/echo-mcp test -- test/cli/program.test.ts
pnpm --filter @bluey/echo-mcp typecheck
```

Expected: both commands exit 0. The production implementation has no direct
CLI-to-MCP import.

- [ ] **Step 5: Commit the CLI adapter**

```sh
git add mcps/echo-mcp/src/cli mcps/echo-mcp/test/cli
git commit -m "refactor(echo-mcp): add CLI adapter"
```

## Task 4: Compose the executable and verify real process boundaries

**Files:**
- Modify: `mcps/echo-mcp/src/index.ts`
- Delete: `mcps/echo-mcp/src/core.ts`
- Delete: `mcps/echo-mcp/src/cli.ts`
- Delete: `mcps/echo-mcp/src/mcp.ts`
- Delete: `mcps/echo-mcp/test/echo.test.ts`
- Delete: `mcps/echo-mcp/test/echo.test.mjs`
- Create: `mcps/echo-mcp/test/integration/cli.test.ts`
- Create: `mcps/echo-mcp/test/integration/mcp-stdio.test.ts`

**Interfaces:**
- Consumes all production interfaces from Tasks 1–3.
- Produces `main(args?: readonly string[]): Promise<void>` as the executable entry point.
- `main` constructs one `EchoTextUseCase`, one MCP server, and one CLI program.

- [ ] **Step 1: Write the failing built-executable CLI integration test**

```ts
import { spawnSync } from "node:child_process";
import { chmodSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

describe("bluey-echo executable", () => {
  it("writes a successful echo result to stdout", () => {
    const executable = fileURLToPath(new URL("../../dist/index.mjs", import.meta.url));
    chmodSync(executable, 0o755);
    const result = spawnSync(executable, ["echo", "Hello, Bluey!"], { encoding: "utf8" });

    expect(result.status).toBe(0);
    expect(result.stdout).toBe("Hello, Bluey!\\n");
    expect(result.stderr).toBe("");
  });

  it("writes invalid CLI usage to stderr", () => {
    const executable = fileURLToPath(new URL("../../dist/index.mjs", import.meta.url));
    const result = spawnSync(executable, ["echo", ""], { encoding: "utf8" });

    expect(result.status).not.toBe(0);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("Text must contain between 1 and 4,000 characters.");
  });
});
```

- [ ] **Step 2: Write the failing real-stdio MCP integration test**

```ts
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

describe("MCP stdio executable", () => {
  it("returns an echo tool result and an MCP tool error without non-protocol stdout", () => {
    const input = [
      { jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-11-25", capabilities: {}, clientInfo: { name: "test", version: "1.0.0" } } },
      { jsonrpc: "2.0", method: "notifications/initialized", params: {} },
      { jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "echo", arguments: { text: "Hello from MCP!" } } },
      { jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "echo", arguments: { text: "" } } },
    ].map(JSON.stringify).join("\\n");

    const result = spawnSync(process.execPath, ["dist/index.mjs", "mcp"], {
      cwd: new URL("../..", import.meta.url), encoding: "utf8", input: `${input}\\n`,
    });
    const messages = result.stdout.trim().split("\\n").map((line) => JSON.parse(line));

    expect(result.status).toBe(0);
    expect(messages).toContainEqual({ jsonrpc: "2.0", id: 2, result: { content: [{ type: "text", text: "Hello from MCP!" }] } });
    expect(messages).toContainEqual(expect.objectContaining({ jsonrpc: "2.0", id: 3, result: expect.objectContaining({ isError: true }) }));
  });
});
```

- [ ] **Step 3: Run the integration tests and confirm the existing entry point cannot satisfy the new module graph**

Run: `pnpm --filter @bluey/echo-mcp test -- test/integration/cli.test.ts test/integration/mcp-stdio.test.ts`

Expected: FAIL until the composition root is changed and the package is rebuilt.

- [ ] **Step 4: Replace the executable entry point with explicit composition**

```ts
#!/usr/bin/env node
import { pathToFileURL } from "node:url";
import { createEchoTextUseCase } from "./application/echo-text.js";
import { createProgram } from "./cli/program.js";
import { createMcpServer } from "./mcp/server.js";
import { startStdioMcpServer } from "./mcp/stdio.js";

export async function main(args = process.argv.slice(2)): Promise<void> {
  const echoText = createEchoTextUseCase();
  const mcpServer = createMcpServer(echoText);
  const program = createProgram({
    echoText,
    mcpServerStarter: { start: () => startStdioMcpServer(mcpServer) },
    stdout: process.stdout,
    stderr: process.stderr,
  });
  await program.parseAsync([process.execPath, "bluey-echo", ...args]);
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
```

Delete the four legacy files listed above after all imports have moved to the
new layer directories. Keep the shebang in `src/index.ts`; the process test
must prove the bundled entry remains executable.

- [ ] **Step 5: Build and run the integration tests**

Run:

```sh
pnpm --filter @bluey/echo-mcp build
pnpm --filter @bluey/echo-mcp test -- test/integration/cli.test.ts test/integration/mcp-stdio.test.ts
```

Expected: both commands exit 0; the MCP test parses every stdout line as JSON.

- [ ] **Step 6: Commit executable composition and process tests**

```sh
git add mcps/echo-mcp/src/index.ts mcps/echo-mcp/src/core.ts \
  mcps/echo-mcp/src/cli.ts mcps/echo-mcp/src/mcp.ts \
  mcps/echo-mcp/test/echo.test.ts mcps/echo-mcp/test/echo.test.mjs \
  mcps/echo-mcp/test/integration
git commit -m "refactor(echo-mcp): compose CLI and MCP adapters"
```

## Task 5: Publish the template guidance and validate the package

**Files:**
- Modify: `mcps/echo-mcp/README.md`

**Interfaces:**
- Documents the commands and MCP tool implemented by Tasks 1–4.
- Documents the dependency rule that future Bluey capabilities must preserve.

- [ ] **Step 1: Replace the README with the public usage and architecture reference**

Use these sections and content:

````md
# Bluey echo

`@bluey/echo-mcp` is Bluey's CLI-first and MCP reference package.

## Run

```sh
bluey-echo echo "Hello, Bluey!"
bluey-echo mcp
```

`mcp` uses stdio. Its stdout is reserved for MCP JSON-RPC; diagnostics are written to stderr.

## MCP tool

`echo` accepts `{ "text": string }`, requires 1–4,000 characters, and returns the text unchanged. It has no side effects and requires no credentials.

## Architecture rules

- Domain code has no transport or Node-process dependency.
- CLI and MCP adapters invoke the same application use case.
- CLI does not import MCP code; the composition root injects an MCP starter port into the `mcp` command.
- Expected failures are rendered by the adapter that receives them.

For package requirements, see the [CLI-first architecture ADR](../../docs/adr/cli-first-mcp-architecture.md) and [MCP convention](../../docs/conventions/mcp.md).
````

- [ ] **Step 2: Run package and workspace verification**

Run:

```sh
pnpm --filter @bluey/echo-mcp typecheck
pnpm --filter @bluey/echo-mcp build
pnpm --filter @bluey/echo-mcp test
pnpm check
```

Expected: each command exits 0.

- [ ] **Step 3: Inspect the final change set for forbidden cross-layer imports**

Run:

```sh
rg -n 'node:|@commander-js/extra-typings|@modelcontextprotocol/sdk' mcps/echo-mcp/src/domain mcps/echo-mcp/src/application
rg -n 'from "\.\./mcp|from "\.\./cli' mcps/echo-mcp/src/cli mcps/echo-mcp/src/mcp
```

Expected: no matches. Confirm `git diff --check` exits 0.

- [ ] **Step 4: Commit documentation and final verification state**

```sh
git add mcps/echo-mcp/README.md
git commit -m "docs(echo-mcp): document reference architecture"
```

## Plan self-review

- Spec coverage: Tasks 1–4 implement the required layered module boundaries,
  shared use-case instance, injected MCP starter port, error translation, and
  process behavior. Task 5 documents the public interface and reusable rules.
- Dependency scope: Task 1 adds only Commander and its type companion, removes
  the now-unneeded `tsx` development runtime, and leaves existing MCP/Zod
  dependencies in place.
- Test coverage: unit tests cover domain, application, CLI, and MCP boundaries;
  process tests cover built CLI and real MCP stdio behavior.
- Interface consistency: all later tasks consume `EchoTextUseCase`,
  `McpServerStarter`, `createMcpServer`, and `startStdioMcpServer` exactly as
  introduced in earlier tasks.
