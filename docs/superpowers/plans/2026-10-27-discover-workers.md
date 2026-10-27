# discover-workers Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 创建仅供显式调用的 `$discover-workers` Skill，从业务用例规约中识别职责抽象，并区分人主动介入与自动化策略两类实现方式。

**Architecture:** 以 `SKILL.md` 定义识别流程和边界，以 `references/` 保存输出模板与完整案例，以 `evals/` 固化清晰输入、自动化职责和含糊输入的可观察行为。先运行不加载 Skill 的基线场景，再编写最小 Skill 使同一组场景通过。

**Tech Stack:** Markdown、YAML、Codex Skill、skill-up、skill-creator validator

**Spec:** `docs/superpowers/specs/2026-10-27-discover-workers-design.md`

## Global Constraints

- 仓库自然语言内容使用简体中文，稳定标识、产品名、协议名、技术名、代码标识符、路径和命令保持英语。
- Skill 目录名和 front matter `name` 必须为 `discover-workers`。
- Skill 仅允许通过 `$discover-workers` 显式调用。
- 业务工人是业务职责抽象；不得等同于现实人员、岗位、组织部门或技术组件。
- 系统内部自动动作不得因自动执行而被排除，必须按业务目的抽象并描述为自动化策略实现。
- 人主动介入和自动化策略是业务工人的实现方式；只有业务目标、决策权或责任结果不同才拆分业务工人。
- 所有结论必须可追溯到输入用例规约；依据不足时要求澄清，不得补造。
- 仓库文档不得使用 Markdown 表格。
- 不修改或提交根目录中未跟踪的 `discover-worker.md` 和 `discover-worker-1.md`。

---

## File Map

- `skills/discover-workers/SKILL.md`：声明触发条件、输入契约、职责抽象流程、实现关系和审查清单。
- `skills/discover-workers/agents/openai.yaml`：配置显式调用策略和中文界面文案。
- `skills/discover-workers/references/worker-template.md`：定义最终输出的必填结构。
- `skills/discover-workers/references/example-use-case.md`：提供同时包含人工介入、自动化策略与技术备注的完整案例输入。
- `skills/discover-workers/references/example-result.md`：提供案例输入对应的完整业务工人发现结果。
- `skills/discover-workers/evals/eval.yaml`：配置 Codex 评测引擎和全部用例。
- `skills/discover-workers/evals/cases/identify-fulfillment-workers.yaml`：验证职责抽象、自动化策略、人工介入和技术噪声过滤。
- `skills/discover-workers/evals/cases/reject-ambiguous-requirement.yaml`：验证含糊输入不会触发职责补造。

### Task 1: 建立 RED 行为评测契约

**Files:**

- Create: `skills/discover-workers/evals/eval.yaml`
- Create: `skills/discover-workers/evals/cases/identify-fulfillment-workers.yaml`
- Create: `skills/discover-workers/evals/cases/reject-ambiguous-requirement.yaml`

**Interfaces:**

- Consumes: `docs/superpowers/specs/2026-10-27-discover-workers-design.md` 中的调用边界、输出契约和验证策略。
- Produces: 两个稳定 case ID：`identify-fulfillment-workers` 与 `reject-ambiguous-requirement`；Task 2 必须使它们通过。

- [ ] **Step 1: 运行不加载 Skill 的清晰输入基线**

向一个全新上下文的 agent 提交以下真实任务，不提供 `discover-workers` Skill、设计结论或预期答案：

```text
请从下面的用例规约中识别业务工人，并只输出最终结果。

# 处理订单履约

客户提交已支付订单。系统登记订单并检查库存。库存充足时，系统预留库存并进入待发货状态。履约负责人检查高风险订单，决定继续履约或暂停订单。仓库确认拣货完成后，系统生成发货指令。订单进入待发货状态超过二十四小时时，系统自动识别超时订单并升级处理；运营人员可以确认继续等待或取消订单。取消后系统释放库存并通知客户。

实现备注：超时扫描由每十分钟运行一次的 CronJob 触发，订单状态保存在 Order 表中。
```

记录 agent 是否出现以下任一失败：

- 把“履约负责人”“运营人员”或 `CronJob` 直接当作业务工人，没有先抽象业务职责。
- 排除“自动识别超时订单”，没有识别自动化策略。
- 将人工处理与自动处理拆成重复职责，未建立抽象—实现关系。
- 没有提供输入依据。

如果基线没有出现任何失败，增强同一场景中的岗位名和技术实现诱因后重新运行，直到观察到与设计目标相关的真实失败；不得先编写 Skill。

