# TypeScript 规范

本文档定义仓库默认的 TypeScript 代码风格。除非 package 或 runtime 有更具体的要求，
否则应遵循本规范。

## 面向对象设计

- 对于有状态的领域行为、service 和依赖边界，优先使用 class。
- 对于小型无状态转换、predicate、schema，以及其他无法从 object 生命周期获益的行为，
  使用 function。
- 每个 class 应聚焦于一项职责，并公开精简、明确的 public API。
- 封装可变状态。相较于可公开写入的 property，优先使用 `private` 或 `protected` member。
- 通过 constructor 提供必需的协作者，使依赖清晰可见，并让 instance 易于测试。
- 优先使用 composition 和 delegation，而不是 inheritance。仅当 subtype 与 base type
  之间存在真正可替换的关系时使用 inheritance。
- 在 repository、外部 service 和可替换 strategy 等有意义的边界定义 interface。
  不要仅为了映射每个 class 而创建 interface。
- 避免 static utility class，以及仅包装单个无状态 function 的 class。

## 类实现（Class）

- Class 名称使用描述清晰的名词，method 名称使用动词。
- 当显式声明 member 可见性能够改善 public contract 时，应进行声明。
- 对于不会被重新赋值的依赖和状态，优先使用 `readonly` field。
- Constructor 中不应包含 I/O 或大量业务逻辑。
- 在 class 内部维护 class invariant，不要要求调用者协调内部状态。
- 通过 public API 测试可观察行为。避免测试与 private 实现细节耦合。

## 依赖注入

- 使用 concrete class 或 abstract class 作为 service identifier，使 constructor type
  metadata 无需 parameter-level injection decorator 即可解析依赖。
- 当 concrete class 或 abstract class 能够表达依赖时，不要引入 string 或 symbol
  service identifier。
- 允许使用 injection decorator。显式标注有帮助时，对 class service identifier 使用
  `@inject`；当 constructor 使用同一 abstract class 的多个实现时，使用 `@multiInject`。
- 将 service binding 保留在 composition root 中，并使用 `@injectable` 向 container
  提供 constructor metadata。

## 导入（Import）

- Import 不包含文件扩展名，relative import 也不例外。
- 从可用的最窄稳定 module boundary 导入。
- 当 import 仅作为 type 使用时，使用 `import type`。
- 仅当 runtime、compiler 或外部 tool 明确要求时，才包含文件扩展名。
