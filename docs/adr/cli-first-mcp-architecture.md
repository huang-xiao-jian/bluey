# CLI 优先的 MCP 架构

## 背景

项目必须同时支持 `CLI` 和 `MCP` server，但尚未建立统一架构。如果缺少统一架构，
业务逻辑会分散在 `MCP` 和 `CLI` 实现中，从而增加维护成本、降低交付稳定性，
并使持续迭代变得困难。

## 决策

- 每个 package 同时支持 `CLI` 和 `MCP` 模式。`CLI` 是项目的主要形态，`MCP`
  通过其 `mcp` subcommand 启动。
- 业务逻辑同时独立于 `CLI` 和 `MCP` context，严格专注于交付业务能力。

## 影响

### 正面影响

- 项目在设计上具备独立的 `CLI` 价值；`MCP` 只是一个 subcommand，降低了用户的认知负担。
- 业务逻辑只需实现一次，并可集中迭代和维护。
- 核心业务代码与 transport layer 解耦，可以独立测试。

### 负面影响

- 需要更高层次的架构设计，以确保 `CLI` 和 `MCP` adapter layer 都不包含业务逻辑。
- 即使用户只使用 `CLI`，项目也必须依赖 `MCP` library，从而增加安装体积。

### 示例对比

| 场景 | 决策前 | 决策后 |
| --- | --- | --- |
| 用户安装 | 分别安装 CLI 和 MCP package。 | 安装一个 package，并通过 subcommand 选择模式。 |
| 添加 tool | 在 CLI 项目和 MCP 项目中各实现一次。 | 在 core layer 中实现一次，再通过各 adapter layer 调用。 |
| 测试业务逻辑 | 分别模拟 CLI 和 MCP 环境。 | 直接测试纯 core-layer function，无需模拟环境。 |

## 备选方案

### 备选方案 1：拆分为两个独立 package

将 `CLI` 和 `MCP` 实现为独立的 npm package，各自包含一套业务逻辑实现。

**拒绝原因**：业务逻辑需要实现两次，维护成本会翻倍。用户还必须进行明确选择，
从而增加认知负担。

### 备选方案 2：MCP 优先，CLI 作为轻量 MCP wrapper

以 `MCP` server 为主要形态，由 `CLI` 调用其 `JSON-RPC` interface。

**拒绝原因**：`CLI` 用户需要理解 `MCP` 协议概念，数据传输效率也会降低。

### 备选方案 3：通过环境变量选择模式

不使用 subcommand，而是通过 `MCP_MODE=true` 环境变量选择启动模式。

**拒绝原因**：环境变量会隐式改变行为，不符合传统 `CLI` 项目的显式命令惯例。
用户也无法通过 `--help` 直接发现可用模式。

## 推翻条件

- 当 `CLI` 和 `MCP` 业务逻辑分歧过大而无法共享时，考虑拆分 package。
- 当 `MCP` 协议的重大变更导致 adapter layer 复杂度显著增加时，重新评估本决策。