- [ ] **Step 2: 运行不加载 Skill 的含糊输入基线**

向另一个全新上下文的 agent 提交：

```text
请识别会员运营业务中的业务工人。我们计划支持会员注册、续费、积分和权益，具体流程、参与者、自动化规则和异常处理以后再定。
```

记录 agent 是否补造“会员管理员”“积分管理员”、定时续费或人工审核等输入中不存在的职责与实现方式。该观察结果用于检查拒绝场景是否针对真实失败。

- [ ] **Step 3: 创建评测配置**

创建 `skills/discover-workers/evals/eval.yaml`：

```yaml
schema_version: v1alpha1

environment:
  type: none

skills:
  - source: local_path
    path: .

engine:
  name: codex

cases:
  files:
    - evals/cases/identify-fulfillment-workers.yaml
    - evals/cases/reject-ambiguous-requirement.yaml
  defaults:
    timeout_seconds: 120
    max_turns: 1

report:
  formats: [json]
```

- [ ] **Step 4: 创建清晰输入评测**

创建 `skills/discover-workers/evals/cases/identify-fulfillment-workers.yaml`，输入使用 Step 1 的完整用例规约，并使用以下断言：

```yaml
id: identify-fulfillment-workers
title: 从订单履约用例中识别职责抽象及其实现方式
description: |
  验证 Skill 能够从清晰用例中识别业务工人，将人工介入与自动化策略表达为
  抽象职责的实现方式，并排除岗位名和技术组件对命名的干扰。

input:
  prompt: |
    请使用简体中文回答。使用 $discover-workers 从以下用例规约中识别业务工人。
    只输出最终的业务工人发现结果。

    # 处理订单履约

    ## 参与者

    - 主要参与者：客户
    - 协作参与者：仓库

    ## 基本事件流

    1. 客户提交已支付订单。
    2. 系统登记订单并检查库存。
    3. 库存充足时，系统预留库存并将订单置为待发货。
    4. 履约负责人检查高风险订单，决定继续履约或暂停订单。
    5. 仓库确认拣货完成。
    6. 系统生成发货指令。

    ## 异常事件流

    1. 订单进入待发货状态超过二十四小时时，系统自动识别超时订单并升级处理。
    2. 运营人员确认继续等待或取消订单。
    3. 取消订单后，系统释放库存并通知客户。

    ## 业务规则

    - 高风险订单必须经过明确的继续履约决定才能生成发货指令。
    - 待发货超过二十四小时的订单必须进入升级处理。

    ## 实现备注

    - 超时扫描由每十分钟运行一次的 CronJob 触发。
    - 订单状态保存在 Order 表中。

expect:
  must_contain:
    - "# 业务工人发现结果"
    - "## 业务工人清单"
    - "## 用例—业务工人职责映射"
    - "## 待澄清问题"
    - "**业务目标**"
    - "**职责边界**"
    - "**识别依据**"
    - "**人主动介入**"
    - "**自动化策略**"
    - "超时"
  must_not_contain:
    - "### 履约负责人"
    - "### 运营人员"
    - "### CronJob"
    - "### Order 表"
    - "{业务工人名称}"
    - "<!--"

judge:
  type: rule_based
  success:
    - output_matches:
        all:
          - "(?m)^# 业务工人发现结果$"
          - "(?m)^## 业务工人清单$"
          - "(?m)^## 用例—业务工人职责映射$"
          - "(?m)^## 待澄清问题$"
          - "(?s)\\*\\*人主动介入\\*\\*.*\\*\\*自动化策略\\*\\*"
        not:
          - "(?m)^### (履约负责人|运营人员|CronJob|Order 表)$"
          - "\\{[^}]+\\}|<!--"
```

- [ ] **Step 5: 创建含糊输入评测**

创建 `skills/discover-workers/evals/cases/reject-ambiguous-requirement.yaml`：

```yaml
id: reject-ambiguous-requirement
title: 拒绝从含糊需求中补造业务工人
description: |
  验证输入缺少业务流程、责任结果和实现依据时，Skill 会要求补充用例规约，
  而不是自行设计现实岗位、业务职责或自动化策略。

input:
  prompt: |
    请使用简体中文回答。使用 $discover-workers 从下面的需求中识别业务工人：

    我们计划支持会员注册、续费、积分和权益。
    具体业务流程、参与者、自动化规则和异常处理以后再定。

expect:
  must_contain:
    - "用例规约"
  must_not_contain:
    - "## 业务工人清单"
    - "会员管理员"
    - "积分管理员"

judge:
  type: rule_based
  success:
    - output_contains:
        all: ["用例规约"]
        any: ["更清晰", "补充", "提供"]
        not: ["## 业务工人清单", "会员管理员", "积分管理员"]
```

