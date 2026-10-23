# MD Linkage Interface Specification Design

## Prerequities

- [Markdown Linkage Specification](../../../specs/md-linkage/spec.md)
- [CLI-First MCP Architecture](../../adr/cli-first-mcp-architecture.md)
- [Document Convention](../../conventions/document.md)

## Context

The **Markdown Linkage Specification** currently describes both the core
dead-link-checking capability and the CLI and MCP surfaces that expose it. The
core behavior and the consumer-facing contracts have different reasons to
change. Keeping them at the same level obscures the boundary established by the
**CLI-First MCP Architecture**.

## Decision

Keep `specs/md-linkage/` as the specification root for one capability. Move its
consumer-facing contracts into an `interfaces/` directory:

```text
specs/md-linkage/
├── spec.md
├── design.md
├── glossary/
├── roles/
├── use-case/
└── interfaces/
    ├── spec.md
    ├── cli.md
    └── mcp.md
```

The root `spec.md` remains focused on core use cases, concepts, and roles. It
does not serve as an index for interface contracts. The `interfaces/`
directory owns the specification of how external consumers invoke the core
capability.

Use "interface" for this specification boundary. Implementations may use
terms such as adapter, facade, or receptionist without changing the documented
boundary.

## Document Responsibilities

### Shared Interface Specification

`interfaces/spec.md` defines:

- the purpose of the interface layer;
- the dependency direction from each interface to the core workflow;
- request semantics shared by CLI and MCP;
- the boundary between interface concerns and core behavior;
- the treatment of completed checks and failures; and
- cross-interface semantic-equivalence requirements.

It lists the core specification and relevant core concepts as prerequisites.

### CLI Contract

`interfaces/cli.md` defines:

- command syntax;
- CLI-specific defaults;
- human-readable and JSON output;
- stdout and stderr ownership;
- process exit statuses; and
- CLI contract-verification requirements.

It lists `interfaces/spec.md` as a prerequisite and does not redefine core or
shared interface semantics.

### MCP Contract

`interfaces/mcp.md` defines:

- server startup and transport;
- tool names and schemas;
- structured and text results;
- protocol error behavior; and
- MCP contract-verification requirements.

It lists `interfaces/spec.md` as a prerequisite and does not redefine core or
shared interface semantics.

## Dependency Direction

```text
Core specification
        ↑
interfaces/spec.md
       ↗ ↖
 cli.md   mcp.md
```

Both surface contracts depend on the shared interface specification, which in
turn depends on the core capability. The core specification does not depend on
CLI or MCP concepts. Neither interface depends on or invokes the other.

## Result and Error Ownership

A completed core workflow produces a `LinkCheckReport`. Scope issues and dead
links are expected findings in that report and remain successful results at
both interfaces.

A failure that prevents report construction belongs to the selected
interface's error contract. The CLI maps it to diagnostics and an exit status;
the MCP surface maps it to a protocol error. Interfaces may validate their own
representations, apply documented defaults, construct a `LinkCheckDelegation`,
invoke the core workflow once, and format its result. They do not reinterpret
core findings or implement link-checking rules.

## Verification

- `interfaces/cli.md` owns tests for CLI parsing, defaults, rendering, stream
  use, and exit statuses.
- `interfaces/mcp.md` owns tests for schemas, defaults, tool results, and
  protocol errors.
- `interfaces/spec.md` owns the requirement that equivalent requests through
  CLI and MCP produce semantically identical `LinkCheckReport` values,
  excluding transport envelopes and presentation.
- Relative documentation links must resolve after the restructure.

## Migration

1. Create the `interfaces/` directory and its three documents.
2. Move shared material from `receptionist.md` into `interfaces/spec.md`.
3. Move CLI-only material into `interfaces/cli.md`.
4. Move MCP-only material into `interfaces/mcp.md`.
5. Remove the receptionist section from the root `spec.md`.
6. Remove `receptionist.md` after all authoritative content has moved.
7. Update affected relative links and verify that the specification contains no
   duplicate contract definitions.

## Non-Goals

- Changing the behavior of the core link-checking workflow.
- Changing the approved CLI or MCP contracts while relocating them.
- Splitting CLI and MCP into separate packages or capabilities.
- Renaming implementation layers solely to match the specification directory.
