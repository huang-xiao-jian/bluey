# MCP Server Development Guide

## Architecture Design

The core capability is the primary implementation. CLI and MCP support are
adapters that expose the same capability through different external
interfaces.

```Plaintext
Host / Client (External)
        │
        ▼
Facade Layer       → Parses CLI commands or starts an MCP transport
        │
        ├───────────────┐
        ▼               ▼
CLI Handling        MCP Adapter     → Adapts the capability to MCP
        │               │
        └───────┬───────┘
                ▼
Core Layer                         → Implements the primary capability
                ▲
                │
Optional Infrastructure           → Implements external-system ports

Composition Root wires core dependencies and optional infrastructure for
either external interface.
```

Business logic must remain independent of CLI and MCP protocol concerns. Both
interfaces may invoke the core capability directly after translating their
inputs into core models.

## Core Layer

**Directory**: `src/core/`

**Responsibility**: Implements domain logic for tools, resources, and prompts,
decoupled from the MCP protocol and transport layers. Organize the directory by
capability or domain concepts rather than requiring `tools`, `resources`, and
`prompts` subdirectories.

Framework-assisted dependency injection, including decorators such as those
provided by Inversify, is compatible with core purity. Purity here means that
the capability does not depend on MCP or CLI protocol behavior and can be used
and tested without starting either interface.

### Code Template

```TypeScript
// src/core/search/search-documents.ts
export interface SearchDocumentsInput {
  query: string;
  limit?: number;
}

export interface Document {
  id: string;
  title: string;
}

export type SearchDocuments = (
  input: SearchDocumentsInput,
) => Promise<Document[]>;

export const searchDocuments: SearchDocuments = async (input) => {
  return [];
};
```

### Testing

- Use colocated unit tests to verify business logic correctness.
- Verify that capabilities can run without CLI or MCP environment simulation.

## Composition Layer

**Directory**: `src/composition/`

**Responsibility**: Acts as the dependency-composition root. It constructs core
workflows, binds ports to concrete implementations, and returns ready-to-use
capabilities to CLI and MCP adapters.

The composition layer contains wiring, not business or protocol logic. Name
files after the capability they compose, such as
`link-check-composition.ts`.

## MCP Adapter Layer

**Directory**: `src/mcp/`

**Responsibility**: Defines the MCP server and adapts core capabilities into MCP
tools, resources, and prompts. It holds Zod schemas, callbacks, resource URIs,
prompt templates, registration configuration, and server response aggregation.

### Key Components of a Tool

1. **Schema**: Input and structured-output contracts defined using Zod.
2. **Callback**: Validates parameters, translates them to core models, invokes
   the core capability, validates its output, and returns adapter-level result
   data.
3. **Registration Configuration**: Defines the tool name, title, description,
   schemas, and annotations.
4. **Server Aggregation**: Registers the tool, formats MCP `content` and
   `structuredContent`, and maps failures to MCP error responses.

### Tool Code Template

```TypeScript
// src/mcp/tools/search-documents.ts
import { z } from "zod";
import type { SearchDocuments } from "../../core/search/search-documents";

export const SearchDocumentsInputSchema = z.object({
  query: z.string().min(1).describe("The search query string."),
  limit: z.number().min(1).max(50).optional().describe("Max results."),
});

export const SearchDocumentsOutputSchema = z.object({
  documents: z.array(z.object({ id: z.string(), title: z.string() })),
});

export type SearchDocumentsInput = z.infer<typeof SearchDocumentsInputSchema>;

export function createSearchDocumentsTool(searchDocuments: SearchDocuments) {
  return {
    name: "search_documents",
    title: "Search documents",
    description: "Search for documents matching a query.",
    inputSchema: SearchDocumentsInputSchema,
    outputSchema: SearchDocumentsOutputSchema,
    async callback(input: SearchDocumentsInput) {
      const parsed = SearchDocumentsInputSchema.parse(input);
      const documents = await searchDocuments(parsed);

      return {
        result: SearchDocumentsOutputSchema.parse({ documents }),
        summary: `Documents: ${documents.length}`,
      };
    },
  };
}
```

### Server Aggregation Code Template

```TypeScript
// src/mcp/server.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { SearchDocuments } from "../core/search/search-documents";
import { createSearchDocumentsTool } from "./tools/search-documents";

export function setupMcpServer(searchDocuments: SearchDocuments) {
  const server = new McpServer({ name: "my-mcp-server", version: "1.0.0" });
  const tool = createSearchDocumentsTool(searchDocuments);

  server.registerTool(
    tool.name,
    {
      title: tool.title,
      description: tool.description,
      inputSchema: tool.inputSchema,
      outputSchema: tool.outputSchema,
    },
    async (input) => {
      try {
        const result = await tool.callback(input);

        return {
          content: [{ type: "text" as const, text: result.summary }],
          structuredContent: result.result,
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: error instanceof Error ? error.message : String(error),
            },
          ],
        };
      }
    },
  );

  return server;
}
```

### MCP Adapter Testing

- **Schema testing**: Verify validation and defaults for MCP input and output
  contracts.
- **Callback testing**: Verify translation to core inputs and adapter-level
  result data.
- **Contract testing**: Verify registered capabilities and MCP response
  structures using an in-memory transport. Keep these tests colocated with the
  MCP server or capability they exercise.

## Facade Layer

**Directory**: `src/facade/`

**Responsibility**: Exposes services to external clients. CLI handlers parse
and translate command inputs before invoking a composed core capability. MCP
handlers create the server, attach a transport, and run it.

### Facade Code Template

```TypeScript
// src/facade/mcp-handler.ts
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createCapability } from "../composition/capability-composition";
import { setupMcpServer } from "../mcp/server";

export class McpHandler {
  public async run(): Promise<void> {
    const server = setupMcpServer(createCapability());

    await server.connect(new StdioServerTransport());
  }
}
```

## Optional Infrastructure Layer

**Directory**: `src/infrastructure/`, when needed

**Responsibility**: Implements core ports for external systems such as the
filesystem, network services, or databases. Do not create this layer when a
capability has no such dependency. The composition root selects and wires these
implementations.

## Directory Structure

Create only capability directories and optional adapters that the package
actually needs.

```shell
src/
  core/                    # Primary, MCP-independent capability
    [capability]/
    model/
    ports/
  composition/             # Dependency-composition roots
    [capability]-composition.ts
  mcp/                     # MCP adaptation
    tools/                 # When the server exposes tools
    resources/             # When the server exposes resources
    prompts/               # When the server exposes prompts
    server.ts
  facade/                  # External CLI and MCP entry points
    mcp-handler.ts
    [command]-handler.ts
  [infrastructure/]        # Optional external-system adapters
  index.ts                 # CLI parsing and delegation
tests/
  e2e/                     # Built executable and external-interface tests
```

Unit and contract tests may remain colocated with their source files. Reserve
`tests/e2e/` for tests that execute the built package or otherwise cross the
package's external boundary.