- [ ] **Step 6: 验证 RED 状态**

运行：

```bash
/Users/jerry/.local/bin/skill-up validate skills/discover-workers/evals/eval.yaml
```

预期：配置语法可以读取，但由于 `skills/discover-workers/SKILL.md` 尚不存在，评测套件不能作为完整 Skill 通过验证。结合 Steps 1–2 的基线输出，确认失败来自能力缺失或错误抽象，而不是 YAML 拼写错误。

- [ ] **Step 7: 提交评测契约**

```bash
git add skills/discover-workers/evals/eval.yaml skills/discover-workers/evals/cases/identify-fulfillment-workers.yaml skills/discover-workers/evals/cases/reject-ambiguous-requirement.yaml
git commit -m "test(discover-workers): add evaluation cases"
```

### Task 2: 创建 Skill 并使评测转为 GREEN

**Files:**

- Create: `skills/discover-workers/SKILL.md`
- Create: `skills/discover-workers/agents/openai.yaml`
- Create: `skills/discover-workers/references/worker-template.md`
- Create: `skills/discover-workers/references/example-use-case.md`
- Create: `skills/discover-workers/references/example-result.md`

**Interfaces:**

- Consumes: Task 1 的两个评测 case、设计文档中的核心模型和输出契约。
- Produces: `$discover-workers` 显式调用入口；固定输出章节“业务工人清单”“用例—业务工人职责映射”“待澄清问题”；每个工人的人主动介入和自动化策略实现说明。

- [ ] **Step 1: 编写输出模板**

创建 `skills/discover-workers/references/worker-template.md`，固定以下结构：

```markdown
# 业务工人发现结果

<!-- 按需重复业务工人和职责映射结构；删除最终产物中的全部注释、说明和占位符。 -->

## 业务工人清单

### {业务工人名称}

- **业务目标**：{该抽象职责需要达成的业务结果}
- **职责边界**：{负责和不负责的业务范围}
- **输入**：{履责所需的业务信息或对象}
- **输出**：{履责后形成的业务结果}
- **决策点**：{需要作出的业务判断；没有时写“未识别到”}
- **异常责任**：{失败、例外或升级时承担的责任}
- **识别依据**：{引用或概括用例规约中的对应内容}

#### 实现方式

- **人主动介入**：{介入条件、决策权限和处理结果；没有依据时写“未识别到”}
- **自动化策略**：{触发条件、执行规则、自动结果和失败或升级路径；没有依据时写“未识别到”}

## 用例—业务工人职责映射

### {用例名称}

#### {业务工人名称}

- **承担职责**：{在该用例中承担的职责}
- **对应依据**：{相关步骤、规则或条件}

## 待澄清问题

- {只列出影响职责边界、合并拆分或实现关系的问题；没有时写“无”}
```

在模板中加入 HTML 注释，说明占位符、格式指导和注释不得出现在最终输出中；不要增加 Markdown 表格。

- [ ] **Step 2: 编写案例输入**

创建 `skills/discover-workers/references/example-use-case.md`：

```markdown
# 处理订单履约

## 参与者

- **主要参与者**：客户。
- **协作参与者**：仓储服务。

## 简要说明

客户提交已支付订单后，业务边界内部完成库存预留、风险处置、发货推进和履约时效管理。

## 前置条件

- 客户已经完成订单支付。
- 订单包含可识别的商品和配送信息。

## 基本事件流

1. 客户提交已支付订单。
2. 系统登记订单并检查库存。
3. 库存充足时，系统预留库存并将订单置为待发货。
4. 当订单被标记为高风险时，履约负责人检查风险信息，决定继续履约或暂停订单。
5. 仓储服务确认拣货完成。
6. 系统生成发货指令并记录发货结果。

## 异常事件流

### 库存不足

1. 系统确认库存不足。
2. 系统停止履约并释放已经形成的临时占用。
3. 系统记录订单无法履约的原因。

### 待发货超时

1. 订单处于待发货状态超过二十四小时时，系统自动识别超时订单并升级处理。
2. 运营人员检查超时原因，决定继续等待或取消订单。
3. 取消订单后，系统释放库存并通知客户。

## 后置条件

- 成功时，订单已经形成发货指令并记录发货结果。
- 暂停时，订单保留风险处置结果，不继续生成发货指令。
- 取消时，库存已经释放，订单保留取消原因。

## 业务规则

- 高风险订单必须经过明确的继续履约决定才能生成发货指令。
- 待发货超过二十四小时的订单必须进入升级处理。
- 超时订单只能继续等待或取消，不得在没有处理结果时退出升级流程。

## 实现备注

- 超时扫描由每十分钟运行一次的 `CronJob` 触发。
- 订单状态保存在 `Order` 表中。
- 风险处置页面通过内部 REST API 提交决定。
```

