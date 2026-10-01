# Echo MCP reference architecture

## Purpose

`@bluey/echo-mcp` is the reference package for Bluey capabilities that expose
both a command-line interface and an MCP server. It demonstrates the
repository's CLI-first ADR with an intentionally small operation, clear
dependency direction, and behavioral tests at each boundary.

It is not a framework for configuration, credentials, HTTP clients, or storage.
Future capabilities add those concerns only when their own requirements demand
them.

## Decisions

- The executable remains CLI-first. `mcp` is an explicit subcommand that starts
  the MCP stdio server.
- Use `@commander-js/extra-typings` for CLI syntax, help text, subcommands, and
  CLI parsing errors.
- Retain `@modelcontextprotocol/sdk` for the MCP transport and `zod` for
  boundary schemas.
- Model business behavior as an application use case. Both adapters invoke that
  use case; neither adapter invokes the other.
- Keep the domain operation dependency-free. It must not import Node, Commander,
  Zod, or MCP SDK types.

`@effect/cli` is intentionally not used. Its Effect and Node-platform runtime
would make this reference package substantially larger than the behavior it
demonstrates. Manual command parsing is also rejected because it would make the
template omit standard CLI help, validation, and error behavior.

## Package structure

```text
mcps/echo-mcp/
├── src/
│   ├── index.ts
│   ├── domain/
│   │   └── echo.ts
│   ├── application/
│   │   ├── echo-text.ts
│   │   ├── echo-text.contract.ts
│   │   └── errors.ts
│   ├── cli/
│   │   ├── program.ts
│   │   ├── echo-command.ts
│   │   ├── mcp-command.ts
│   │   └── cli-error-presenter.ts
│   └── mcp/
│       ├── server.ts
│       ├── echo-tool.ts
│       ├── mcp-error-presenter.ts
│       └── stdio.ts
├── test/
│   ├── domain/
│   ├── application/
│   ├── cli/
│   ├── mcp/
│   └── integration/
├── README.md
├── package.json
├── tsconfig.json
└── tsdown.config.ts
```

## Layer responsibilities

### Composition root

`src/index.ts` is the only composition root. It constructs one `EchoText` use
case, creates the MCP server with that use case, and injects a narrow
`McpServerStarter` port into the CLI command tree. The port's implementation
connects the already-created MCP server to stdio. `index.ts` does not declare
CLI commands, register individual MCP tools, format output, or contain business
rules.

### Domain

`src/domain/echo.ts` contains the pure echo transformation and domain-specific
types. For this example it returns the supplied valid text unchanged. The file
exists to make the seam explicit: a future capability may add genuine domain
rules here without coupling them to either delivery protocol.

### Application

`src/application/echo-text.contract.ts` owns the public input and output DTOs
and their Zod schemas. `src/application/echo-text.ts` validates an input,
invokes the domain operation, and returns a typed result. `src/application/errors.ts`
defines expected, transport-independent failures.

The application layer is the only layer shared by CLI and MCP. It may depend on
the domain layer and Zod, but never on Node process APIs, Commander, or MCP SDK
types.

### CLI adapter

`src/cli/program.ts` builds the Commander command tree, including `echo` and
`mcp`, help, and version metadata. `echo-command.ts` maps parsed CLI values to
the application DTO and presents successful output. `mcp-command.ts` depends
only on the `McpServerStarter` port and invokes it when the `mcp` command is
selected. `cli-error-presenter.ts` maps known application errors to
human-readable stderr output and stable nonzero exit codes.

The CLI adapter owns command-line syntax and presentation. It does not define
business validation, call the domain directly, or import an MCP module.

### MCP adapter

`src/mcp/server.ts` creates the server and composes registered tools.
`echo-tool.ts` exposes the application contract as the MCP `echo` tool and
converts a successful application result into MCP text content.
`mcp-error-presenter.ts` converts expected application errors into MCP tool
errors. `stdio.ts` owns `StdioServerTransport` connection lifecycle.

The MCP adapter owns MCP SDK types, tool metadata, protocol-level errors, and
transport lifecycle. No protocol message may be written through CLI output.

## Runtime contract

The public commands are:

```text
bluey-echo echo <text>
bluey-echo mcp
```

`echo <text>` writes the resulting text plus one newline to stdout. Usage and
application failures write only to stderr and set a nonzero exit code.

`mcp` opens a stdio transport. stdout is reserved exclusively for MCP
JSON-RPC messages; diagnostics go to stderr. The MCP `echo` tool accepts a
non-empty text value with a maximum length of 4,000 characters and returns it
unchanged. Expected invalid input is reported as an MCP tool error; malformed
or unsupported JSON-RPC is left to the MCP SDK.

## Dependency direction

```text
index → cli → application → domain
  └──→ mcp → application → domain
        ↑
        └── `McpServerStarter` implementation injected into CLI
```

The diagram denotes imports and calls, not data ownership. `index` may import
every package module to compose them. Each adapter may import application
contracts. Application may import domain. The reverse directions are forbidden.
The CLI adapter defines or consumes only the narrow `McpServerStarter` port; it
does not import the MCP adapter. The composition root supplies the port's MCP
implementation.

## Error model

- Domain code reports only domain failures, without transport formatting.
- Application code converts invalid DTOs and expected domain failures into
  typed application errors.
- CLI maps application errors to text and exit codes. Commander continues to
  own command grammar and its own parse errors.
- MCP maps application errors to `isError: true` tool results. The MCP SDK
  continues to own protocol and transport errors.
- Unexpected faults are not disguised as validation errors. They are reported
  through the adapter's safe diagnostic path and cause failure.

## Tests

- Domain tests prove the pure transformation without Node or protocol setup.
- Application tests cover DTO validation, output shape, and typed errors.
- CLI tests use injected output streams or a focused command instance to verify
  command-to-use-case mapping and error presentation.
- MCP tests call registered tool handlers or a server fixture to verify tool
  metadata, DTO mapping, result content, and expected tool errors.
- Integration tests launch the built executable: one verifies stdout, stderr,
  and exit codes for CLI mode; one verifies initialize and tool calls over real
  stdio JSON-RPC.

## Documentation requirements

The package README must document the CLI commands, MCP tool schema, no-side-
effects guarantee, transport behavior, and the layer rules above. It should be
written as a copyable reference for new Bluey capabilities, while linking to
the repository's [CLI-first architecture ADR](../../adr/cli-first-mcp-architecture.md)
and [MCP convention](../../conventions/mcp.md) rather than duplicating them.

## Non-goals

- A generic application container or dependency-injection framework.
- Configuration loading, logging abstraction, credentials, filesystems, HTTP,
  persistence, retries, or telemetry.
- A generic tool-registration framework.
- A compatibility guarantee for the current uncommitted implementation.

## Acceptance criteria

- No domain or application module imports CLI, MCP, or Node process APIs.
- CLI and MCP invoke the same use case instance and do not import each other.
- The CLI `mcp` command depends only on an injected `McpServerStarter` port;
  its MCP implementation is composed in `src/index.ts`.
- All expected validation failures have adapter-appropriate behavior.
- MCP mode never emits non-protocol text to stdout.
- The built executable and real stdio MCP protocol are covered by integration
  tests.
- The package README describes both the public interface and the reusable
  architectural rules.
