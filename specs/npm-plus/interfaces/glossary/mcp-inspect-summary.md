# McpInspectSummary

## 参考文档

- [InspectResult](./inspect-result.md)

## 定义

`inspect_npm_package` 响应给 MCP client 的非 structured 文本报告。执行成功时呈现本次检查的
主要信息，使接收方无需读取 `structuredContent`，也能了解检查目标、依赖规模事实以及数据
获取异常。

检查委托无法建立或检查目标无法确定时，工具返回 `isError: true`，并在文本内容中解释失败原因
和可采取的下一步，不显示异常类名、错误码、stack、cause 或底层实现详情，也不提供
`structuredContent`。

## 文本效果

### 依赖规模数据可用

```text
检查目标  typescript@5.7.3
版本来源  latest tag

依赖规模
  运行时依赖  0
  可选依赖    0
  对等依赖    0
  捆绑依赖    0

数据获取异常  0
```

### 依赖规模数据不可用

```text
检查目标  typescript@5.7.3

依赖规模  数据不可用

异常详情
  PackageManifestReadError
  Unable to read dependency declarations from the published package manifest.
```

### 检查失败

```text
无法检查 npm package

原因
  npm Registry 返回 HTTP 503，当前无法获取 package“example-package”的信息。
```
