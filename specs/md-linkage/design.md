# Technical Design

## Package Selections

- **`tinyglobby`**: Expands project-relative and permitted absolute include and
  exclude selectors. It provides the required glob behavior with a smaller
  dependency surface than `globby` or `fast-glob`.
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
- **`commander`**: Parses the CLI commands and options. This dependency already
  exists in the package.
- **`zod`**: Validates shared request and response contracts and provides
  inferred TypeScript types. This dependency already exists in the package.
- **`@modelcontextprotocol/sdk`**: Provides MCP tool registration and transport
  support. This dependency already exists in the package.
