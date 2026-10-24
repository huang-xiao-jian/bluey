# 自动化测试规范

## 技术选型

- 测试运行器：`vitest`

## 测试规范

### 文件组织规范

- 单元测试与源文件放在一起。
- 单元测试的 **fixture** 与源文件放在一起。
- `E2E` 测试放在 `tests/e2e/` 中。

```shell
├── inference
│   └── __fixtures__
│   └── observer.ts
│   ├── observer.test.ts
```

### 测试代码规范

- 必须显式导入 `vitest` API。
- `vitest` 测试用例必须完全使用英语编写。
- 通过测试局部 container 或生产环境 composition factory 解析采用依赖注入的系统及其
  托管协作者。不要使用 `new` 手动重建其 object graph。
- 当直接构造 value object、不可变测试数据和依赖注入图外的协作者能让测试更明确时，
  应直接构造它们。

```ts
import { describe, expect, it, rstest } from "vitest";

it("should return single point", () => {
  // Arrange、Act、Assert 模式
});
```

### 运行测试

```bash
# 运行指定测试用例
pnpm vitest run -t "should return single point"

# 运行文件名包含 "observer" 的测试用例
pnpm vitest run "observer"

# 运行指定 package 的测试用例
pnpm vitest run --project @bluey/echo-mcp
```