- [ ] **Step 3: 编写案例结果**

创建 `skills/discover-workers/references/example-result.md`：

```markdown
# 业务工人发现结果

## 业务工人清单

### 履约推进者

- **业务目标**：使符合条件的已支付订单形成可执行的发货结果。
- **职责边界**：负责登记订单、确认库存可履约、预留库存和生成发货指令；不负责高风险订单的放行决定。
- **输入**：已支付订单、库存信息和仓储服务的拣货结果。
- **输出**：待发货订单、库存预留结果、发货指令和发货结果记录。
- **决策点**：库存是否足以继续履约。
- **异常责任**：库存不足时停止履约、释放临时占用并记录原因。
- **识别依据**：基本事件流第 2、3、5、6 步以及“库存不足”异常事件流。

#### 实现方式

- **人主动介入**：未识别到。
- **自动化策略**：收到已支付订单后检查库存；库存充足时预留库存，在仓储服务确认拣货完成后生成发货指令；库存不足时停止履约并记录原因。

### 风险处置者

- **业务目标**：确保高风险订单在获得明确处置结果后才继续履约。
- **职责边界**：负责检查高风险信息并决定继续履约或暂停订单；不负责普通订单的库存预留和发货执行。
- **输入**：被标记为高风险的订单及其风险信息。
- **输出**：继续履约或暂停订单的处置结果。
- **决策点**：高风险订单是否可以继续履约。
- **异常责任**：无法作出继续履约决定时保持订单暂停，避免生成发货指令。
- **识别依据**：基本事件流第 4 步和“高风险订单必须经过明确决定”的业务规则。

#### 实现方式

- **人主动介入**：高风险订单出现时，由具有处置权限的人检查风险信息并决定继续履约或暂停订单。用例中的“履约负责人”是该实现方式的现实称谓，不作为业务工人名称。
- **自动化策略**：未识别到。

### 履约时效管理者

- **业务目标**：确保待发货订单超过时限后获得明确处理结果。
- **职责边界**：负责识别待发货超时、发起升级处理并收敛为继续等待或取消结果；不负责普通订单的发货执行。
- **输入**：订单的待发货状态、进入该状态的时间和超时原因。
- **输出**：超时升级记录，以及继续等待或取消订单的处理结果。
- **决策点**：超时订单应继续等待还是取消。
- **异常责任**：超时后没有处理结果时保持升级状态；取消时确保库存释放并通知客户。
- **识别依据**：“待发货超时”异常事件流和两条超时相关业务规则。

#### 实现方式

- **人主动介入**：订单进入超时升级后，由具有处置权限的人检查原因并决定继续等待或取消。用例中的“运营人员”是实现称谓，不作为业务工人名称。
- **自动化策略**：订单处于待发货状态超过二十四小时时自动识别并升级；取消决定形成后自动释放库存并通知客户。`CronJob` 只是触发扫描的技术实现，不是业务工人。

## 用例—业务工人职责映射

### 处理订单履约

#### 履约推进者

- **承担职责**：登记已支付订单、检查并预留库存、根据拣货结果生成发货指令。
- **对应依据**：基本事件流第 2、3、5、6 步以及“库存不足”异常事件流。

#### 风险处置者

- **承担职责**：对高风险订单作出继续履约或暂停决定。
- **对应依据**：基本事件流第 4 步和高风险订单业务规则。

#### 履约时效管理者

- **承担职责**：识别待发货超时、升级处理并形成继续等待或取消结果。
- **对应依据**：“待发货超时”异常事件流和超时业务规则。

## 待澄清问题

- 无。
```

- [ ] **Step 4: 编写最小 Skill 入口**

创建 `skills/discover-workers/SKILL.md`：

