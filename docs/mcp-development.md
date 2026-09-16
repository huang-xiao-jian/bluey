# MCP development notes

The repository uses TypeScript MCP servers built on the official SDK. The included `@bluey/echo-mcp` package is intentionally small: it demonstrates server setup, schema validation, a read-only tool, and a smoke test.

## Local development

```sh
pnpm install
pnpm --filter @bluey/echo-mcp build
pnpm --filter @bluey/echo-mcp test
```

Use `pnpm --filter <package-name> dev` while developing. Stdio transport is the default: protocol output belongs on stdout and all logging belongs on stderr.

## Connect a server to Codex

After building a server, add an MCP server entry in your Codex configuration that invokes its compiled entry point, for example:

```toml
[mcp_servers.my_server]
command = "node"
args = ["/absolute/path/to/bluey/mcps/my-server/dist/index.js"]
```

If the server needs secrets, pass them through environment configuration rather than source files. Consult the official Codex MCP documentation for the configuration location and additional transport options, since that host configuration can change independently of this repository.
