# MCP Server Development Guide

## Architecture Design

```Plaintext
Host / Client (External)
        │
        ▼
Facade Layer       → Exposes external services
        │
        ▼
Application (MCP)  → Defines the MCP Server and registers capabilities
        │
        ▼
Core Layer         → Provides context-agnostic capability implementations

```

**Dependency Direction: Facade Layer → Application Layer → Core Layer**

## Core Layer (`src/core/`)

**Directory**: `src/core/`

**Responsibility**: Implements pure domain logic for `Tools`, `Resources`, and `Prompts`, completely decoupled from the `MCP` protocol.

### Code Template

```TypeScript
// src/core/tools/search-documents.ts
export interface SearchDocumentsInput {
  query: string;
  limit?: number;
}

export interface Document {
  id: string;
  title: string;
}

export async function searchDocuments(
  input: SearchDocumentsInput
): Promise<Document[]> {
  // Pure capability implementation
  return [];
}

```

### Testing

- Unit tests to verify business logic correctness

- Supports reusability in non-`MCP` scenarios

## Application Layer (`src/mcp/`)

**Directory**: `src/mcp/`

**Responsibility**: Defines the `MCP Server` and registers Core Layer capabilities as `MCP` units. Holds `Schemas`, `Callbacks`, `Resource URIs`, and `Prompt` templates.

### Key Components of a Tool

1. **Schema**: Input/output contracts defined using Zod

2. **Callback / Handler**: Parameter validation → Call Core Layer → Format MCP response

3. **Registration Configuration**

### Code Template

```TypeScript
// src/mcp/tools/search-documents.ts
import { z } from "zod";
import { searchDocuments } from "../../core/tools/search-documents";

export const SearchDocumentsInputSchema = z.object({
  query: z.string().min(1).describe("The search query string."),
  limit: z.number().min(1).max(50).optional().describe("Max results."),
});

export const SearchDocumentsOutputSchema = z.object({
  content: z.array(
    z.object({ type: z.literal("text"), text: z.string() })
  ),
});

export type SearchDocumentsInput = z.infer<typeof SearchDocumentsInputSchema>;

export const SearchDocumentsTool = {
  name: "search_documents",
  title: "Search documents",
  description: "Search for documents matching a query.",
  inputSchema: SearchDocumentsInputSchema,
  outputSchema: SearchDocumentsOutputSchema,
  async callback({ query, limit }: SearchDocumentsInput) {
    const docs = await searchDocuments({ query, limit });

    return { content: [{ type: "text", text: JSON.stringify(docs) }] };
  },
};

```

### Server Aggregation

```TypeScript
// src/mcp/server.ts
import { McpServer } from "@modelcontextprotocol/server";
import { SearchDocumentsTool } from "./tools/search-documents";

export function createMcpServer() {
  const server = new McpServer({ name: "my-mcp-server", version: "1.0.0" });
  server.registerTool(
    SearchDocumentsTool.name,
    {
      title: SearchDocumentsTool.title,
      description: SearchDocumentsTool.description,
      inputSchema: SearchDocumentsTool.inputSchema,
      outputSchema: SearchDocumentsTool.outputSchema,
    },
    async (input) => {
      const result = await SearchDocumentsTool.callback(input);

      return result;
    },
  );
  return server;
}

```

### Testing

- **Schema Testing**: Verify validation rules

- **Callback Testing**: Verify MCP response structures

- **Contract Testing**: Verify `MCP` protocol compliance using an in-memory `Transport`

## Facade Layer (`src/facade/`)

**Directory**: `src/facade/`

**Responsibility**: Exposes services to external clients

### Code Template

```TypeScript
// src/facade/mcp.ts
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import { createMcpServer } from "../application/server";

export async function startStdioServer() {
  const server = setupMcpServer();
  const transport = new StdioServerTransport();

  await server.connect(transport);
}

```

### Testing

- E2E test coverage (verifies service initialization + transport channel I/O)

- Facade Layer usually omits standalone unit tests

## Directory Structure

```Plaintext
src/
  core/          # Core Layer: Pure domain logic
    tools/
    resources/
    prompts/
  mcp/           # Application Layer: MCP adaptation
    tools/
    resources/
    prompts/
    server.ts
  facade/        # Facade Layer: Dual CLI + MCP architecture support
    mcp.ts       # Specialized subcommand for launching the MCP service
    [command].ts # Standard subcommands for CLI-based functionality
  index.ts       # CLI parsing and delegation
tests/
  e2e/           # E2E Tests
    tools/
    resources/
    prompts/

```

**Naming Conventions**:

- Colocate unit tests with source files (`xxx.test.ts`)
- Place `E2E` tests in `tests/e2e/`
- Facade Layer skips unit tests by default; coverage is handled via `E2E`