```markdown
---
name: discover-workers
description: 仅在用户明确调用 $discover-workers，并提供清晰的业务用例规约以识别业务工人及其实现方式时使用。
---

# 发现业务工人

## 参考资料

- [订单履约用例规约案例](references/example-use-case.md)
- [订单履约业务工人发现案例](references/example-result.md)
- [业务工人发现输出模板](references/worker-template.md)

## 输入

用户必须提供能够识别业务行为、责任结果及其依据的业务用例规约。

输入不足以判断职责边界、合并拆分或实现关系时，停止识别并要求用户补充更清晰的用例规约。不得根据常见岗位、行业经验或技术实现补造业务事实。

## 核心原则

1. **职责抽象优先**：业务工人表示业务边界内部对结果负责的稳定职责，不是人员、岗位、部门或技术组件。
2. **抽象与实现分离**：先识别业务工人，再分别描述人主动介入和自动化策略如何实现该职责。
3. **保留自动职责**：超时检测、周期处理和规则驱动动作不能因自动执行而被排除，应按业务目的抽象。
4. **依据可追溯**：业务工人、职责边界和实现方式都必须能够回溯到用例规约。

## 工作流

### 1. 提取职责片段

扫描参与者、基本事件流、备选流、异常流、前置条件、后置条件和业务规则，将相关描述整理为“触发条件 + 业务动作 + 业务对象 + 结果”，并保留原始依据。

### 2. 识别抽象职责

识别业务边界内部必须对结果负责的职责。按业务目标、决策权、执行权和责任结果命名，不直接采用现实岗位名或 `CronJob`、消息消费者、工作流引擎、数据库表等技术实现名称。

外部参与者、外部系统、纯被动接收者和缺乏独立责任结果的临时动作不作为业务工人。

### 3. 合并与拆分

- 业务目标、决策边界和结果责任相同的职责合并为同一个业务工人。
- 仅执行顺序、执行人员或自动化程度不同，不拆分业务工人。
- 业务目标、决策权或结果责任不同，拆分为不同业务工人。
- 无法确定时记录待澄清问题，不自行选择现实组织方案。

### 4. 识别实现方式

为每个业务工人分别描述：

- **人主动介入**：介入条件、决策权限和处理结果。
- **自动化策略**：触发条件、执行规则、自动结果和失败或升级路径。

两种方式可以共同实现同一个业务工人。没有材料依据的一类明确写“未识别到”。自动化失败、规则无法判定或出现例外时，检查用例是否规定转为人工介入。

### 5. 回溯与输出

逐项核对业务目标、职责边界、输入、输出、决策点、异常责任和实现方式的用例依据。对照理解**订单履约用例规约案例**与**订单履约业务工人发现案例**，校准抽象层级。

严格按照**业务工人发现输出模板**组织最终内容。模板中的引用块、HTML 注释、格式指导、示例和占位符只用于起草，不得出现在最终输出中。

## 审查清单

- [ ] 每个业务工人都位于业务边界内部，并承担明确业务目标和结果责任。
- [ ] 名称表达业务职责，不是现实人员、岗位、部门或技术组件名称。
- [ ] 系统内部自动动作已经按业务目的检查，没有因自动执行而遗漏。
- [ ] 相同业务目标、决策边界和结果责任已经合并，不同责任没有被错误合并。
- [ ] 每个业务工人都包含业务目标、职责边界、输入、输出、决策点、异常责任和识别依据。
- [ ] 每个业务工人都分别说明人主动介入与自动化策略，没有依据时写“未识别到”。
- [ ] 人主动介入说明介入条件、决策权限和处理结果。
- [ ] 自动化策略说明触发条件、执行规则、自动结果和失败或升级路径。
- [ ] 用例—业务工人职责映射能够回溯到具体步骤、规则或条件。
- [ ] 待澄清问题只涉及职责边界、合并拆分或实现关系；没有问题时写“无”。
- [ ] 最终输出不包含模板说明、注释、格式指导、示例或占位符。
```

- [ ] **Step 5: 配置显式调用元数据**

创建 `skills/discover-workers/agents/openai.yaml`：

```yaml
interface:
  display_name: "Discover Workers"
  short_description: "从业务用例规约中识别职责抽象及人工与自动化实现方式"
  default_prompt: "使用 $discover-workers 从以下业务用例规约中识别业务工人及其实现方式："
policy:
  allow_implicit_invocation: false
```

- [ ] **Step 6: 运行结构验证**

运行：

```bash
python3 /Users/jerry/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/discover-workers
/Users/jerry/.local/bin/skill-up validate skills/discover-workers/evals/eval.yaml
```

