# cli-first-mcp-architecture

## Context

The project must support both a `CLI` and an `MCP` server, but it has not yet established a common architecture. Without one, business logic will become scattered across `MCP` and `CLI` implementations, increasing maintenance cost, reducing delivery stability, and making continuous iteration difficult.

## Decision

- Support both `CLI` and `MCP` modes in each package. The `CLI` is the primary form of the project, and `MCP` starts as its `mcp` subcommand.
- Keep business logic independent of both `CLI` and `MCP` contexts, with a strict focus on delivering business capabilities.

## Consequences

### Positive

- The project has standalone `CLI` value by design; `MCP` is only one subcommand, which reduces the user's cognitive load.
- Business logic is implemented once and can be iterated on and maintained centrally.
- Core business code is decoupled from transport layers and can be tested independently.

### Negative

- Requires higher-level architectural design to ensure that neither the `CLI` nor `MCP` adapter layer contains business logic.
- The project must depend on `MCP` libraries even for `CLI`-only users, increasing installed footprint.

### Example Comparison

| Scenario | Before the decision | After the decision |
| --- | --- | --- |
| User installation | Install the CLI and MCP packages separately. | Install one package and select a mode through a subcommand. |
| Adding a tool | Implement it once in the CLI project and once in the MCP project. | Implement it once in the core layer; invoke it through each adapter layer. |
| Testing business logic | Simulate CLI and MCP environments separately. | Test pure core-layer functions directly, with no environment simulation. |

## Alternatives

### Alternative 1: Split into two independent packages

Implement the `CLI` and `MCP` as separate npm packages, each with its own business-logic implementation.

**Reason rejected**: Business logic would be implemented twice, doubling maintenance cost. Users would also need to make an explicit choice, increasing cognitive load.

### Alternative 2: MCP-first, with the CLI as a thin MCP wrapper

Make the `MCP` server the primary form and have the `CLI` call its `JSON-RPC` interface.

**Reason rejected**: `CLI` users would need to understand `MCP` protocol concepts, and data transfer would be less efficient.

### Alternative 3: Select modes with an environment variable

Do not use a subcommand; use the `MCP_MODE=true` environment variable to select the startup mode.

**Reason rejected**: An environment variable changes behavior implicitly, which does not follow the explicit-command convention of traditional `CLI` projects. Users also cannot discover available modes directly through `--help`.

## Reversal Conditions

- Consider splitting the package when `CLI` and `MCP` business logic diverge enough that it cannot be shared.
- Reevaluate the decision when a major `MCP` protocol change causes the adapter layer's complexity to increase substantially.
