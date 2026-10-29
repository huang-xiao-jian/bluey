# npm-plus

## 参考资料

- [NPM 生态质量支持规约](../../specs/npm-plus/spec.md)
- [CLI 接入层设计](../../specs/npm-plus/interfaces/cli.md)
- [MCP 接入层设计](../../specs/npm-plus/interfaces/mcp.md)

`@bluey/npm-plus` 通过官方 npm Registry 的 `latest` tag 将 `npm package` 确定为精确版本，并提供该版本发布内容中的客观质量事实。当前支持的质量维度是直接依赖规模。

结果不包含评分、评级、采用建议、横向比较或替代 package 推荐。

## CLI

构建后可通过以下命令检查 package：

```sh
npm-plus inspect <package-name> [--json]
```

```sh
npm-plus inspect typescript
```

指定 `--json` 时，`stdout` 只包含完整 `InspectResult`：

```sh
npm-plus inspect typescript --json
```

版本标识不属于支持的输入。目标 package 的 `latest` 版本无法确定时，命令以非零状态结束且不输出 `InspectResult`。单个质量维度获取失败时，命令仍成功，并将稳定的异常名称与消息记录在 `quality.exceptions` 中。

## MCP

以下命令通过 `stdio` 启动 MCP server：

```sh
npm-plus mcp
```

Server 注册只读工具 `inspect_npm_package`，输入只包含必填的 `packageName`。成功响应的 `structuredContent` 是完整 `InspectResult`；目标确定错误使用 MCP error response。

本地构建后的客户端配置示例：

```json
{
  "mcpServers": {
    "npm-plus": {
      "command": "/absolute/path/to/bluey/mcps/npm-plus/dist/index.mjs",
      "args": ["mcp"]
    }
  }
}
```

## 开发

```sh
mise exec -- pnpm --filter @bluey/npm-plus typecheck
mise exec -- pnpm --filter @bluey/npm-plus build
mise exec -- pnpm --filter @bluey/npm-plus test
```