预期：两个命令退出码均为 `0`，且不存在 front matter、目录命名、占位脚手架或 eval schema 错误。

- [ ] **Step 7: 运行 GREEN 行为评测**

运行：

```bash
/Users/jerry/.local/bin/skill-up run skills/discover-workers/evals/eval.yaml --iteration 1
```

预期：`identify-fulfillment-workers` 和 `reject-ambiguous-requirement` 均通过。逐条阅读实际输出，确认规则通过不是由模板回显、引用输入中的关键词或其他误判造成。

若任一 case 失败，只针对观察到的失败收紧 `SKILL.md`、模板或规则断言，然后重新运行同一 case；不得扩大到设计范围之外。

- [ ] **Step 8: 运行最终验证**

运行：

```bash
python3 /Users/jerry/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/discover-workers
/Users/jerry/.local/bin/skill-up validate skills/discover-workers/evals/eval.yaml
/Users/jerry/.local/bin/skill-up run skills/discover-workers/evals/eval.yaml --iteration 1
git diff --check
```

检查 `git status --short`，确认根目录的两份参考稿仍然未跟踪，且本次待提交内容只位于 `skills/discover-workers/`。

- [ ] **Step 9: 提交 Skill**

```bash
git add skills/discover-workers/SKILL.md skills/discover-workers/agents/openai.yaml skills/discover-workers/references/worker-template.md skills/discover-workers/references/example-use-case.md skills/discover-workers/references/example-result.md
git commit -m "feat(discover-workers): add worker discovery skill"
```

如果 GREEN 修订同时修改了 Task 1 的 eval 文件，将这些 eval 文件一并暂存到本次提交，并在提交前重新检查 staged diff。

### Task 3: 完成独立审查与交付验证

**Files:**

- Review: `skills/discover-workers/SKILL.md`
- Review: `skills/discover-workers/agents/openai.yaml`
- Review: `skills/discover-workers/references/*.md`
- Review: `skills/discover-workers/evals/eval.yaml`
- Review: `skills/discover-workers/evals/cases/*.yaml`

**Interfaces:**

- Consumes: Task 1 的评测契约和 Task 2 的完整 Skill。
- Produces: 经过规格符合性、内容质量与最终行为验证的可交付 Skill。

- [ ] **Step 1: 审查规格覆盖**

逐项对照设计文档，确认以下内容均能定位到具体文件：显式调用、业务职责抽象、自动动作保留、人主动介入、自动化策略、合并拆分规则、可追溯依据、三类输出和含糊输入拒绝。

- [ ] **Step 2: 审查结构一致性**

逐项核对 `worker-template.md`、`example-result.md`、`SKILL.md` 输出要求和审查清单：

- 必填章节名称及顺序一致。
- 每个业务工人字段一致。
- 人主动介入与自动化策略字段一致。
- 示例不包含模板占位符或 HTML 注释。
- 引用文件全部位于 `references/`，不存在独立 `assets/` 目录。

- [ ] **Step 3: 进行独立行为复核**

使用一个未参与实现的全新 agent，仅提供以下请求和新 Skill：

```text
使用 $discover-workers 分析一个图书借阅用例：读者提交借阅请求；系统验证借阅资格并登记借阅；馆员只在资格信息冲突时作出放行或拒绝决定；借阅到期前系统自动发送提醒，逾期七天后自动冻结新增借阅资格；馆员可以在费用争议解决后恢复资格。请只输出最终结果。
```

确认输出将“资格管理”或等价的职责抽象与馆员岗位分离，同时识别到期提醒、逾期冻结等自动化策略和争议解决后的人工介入。发现偏差时只根据实际输出修订 Skill，并重新运行全部 eval。

- [ ] **Step 4: 运行最终命令并读取完整输出**

```bash
python3 /Users/jerry/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/discover-workers
/Users/jerry/.local/bin/skill-up validate skills/discover-workers/evals/eval.yaml
/Users/jerry/.local/bin/skill-up run skills/discover-workers/evals/eval.yaml --iteration 1
git diff --check d3384c1..HEAD
git status --short
```

只有在全部命令成功、两个 eval case 通过、独立复核符合设计且没有意外文件进入提交时，才报告完成。

- [ ] **Step 5: 修订提交（仅在审查产生修改时）**

如果 Task 3 产生实际修改，创建新提交，不修改已有提交：

```bash
git add skills/discover-workers
git commit -m "fix(discover-workers): align worker abstraction guidance"
```

若没有修改，不创建空提交。
