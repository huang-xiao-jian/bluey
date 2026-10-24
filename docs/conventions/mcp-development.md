# MCP Server 开发指南

## 架构设计

核心能力是主要实现。CLI 和 MCP 支持均为 adapter，通过不同的外部 interface
公开同一项能力。

```Plaintext
Host / Client（外部）
        │
        ▼
Facade Layer       → 解析 CLI 命令或启动 MCP transport
        │
        ├───────────────┐
        ▼               ▼
CLI 处理             MCP Adapter     → 将能力适配至 MCP
        │               │
        └───────┬───────┘
                ▼
Core Layer                         → 实现主要能力
                ▲
                │
可选 Infrastructure                → 实现外部系统 port

Composition Root 为任一外部 interface 装配 core 依赖和可选 infrastructure。
```

业务逻辑必须独立于 CLI 和 MCP 协议相关事项。两种 interface 将输入转换为 core model
后，均可直接调用核心能力。

## 核心层（Core Layer）

**目录**：`src/core/`

**职责**：实现 tool、resource 和 prompt 的领域逻辑，并与 MCP 协议和 transport layer
解耦。按能力或领域概念组织目录，不强制划分为 `tools`、`resources` 和 `prompts`
子目录。

框架辅助的依赖注入（包括 Inversify 提供的 decorator）与 core 的纯粹性并不冲突。
这里的纯粹性是指能力不依赖 MCP 或 CLI 协议行为，并且无需启动任一 interface
即可使用和测试。

### 代码模板

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

### 测试

- 使用与源文件放在一起的单元测试验证业务逻辑的正确性。
- 验证能力无需模拟 CLI 或 MCP 环境即可运行。

## 组装层（Composition Layer）

**目录**：`src/composition/`

**职责**：作为依赖的 composition root。它构造 core workflow，将 port 绑定到具体实现，
并向 CLI 和 MCP adapter 返回可直接使用的能力。

Composition layer 只包含装配逻辑，不包含业务逻辑或协议逻辑。文件以其装配的能力命名，
例如 `link-check-composition.ts`。

## MCP 适配层（MCP Adapter Layer）

**目录**：`src/mcp/`

**职责**：定义 MCP server，并将核心能力适配为 MCP tool、resource 和 prompt。
该层包含 Zod schema、callback、resource URI、prompt template、注册配置以及
server response 聚合。

### Tool 的关键组成部分

1. **Schema**：使用 Zod 定义 input 和 structured-output contract。
2. **Callback**：验证参数、将参数转换为 core model、调用核心能力、验证其输出，
   并返回 adapter-level result data。
3. **注册配置**：定义 tool 名称、标题、描述、schema 和 annotation。
4. **Server 聚合**：注册 tool、格式化 MCP `content` 和 `structuredContent`，
   并将失败映射为 MCP error response。

### Tool 代码模板

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

### Server 聚合代码模板

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

### MCP Adapter 测试

- **Schema 测试**：验证 MCP input 和 output contract 的校验及默认值。
- **Callback 测试**：验证向 core input 的转换以及 adapter-level result data。
- **Contract 测试**：使用 in-memory transport 验证已注册的能力和 MCP response
  结构。这些测试应与其覆盖的 MCP server 或能力放在一起。

## 门面层（Facade Layer）

**目录**：`src/facade/`

**职责**：向外部 client 公开 service。CLI handler 在调用已装配的核心能力前解析并转换
命令输入。MCP handler 创建 server、连接 transport 并运行 server。

### Facade 代码模板

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

## 可选 Infrastructure Layer

**目录**：需要时使用 `src/infrastructure/`

**职责**：为 filesystem、network service 或 database 等外部系统实现 core port。
当能力没有此类依赖时，不要创建这一层。Composition root 负责选择并装配这些实现。

## 目录结构

仅创建 package 实际需要的能力目录和可选 adapter。

```shell
src/
  core/                    # 主要且独立于 MCP 的能力
    [capability]/
    model/
    ports/
  composition/             # 依赖的 composition root
    [capability]-composition.ts
  mcp/                     # MCP 适配
    tools/                 # Server 公开 tool 时使用
    resources/             # Server 公开 resource 时使用
    prompts/               # Server 公开 prompt 时使用
    server.ts
  facade/                  # 外部 CLI 和 MCP 入口
    mcp-handler.ts
    [command]-handler.ts
  [infrastructure/]        # 可选的外部系统 adapter
  index.ts                 # CLI 解析和委托
tests/
  e2e/                     # 构建后可执行文件和外部 interface 测试
```

单元测试和 contract test 可以与源文件放在一起。`tests/e2e/` 仅用于执行构建后 package
或以其他方式跨越 package 外部边界的测试。
