# 采用 CLI 优先的 MCP 架构

## 背景

项目必须同时支持 `CLI` 和 `MCP Server`。如果缺少统一架构，业务逻辑会分散在 `CLI` 和 `MCP` 实现中，从而增加维护成本、降低交付稳定性，并使持续迭代变得困难。

## 决策

**所有 `MCP package` 采用 `CLI` 优先的双模式架构。**

核心约定：

1. 每个 `MCP package` 同时支持 `CLI` 和 `MCP` 模式。`CLI` 是主要形态，`MCP Server` 通过 `mcp subcommand` 启动。
2. 业务逻辑独立于 `CLI` 和 `MCP adapter layer`，仅负责交付业务能力。
3. `CLI` 和 `MCP adapter layer` 调用同一套业务逻辑，不各自实现业务规则。

## 后果

### 正面影响

- 项目在设计上具备独立的 `CLI` 价值；`MCP` 作为子命令出现，降低了用户认知负担。
- 业务逻辑只需实现一次，并可集中迭代和维护。
- 核心业务代码与 transport layer 解耦，可以独立测试。

### 负面影响

- 需要更高层次的架构设计，以确保 `CLI` 和 `MCP adapter layer` 都不包含业务逻辑。
- 即使用户只使用 `CLI`，项目也必须依赖 `MCP SDK`，增加安装体积。

## 备选方案

1. 将 `CLI` 和 `MCP` 拆分为独立的 `npm package`，并共享单独的 core package → 增加 package、发布流程和安装选择，无法实现单一入口的交付方式。
2. 以 `MCP Server` 为主要形态，由 `CLI` 通过 `JSON-RPC interface` 调用 → `CLI` 路径会额外依赖 `MCP` 的生命周期、协议和传输模型，削弱其作为独立工具的价值。
3. 通过 `MCP_MODE=true` 环境变量选择启动模式 → 环境变量会隐式改变程序行为，且用户无法通过 `--help` 直接发现可用模式。

## 重评估条件

1. `CLI` 和 `MCP` 的业务逻辑分歧过大而无法共享：重新评估是否继续由单一 package 同时交付两种模式。
2. `MCP` 协议发生重大变更，导致 `adapter layer` 的复杂度显著增加：重新评估是否将 `MCP Server` 拆分为独立 package。
