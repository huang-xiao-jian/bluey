# MCP development notes

The repository uses TypeScript MCP servers built on the official SDK. The
included `@bluey/echo-mcp` package is intentionally small: it demonstrates
server setup, schema validation, a read-only tool, and a smoke test.

## Local development

```sh
pnpm install
pnpm build
pnpm test
pnpm typecheck
```

Use `pnpm --filter <package-name> dev` while developing. To run one package's
task, use `pnpm --filter <package-name> build`, `test`, or `typecheck`.

## Connect a server to Codex

After building a server, add an MCP server entry in your Codex configuration that invokes its compiled entry point, for example:

```toml
[mcp_servers.my_server]
command = "node"
args = ["/absolute/path/to/bluey/mcps/my-server/dist/index.mjs"]
```

Consult the official Codex MCP documentation for the configuration location and
additional transport options, since that host configuration can change
independently of this repository.
