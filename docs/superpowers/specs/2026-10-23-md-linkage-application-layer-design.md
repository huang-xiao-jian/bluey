# MD Linkage Application Layer Design

## Prerequities

- [Markdown Linkage Specification](../../../specs/md-linkage/spec.md)
- [Markdown Linkage Interface Specification](../../../specs/md-linkage/interfaces/spec.md)
- [CLI-First MCP Architecture](../../adr/cli-first-mcp-architecture.md)
- [TypeScript Convention](../../conventions/typescript.md)
- [Testing Convention](../../conventions/testing.md)

## Context

The package entry point currently creates the dependency-injection container,
resolves `LinkCheckWorkflowScheduler`, and passes that core object into both
interface handlers. This makes the entry point responsible for core
composition and makes `CheckHandler` and `McpHandler` depend on an externally
assembled scheduler.

The interface handlers should be independently constructible while continuing
to share the same core capability. A dedicated application layer must own core
composition and present the package's capabilities to its interface adapters.

## Decision

Add an application-layer facade named `MarkdownLinkage`. The name describes
the package's domain rather than its dependency-injection mechanism and can
accommodate additional capabilities without turning the public boundary into
a generic dependency bag.

`MarkdownLinkage` creates the application container, resolves
`LinkCheckWorkflowScheduler`, and retains that scheduler as a private
collaborator. Its `checkSpecificationLinks` method exposes the link-check use
case as an application capability whose inputs and outputs remain the core
`LinkCheckDelegation` and `LinkCheckReport` types.

```text
CLI entry point
    ├── CheckHandler ──creates──> MarkdownLinkage
    └── McpHandler ───creates──> MarkdownLinkage
                                  │
                                  └──owns──> LinkCheckWorkflowScheduler
                                                │
                                                └──coordinates core roles
```

Each handler owns one `MarkdownLinkage` instance for its lifetime. The CLI
entry point constructs handlers and configures commands, but it does not know
about the container or any core scheduler.

## Layer Responsibilities

### Application Layer

`src/application/markdown-linkage.ts` owns:

- creation of the dependency-injection container;
- resolution and retention of `LinkCheckWorkflowScheduler`; and
- a small public method that invokes the link-check capability.

The application layer does not parse CLI arguments, create MCP transports,
format reports, or implement link-checking rules.

### Interface Handlers

`CheckHandler` creates its own `MarkdownLinkage`. Its constructor retains only
replaceable CLI environment collaborators such as the current-working-directory
reader and stdout writer. Its `run` method constructs a delegation, invokes the
application capability, and renders the report.

`McpHandler` accepts no scheduler or application dependency. It creates its own
`MarkdownLinkage`, supplies its capability to the MCP server setup, and owns
the stdio transport lifecycle.

### Entry Point

`src/index.ts` constructs `CheckHandler` and `McpHandler` and registers their
methods with Commander. It no longer imports the application container or
`LinkCheckWorkflowScheduler`.

### Core and Infrastructure Layers

The existing core scheduler and its collaborators retain their current
responsibilities. The filesystem implementation remains bound by the existing
composition module. Neither layer depends on the application facade or an
interface handler.

## Capability Contract

`MarkdownLinkage` exposes behavior rather than the container or scheduler. The
public `checkSpecificationLinks` method accepts a `LinkCheckDelegation` and
returns a `Promise<LinkCheckReport>`. Keeping the scheduler private prevents
interface adapters from depending on the core orchestration class or using the
container as a service locator.

The MCP server and tool factory depend on a narrow callable capability matching
that method. They do not receive `MarkdownLinkage`'s container or the core
scheduler.

## Lifecycle and Errors

Handler construction creates an independent application facade and dependency
graph. The container's singleton scope applies within that graph. CLI and MCP
handlers do not share mutable application state.

`MarkdownLinkage` does not translate errors. Core failures continue to reach
the active interface, which applies its existing CLI or MCP error contract.
Completed reports, including reports containing dead links or scope issues,
remain successful capability results.

## Verification

Implementation follows test-driven development:

- add an application-layer unit test proving that `MarkdownLinkage` exposes a
  working link-check capability backed by the composed core graph;
- update `CheckHandler` tests so construction supplies only CLI environment
  collaborators and observable checks use real fixture documents;
- add or update `McpHandler` coverage to prove it requires no scheduler;
- retain focused tests for the core scheduler and composition module;
- run the package's unit, CLI end-to-end, and MCP end-to-end test suites; and
- run package type checking and linting where configured.

## Documentation Updates

Update the interface architecture description so CLI and MCP adapters point to
`MarkdownLinkage`, which in turn invokes the core workflow. The interface
contracts remain unchanged because this is an ownership and dependency-direction
change rather than a user-visible behavior change.

## Non-Goals

- Changing link-check behavior, report semantics, or traversal modes.
- Changing CLI syntax or MCP schemas.
- Exposing the dependency-injection container as a public API.
- Sharing one application instance between CLI and MCP handlers.
- Adding a general-purpose capability registry before another capability
  exists.
