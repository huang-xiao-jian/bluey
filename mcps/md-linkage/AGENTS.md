# AGENTS

## Vital Tech

- **`commander`**: Parses the CLI commands and options.
- **`zod`**: Validates shared request and response contracts and provides inferred TypeScript types.
- **`@modelcontextprotocol/sdk`**: Provides MCP tool registration and transport support.
- **`inversify`**: Provides the dependency injection container used to bind and
  resolve application services and their collaborators by constructor token.

## Package Selections

- **`mdast-util-from-markdown`**: Parses CommonMark into a syntax tree so links
  and headings can be detected without fragile regular expressions. The
  higher-level `remark` processing pipeline is unnecessary for this use case.
- **`unist-util-visit`**: Traverses link and heading nodes in the Markdown
  syntax tree without requiring a custom recursive walker.
- **`mdast-util-to-string`**: Extracts visible heading text, including headings
  containing nested Markdown formatting, for anchor generation.
- **`github-slugger`**: Generates the GitHub-compatible heading identifiers and
  duplicate-heading suffixes required by the anchor detection stories.
- **`@types/mdast`**: Provides TypeScript types for Markdown document roots,
  links, and headings. This is a development dependency.
