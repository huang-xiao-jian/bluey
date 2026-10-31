# TerminalInspectSummary

## 相关文档

- [InspectResult](./inspect-result.md)

## 定义

面向直接在 terminal 中查看结果的开发者，不要求开发者理解 **InspectResult** 的字段结构，也不使用 JSON 展示信息。

检查成功时，报告解释 **InspectResult**。
检查委托无法建立或检查目标无法确定时，报告解释失败原因和可采取的下一步，不显示异常类名、错误码、stack、cause 或底层实现详情。

报告应帮助开发者快速回答三个问题：

1. 实际检查了哪个 package 版本？
2. 获取到了哪些质量事实？
3. 是否有质量数据未能取得，原因是什么？

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

如果用户直接指定精确版本时，不显示“版本来源”一行。

### 依赖规模数据不可用

```text
检查目标  typescript@5.7.3

依赖规模  数据不可用

异常详情
  PackageManifestReadError
  Unable to read dependency declarations from the published package manifest.
```

### 检查请求无法建立

```text
无法检查 npm package

原因
  暂不支持版本范围“^2.1.0”，请提供精确版本号或 tag。
```

### 检查目标无法确定

```text
无法检查 npm package

原因
  npm Registry 中未找到 package“example-package”，请确认名称是否正确以及该 package 是否已发布。
```

失败摘要写入 `stderr`，CLI 以非零状态结束。即使使用 `--json`，失败也不得输出部分 JSON 或
序列化异常对象。
