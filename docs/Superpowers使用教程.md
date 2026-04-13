# Superpowers 使用教程

> 项目地址: https://github.com/obra/superpowers
> 作者: Jesse Vincent (Prime Radiant)

---

# 第一部分：官方说明（中文翻译）

以下内容翻译自项目官方 README.md。

---

## Superpowers 是什么？

Superpowers 是一套完整的软件开发工作流程系统，专为你的编程 AI 代理构建，基于一组可组合的 "技能"（Skills）和一些初始指令，确保你的代理正确使用它们。

## 它是如何工作的？

当你启动编程 AI 代理时，它**不会**直接跳入尝试编写代码。相反，它会退一步，通过对话真正理解你想要构建什么。

一旦它从对话中提炼出需求规格，它会以足够短的段落展示给你，让你能够真正阅读和理解。

在你批准设计后，代理会制定一个清晰到连一个热情但品味差、缺乏判断力、没有项目背景、讨厌测试的初级工程师都能遵循的实现计划。它强调真正的红/绿 TDD（测试驱动开发）、YAGNI（你不会需要它）和 DRY（不要重复自己）。

接下来，一旦你说"开始"，它会启动一个**子代理驱动开发**流程，让代理逐个完成每项工程任务，检查和审查它们的工作，然后继续前进。Claude 通常能够自主工作一两个小时，不会偏离你们一起制定的计划。

还有更多内容，但这就是系统的核心。而且因为技能会自动触发，你不需要做任何特别的事情。你的编程 AI 代理只是拥有了超能力。

---

## 安装方法

**注意：** 不同平台的安装方式不同。Claude Code 或 Cursor 有内置插件市场。Codex 和 OpenCode 需要手动设置。

### Claude Code 官方市场

Superpowers 可通过 [官方 Claude 插件市场](https://claude.com/plugins/superpowers) 获取。

从 Claude 市场安装插件：

```bash
/plugin install superpowers@claude-plugins-official
```

### Claude Code（通过插件市场）

在 Claude Code 中，先注册市场：

```bash
/plugin marketplace add obra/superpowers-marketplace
```

然后从这个市场安装插件：

```bash
/plugin install superpowers@superpowers-marketplace
```

### Cursor（通过插件市场）

在 Cursor Agent 聊天中，从市场安装：

```text
/add-plugin superpowers
```

或在插件市场中搜索 "superpowers"。

### Codex

告诉 Codex：

```
Fetch and follow instructions from https://raw.githubusercontent.com/obra/superpowers/refs/heads/main/.codex/INSTALL.md
```

**详细文档：** [docs/README.codex.md](docs/README.codex.md)

### OpenCode

告诉 OpenCode：

```
Fetch and follow instructions from https://raw.githubusercontent.com/obra/superpowers/refs/heads/main/.opencode/INSTALL.md
```

**详细文档：** [docs/README.opencode.md](docs/README.opencode.md)

### GitHub Copilot CLI

```bash
copilot plugin marketplace add obra/superpowers-marketplace
copilot plugin install superpowers@superpowers-marketplace
```

### Gemini CLI

```bash
gemini extensions install https://github.com/obra/superpowers
```

更新：

```bash
gemini extensions update superpowers
```

### 验证安装

在你选择的平台启动新会话，请求一些应该触发技能的内容（例如"帮我规划这个功能"或"我们来调试这个问题"）。代理应该自动调用相关的 superpowers 技能。

---

## 基础工作流程

1. **brainstorming（头脑风暴）** - 在编写代码前激活。通过提问细化粗糙的想法，探索替代方案，分段展示设计以获取验证。保存设计文档。

2. **using-git-worktrees（使用 Git 工作树）** - 在设计批准后激活。在新分支上创建隔离工作空间，运行项目设置，验证干净的测试基线。

3. **writing-plans（编写计划）** - 在设计批准后激活。将工作分解为小任务（每个 2-5 分钟）。每个任务都有精确的文件路径、完整代码、验证步骤。

4. **subagent-driven-development（子代理驱动开发）** 或 **executing-plans（执行计划）** - 在有计划时激活。每个任务派遣一个全新的子代理，进行两阶段审查（规格合规性，然后代码质量），或批量执行并设置人工检查点。

5. **test-driven-development（测试驱动开发）** - 在实现期间激活。强制执行红-绿-重构循环：编写失败测试，观察失败，编写最小代码，观察通过，提交。删除测试前编写的代码。

6. **requesting-code-review（请求代码审查）** - 在任务之间激活。对照计划审查，按严重程度报告问题。关键问题阻塞进度。

7. **finishing-a-development-branch（完成开发分支）** - 在任务完成时激活。验证测试，提供选项（合并/PR/保留/丢弃），清理工作树。

**代理在任何任务前检查相关技能。** 这是强制性的工作流程，不是建议。

---

## 技能库内容

### 测试相关

- **test-driven-development** - 红-绿-重构循环（包含测试反模式参考）

### 调试相关

- **systematic-debugging** - 4 阶段根因流程（包含根因追踪、纵深防御、条件等待技术）
- **verification-before-completion** - 确保真正修复完成

### 协作相关

- **brainstorming** - 苏格拉底式设计细化
- **writing-plans** - 详细实现计划
- **executing-plans** - 带检查点的批量执行
- **dispatching-parallel-agents** - 并发子代理工作流程
- **requesting-code-review** - 审查前检查清单
- **receiving-code-review** - 响应反馈
- **using-git-worktrees** - 并行开发分支
- **finishing-a-development-branch** - 合并/PR 决策工作流程
- **subagent-driven-development** - 快速迭代带两阶段审查（规格合规性，然后代码质量）

### 元技能

- **writing-skills** - 按最佳实践创建新技能（包含测试方法论）
- **using-superpowers** - 技能系统介绍

---

## 哲学

- **测试驱动开发** - 始终先写测试
- **系统化胜过随机** - 流程胜过猜测
- **复杂度降低** - 简洁为首要目标
- **证据胜过声称** - 验证后再宣称成功

了解更多：[Superpowers for Claude Code](https://blog.fsck.com/2025/10/09/superpowers/)

---

## 贡献

技能直接存放在此仓库中。贡献方式：

1. Fork 仓库
2. 为你的技能创建分支
3. 遵循 `writing-skills` 技能创建和测试新技能
4. 提交 PR

查看 `skills/writing-skills/SKILL.md` 获取完整指南。

---

## 更新

更新插件时技能自动更新：

```bash
/plugin update superpowers
```

---

## 许可证

MIT 许可证 - 查看 LICENSE 文件获取详情。

---

## 社区

Superpowers 由 [Jesse Vincent](https://blog.fsck.com) 和 [Prime Radiant](https://primeradiant.com) 的其他成员构建。

- **Discord**：[加入我们](https://discord.gg/35wsABTejz) 获取社区支持、问题和分享你用 Superpowers 构建的内容
- **Issues**：https://github.com/obra/superpowers/issues
- **发布公告**：[注册](https://primeradiant.com/superpowers/) 获取新版本通知

---

# 第二部分：技能触发机制详解

理解技能如何触发是使用 Superpowers 的关键。以下是详细说明。

---

## 1. 自动触发原理

Superpowers 技能通过 **description 字段** 定义触发条件。AI 在收到用户消息后，会：

```
用户消息 → AI 检查所有技能的 description → 匹配则调用 Skill 工具 → 加载完整技能内容 → 执行
```

**关键**：description 只描述"何时使用"，不描述"如何使用"。

这是为了避免 AI 只读 description 而跳过完整技能内容。例如：

- ❌ 错误：description 包含工作流程摘要 → AI 可能只读 description 就执行，遗漏细节
- ✅ 正确：description 只描述触发条件 → AI 必须加载完整技能内容才能知道如何执行

---

## 2. 触发条件示例

以下是各技能的 description 字段（触发条件）：

| 技能 | description（原文） | 触发场景 |
|-----|---------------------|---------|
| brainstorming | "Use this before any creative work - creating features, building components, adding functionality, or modifying behavior" | 你说"添加登录功能"、"做一个用户列表"、"帮我设计一个 API" |
| systematic-debugging | "Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes" | 你说"测试失败了"、"有个 bug"、"报错了"、"行为异常" |
| test-driven-development | "Use when implementing any feature or bugfix, before writing implementation code" | AI 准备写代码时（任何功能或 bug 修复） |
| verification-before-completion | "Use when about to claim work is complete, fixed, or passing, before committing or creating PRs" | AI 准备说"完成了"、"修复好了"、"测试通过"时 |
| writing-plans | "Use when you have a spec or requirements for a multi-step task, before touching code" | 有设计文档或需求，准备实现多步骤任务 |
| subagent-driven-development | "Use when executing implementation plans with independent tasks in the current session" | 有实现计划，任务相对独立 |
| using-git-worktrees | "Use when starting feature work that needs isolation from current workspace or before executing implementation plans" | 开始功能开发需要隔离工作空间 |
| finishing-a-development-branch | "Use when implementation is complete, all tests pass, and you need to decide how to integrate the work" | 实现完成，测试通过，准备合并或创建 PR |
| requesting-code-review | "Use when completing tasks, implementing major features, or before merging to verify work meets requirements" | 完成任务、实现主要功能、准备合并 |
| writing-skills | "Use when creating new skills, editing existing skills, or verifying skills work before deployment" | 创建新技能、编辑现有技能 |

---

## 3. 实际触发过程详解

### 场景一：你说"帮我添加一个用户认证功能"

```
步骤 1: AI 收到消息 "添加用户认证功能"
步骤 2: AI 检查技能列表中的所有 description
步骤 3: brainstorming 的 description 匹配 "creative work / creating features"
步骤 4: AI 必须调用 Skill 工具 → 加载 brainstorming/SKILL.md 的完整内容
步骤 5: AI 执行技能内容：
        - 先探索项目上下文（文件、文档、最近提交）
        - 逐一提问细化需求（不能直接写代码）
        - 提出 2-3 种方案
        - 分段展示设计，获取批准
        - 编写设计文档
        - 用户批准后才进入下一阶段

<HARD-GATE>
AI 不得在设计批准前编写任何代码。
这适用于所有项目，无论看起来多么简单。
</HARD-GATE>
```

### 场景二：你说"这个测试报错了"

```
步骤 1: AI 收到消息 "测试报错"
步骤 2: AI 检查技能列表中的所有 description
步骤 3: systematic-debugging 的 description 匹配 "test failure, unexpected behavior"
步骤 4: AI 必须调用 Skill 工具 → 加载 systematic-debugging/SKILL.md 的完整内容
步骤 5: AI 执行四阶段流程：

        阶段 1: 根因调查
        - 仔细阅读错误信息
        - 一致复现问题
        - 检查最近变更
        - 多组件系统：每层添加诊断日志
        - 追踪数据流向后追溯

        阶段 2: 模式分析
        - 找到工作示例
        - 完整阅读参考实现
        - 识别差异

        阶段 3: 假设与测试
        - 形成单一假设："我认为 X 是根因，因为 Y"
        - 最小化测试验证
        - 验证后继续，失败则新假设

        阶段 4: 实现
        - 创建失败测试案例
        - 实现单一修复
        - 验证修复
        - 如修复失败 ≥ 3 次 → 质疑架构

铁律：没有根因调查，就不提出修复
```

### 场景三：AI 准备说"完成了"

```
步骤 1: AI 准备声称工作完成
步骤 2: AI 检查技能列表中的所有 description
步骤 3: verification-before-completion 的 description 匹配 "about to claim work is complete"
步骤 4: AI 必须先执行验证：

        1. 确定：什么命令证明此声称？
        2. 运行：执行完整命令（全新、完整）
        3. 阅读：完整输出，检查退出码，计数失败
        4. 验证：输出是否确认声称？
        5. 只有此时：才能做出声称

铁律：没有新鲜验证证据，就不声称完成
```

---

## 4. 强制触发规则

技能系统有一个**铁律**（定义在 `using-superpowers` 技能中）：

```
即使只有 1% 的可能性技能适用，也必须调用。
如果技能适用，你没有选择。你必须使用它。

这是不可协商的。这不是可选的。你不能合理化逃避它。
```

这意味着：

| 你可能的想法 | 正确做法 |
|-------------|---------|
| "这问题很简单，不需要技能" | 简单问题也有正确流程。检查技能。 |
| "我需要先了解更多上下文" | 技能检查在澄清问题之前。 |
| "先快速探索代码库" | 技能告诉你如何探索。先检查技能。 |
| "这不需要正式技能" | 如果存在技能，就使用它。 |
| "我记得这个技能怎么用" | 技能会演变。阅读当前版本。 |

---

## 5. 触发优先级

当多个技能可能同时触发时，按以下顺序处理：

```
1. 流程技能优先（brainstorming、debugging）
   → 这些技能决定"如何处理任务"

2. 实现技能其次（TDD、frontend-design）
   → 这些技能指导"如何执行"

例子：
"添加功能且有 bug" → 先触发 systematic-debugging 处理 bug → 再触发 brainstorming 设计功能
"实现计划中的代码" → 先触发 writing-plans 制定计划 → 再触发 TDD 实现每个任务
```

---

## 6. 技能类型

技能分为两种类型：

### 刚性技能（必须精确遵循）

- **test-driven-development** - 红-绿-重构循环必须完整执行
- **systematic-debugging** - 四阶段流程必须按顺序完成
- **verification-before-completion** - 验证门控必须通过

**特点**：不得跳过步骤，不得"适应"流程

### 灵活技能（根据上下文调整）

- **brainstorming** - 提问方式可以适应项目
- **patterns** - 模式可以根据具体情况调整

**特点**：核心原则不变，但具体执行可以灵活

---

## 7. 你需要做什么？

**作为用户，你不需要手动触发技能。** 技能会根据你的请求自动触发。

但你可以**显式请求**某技能，让触发更精准：

```
"使用 brainstorming 帮我规划这个功能"
"用 systematic-debugging 调试这个问题"
"按 TDD 流程实现这个功能"
"执行 subagent-driven-development 来完成这个计划"
```

你也可以**在对话中提及关键词**来触发技能：

```
"帮我设计..." → 触发 brainstorming
"有个 bug..." → 触发 systematic-debugging
"测试失败了..." → 触发 systematic-debugging
"实现这个功能..." → 触发 TDD
"合并这个分支..." → 触发 finishing-a-development-branch
```

---

## 8. 技能不会触发的场景

有些情况下技能不会触发：

| 场景 | 原因 |
|-----|------|
| 纯信息查询 "这个函数做什么？" | 不涉及实现或调试 |
| 阅读代码 "帮我解释这段代码" | 不涉及实现或调试 |
| 简单文件操作 "删除这个文件" | 不涉及实现或调试 |
| 已完成的任务讨论 | 不需要新的流程 |

---

## 9. 触发流程图

```
用户消息到达
    │
    ▼
检查所有技能的 description
    │
    ▼
任何技能可能适用？（即使只有 1%）
    │
    ├─ 否 → 直接响应（包括澄清问题）
    │
    └─ 是 → 调用 Skill 工具
              │
              ▼
         加载完整技能内容
              │
              ▼
         宣布："正在使用 [技能名] 来 [目的]"
              │
              ▼
         技能是否有检查清单？
              │
              ├─ 是 → 为每个清单项创建 TodoWrite 任务
              │
              └─ 否 → 直接执行
              │
              ▼
         精确执行技能内容
```

---

# 第三部分：技能详解

以下是各技能的详细说明。

---

## 3.1 Brainstorming（头脑风暴）

**触发条件**: 在任何创意工作之前 - 创建功能、构建组件、添加新特性或修改行为。

**核心原则**: **不得在设计获批前编写任何代码。**

**流程步骤**:

1. **探索项目上下文** - 检查文件、文档、最近提交
2. **提供视觉辅助**（可选）- 如涉及视觉问题，可使用浏览器展示原型
3. **逐一提问** - 理解目的、约束、成功标准
4. **提出 2-3 种方案** - 分析优劣，给出推荐
5. **分段展示设计** - 每段获批后再继续
6. **编写设计文档** - 保存至 `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`
7. **设计自查** - 检查占位符、矛盾、歧义
8. **用户审阅文档** - 确认后才进入实现阶段
9. **转向实现计划** - 调用 writing-plans 技能

**重要规则**:
- 每次只问一个问题
- 优先使用选择题而非开放式问题
- 坚持执行 YAGNI（你不会需要它）原则
- 回到澄清环节当有疑问时

---

## 3.2 Using Git Worktrees（使用 Git 工作树）

**触发条件**: 当需要隔离工作空间或在执行实现计划之前。

**作用**: 在独立分支上创建隔离的工作环境，避免污染主分支。

**工作流程**:
```
创建 Worktree → 运行项目初始化 → 验证测试基线 → 开始开发
```

---

## 3.3 Writing Plans（编写计划）

**触发条件**: 当有设计文档或需求，准备编写多步骤任务计划时。

**核心原则**: 假设执行者对我们的代码库零了解，品味可疑。记录一切所需信息。

**计划文档结构**:

```markdown
# [功能名称] 实现计划

> **给代理工作者:** 必须使用 superpowers:subagent-driven-development 或 superpowers:executing-plans 来执行此计划。

**目标**: [一句话描述]

**架构**: [2-3 句说明方法]

**技术栈**: [关键技术/库]

---

### 任务 N: [组件名称]

**文件**:
- 创建: `精确路径/文件.py`
- 修改: `精确路径/现有.py:123-145`
- 测试: `tests/精确路径/test.py`

- [ ] **步骤 1: 编写失败测试**
[完整测试代码]

- [ ] **步骤 2: 运行测试确认失败**
运行命令: `pytest tests/path/test.py::test_name -v`
预期: FAIL with "function not defined"

- [ ] **步骤 3: 编写最小实现**
[完整实现代码]

- [ ] **步骤 4: 运行测试确认通过**

- [ ] **步骤 5: 提交**
```

**任务粒度**: 每个步骤是一个动作（2-5 分钟）

**禁止占位符**:
- "TBD", "TODO", "稍后实现"
- "添加适当的错误处理"（无具体代码）
- "类似任务 N"（必须重复代码）

---

## 3.4 Subagent-Driven Development（子代理驱动开发）

**触发条件**: 当有实现计划且任务相对独立时。

**核心优势**:
- 每任务一个全新子代理（无上下文污染）
- 两阶段审查：规格合规 → 代码质量
- 快速迭代

**流程图**:
```
读取计划 → 提取所有任务 → 创建 TodoWrite

┌──────────────────────────────────┐
│         每个任务循环               │
│                                  │
│  派遣实现子代理                    │
│       ↓                          │
│  子代理提问？→ 回答问题            │
│       ↓                          │
│  实现、测试、提交、自查             │
│       ↓                          │
│  派遣规格审查子代理                 │
│       ↓                          │
│  合规？→ 否 → 实现者修复 → 重审     │
│       ↓ 是                       │
│  派遣代码质量审查子代理              │
│       ↓                          │
│  通过？→ 否 → 实现者修复 → 重审     │
│       ↓ 是                       │
│  标记任务完成                      │
└──────────────────────────────────┘

全部完成 → 最终代码审查 → finishing-a-development-branch
```

---

## 3.5 Test-Driven Development（测试驱动开发）

**触发条件**: 实现任何功能或修复 bug，在编写实现代码之前。

**铁律**:
```
没有失败的测试，就不写生产代码
```

**红-绿-重构循环**:

```
RED → 编写失败测试 → 确认失败 → GREEN → 编写最小代码 → 确认通过 → REFACTOR → 清理 → 下一循环
```

**关键步骤**:

1. **RED - 编写失败测试**
   - 一个行为
   - 清晰的名称
   - 真实代码（避免模拟除非必要）

2. **验证 RED - 观察失败**
   - 必须执行测试
   - 确认失败原因正确（功能缺失，非语法错误）

3. **GREEN - 最小代码**
   - 只写通过测试的最简代码
   - 不添加额外功能

4. **验证 GREEN - 观察通过**
   - 测试通过
   - 其他测试仍通过

5. **REFACTOR - 清理**
   - 移除重复
   - 改善命名
   - 提取辅助函数

**常见借口 vs 现实**:

| 借口 | 现实 |
|-----|------|
| "太简单无需测试" | 简单代码也会出错。测试只需 30 秒。 |
| "之后再测试" | 立即通过的测试毫无意义。 |
| "已手动测试" | 手动测试无记录、不可重运行。 |
| "删除 X 小时工作太浪费" | 沉没成本谬误。保留不可信代码是技术债务。 |
| "TDD 是教条主义" | TDD 是务实主义 - 比事后调试更快。 |

---

## 3.6 Systematic Debugging（系统化调试）

**触发条件**: 遇到任何 bug、测试失败或意外行为时，在提出修复方案之前。

**铁律**:
```
没有根因调查，就不提出修复
```

**四阶段流程**:

**阶段 1: 根因调查**

必须完成:
1. 仔细阅读错误信息
2. 一致复现问题
3. 检查最近变更
4. 在多组件系统中收集证据（每层添加日志）
5. 追踪数据流（向后追溯至源头）

**阶段 2: 模式分析**

1. 找到工作示例
2. 对比参考实现（完整阅读）
3. 识别差异
4. 理解依赖

**阶段 3: 假设与测试**

1. 形成单一假设："我认为 X 是根因，因为 Y"
2. 最小化测试
3. 验证后继续

**阶段 4: 实现**

1. 创建失败测试案例
2. 实现单一修复
3. 验证修复
4. 如修复失败 ≥ 3 次 → 质疑架构

**红色警报**:
- "快速修复，稍后调查"
- "试试改 X 看看"
- "多改几处一起测试"
- "跳过测试，手动验证"
- "连续 3 次修复失败"

---

## 3.7 Verification Before Completion（完成前验证）

**触发条件**: 在声称工作完成、修复或通过之前，在提交或创建 PR 之前。

**铁律**:
```
没有新鲜验证证据，就不声称完成
```

**验证门控**:
```
声称前:
1. 确定: 什么命令证明此声称？
2. 运行: 执行完整命令（全新、完整）
3. 阅读: 完整输出，检查退出码，计数失败
4. 验证: 输出是否确认声称？
5. 只有此时: 做出声称
```

**常见失败**:

| 声称 | 需要 | 不充分 |
|-----|------|-------|
| 测试通过 | 测试命令输出: 0 失败 | "应该通过" |
| 构建成功 | 构建命令: 退出 0 | "看起来没问题" |
| Bug 已修复 | 测试原始症状: 通过 | "代码改了，应该好了" |

---

## 3.8 Requesting Code Review（请求代码审查）

**触发条件**: 完成任务、实现主要功能或合并前。

**流程**:
1. 获取 git SHA
2. 派遣 code-reviewer 子代理
3. 根据反馈行动

**审查时机**:
- 强制: 子代理驱动开发中每任务后
- 强制: 完成主要功能后
- 强制: 合并到 main 前
- 可选: 卡住时、重构前、修复复杂 bug 后

---

## 3.9 Finishing a Development Branch（完成开发分支）

**触发条件**: 实现完成，所有测试通过，需要决定如何整合工作。

**流程**:

1. **验证测试** - 测试必须通过才能继续
2. **确定基础分支**
3. **提供四个选项**:

```
实现完成。您想如何处理？

1. 本地合并回 <基础分支>
2. 推送并创建 Pull Request
3. 保留分支原样（稍后处理）
4. 丢弃此工作

选择哪个？
```

4. **执行选择**
5. **清理工作树**（选项 1、4）

---

## 3.10 Writing Skills（编写技能）

**触发条件**: 创建新技能、编辑现有技能或部署前验证技能。

**核心理念**: **编写技能就是应用于流程文档的测试驱动开发。**

**TDD 映射**:

| TDD 概念 | 技能创建 |
|---------|---------|
| 测试案例 | 带子代理的压力场景 |
| 生产代码 | 技能文档 (SKILL.md) |
| 测试失败 (RED) | 无技能时代理违规（基线） |
| 测试通过 (GREEN) | 有技能时代理合规 |
| 重构 | 填补漏洞同时保持合规 |

**SKILL.md 结构**:

```markdown
---
name: Skill-Name-With-Hyphens
description: Use when [特定触发条件和症状]
---

# 技能名称

## 概述
这是什么？核心原则 1-2 句。

## 使用时机
症状和用例列表

## 核心模式（针对技术/模式）
前后代码对比

## 快速参考
扫描常用操作的表格或列表

## 实现
简单模式内联代码
重度参考链接到文件

## 常见错误
什么会出错 + 修复方法

## 实际影响（可选）
具体结果
```

---

# 第四部分：实际使用示例

---

## 示例 1: 开发新功能

```
用户: 我想添加一个用户认证系统

AI: 我正在使用 brainstorming 技能来探索这个需求。

[探索项目上下文]
[提问]: 认证应该支持哪些方式？
  A. 仅邮箱密码
  B. 邮箱密码 + OAuth（Google/GitHub）
  C. 仅 OAuth
  D. 其他

用户: B

AI: [继续提问细化需求...]

[提出 2-3 种方案，推荐其一]

[分段展示设计，逐段获批]

[编写设计文档并提交]

用户: 设计文档看起来不错，开始实现吧

AI: 我正在使用 writing-plans 技能来创建实现计划。

[创建详细计划]

用户: 计划没问题，开始执行

AI: 我正在使用 subagent-driven-development 技能来执行此计划。

[创建 worktree]
[逐任务派遣子代理，审查，修复，完成]

AI: 我正在使用 finishing-a-development-branch 技能来完成此工作。

所有测试通过。您想如何处理？
1. 本地合并
2. 创建 PR
3. 保留分支
4. 丢弃

用户: 2

AI: [创建 PR，清理 worktree]
```

---

## 示例 2: 修复 Bug

```
用户: 表单提交时有时会失败，错误信息是 "Connection timeout"

AI: 我正在使用 systematic-debugging 技能来调试这个问题。

阶段 1: 根因调查
[阅读错误信息]
[复现问题]
[检查最近变更]
[添加诊断日志]

发现: 问题出现在 API 用层，当服务器响应超过 5 秒时超时

阶段 2: 模式分析
[找到工作示例: retryOperation 函数]

阶段 3: 假设与测试
假设: 表单提交缺少重试逻辑

[最小测试验证假设]

阶段 4: 实现
[编写失败测试]
[实现单一修复: 添加重试]
[验证修复]

AI: Bug 已修复，测试通过。
```

---

## 示例 3: 触发验证

```
AI: 代码已经写完了，应该可以正常工作了。

[内部检查：verification-before-completion 技能触发]

AI: 让我先验证一下。

[运行测试命令]
[阅读完整输出]
[确认：12/12 测试通过，退出码 0]

AI: 所有 12 个测试通过，构建成功。代码完成。
```

---

# 第五部分：更新与维护

---

## 更新技能

```bash
/plugin update superpowers
```

---

## 社区支持

- **Discord**: https://discord.gg/35wsABTejz
- **Issues**: https://github.com/obra/superpowers/issues
- **发布公告**: https://primeradiant.com/superpowers/

---

# 第六部分：哲学与原则

---

Superpowers 遵循以下核心哲学:

- **测试驱动开发** - 先写测试，始终如此
- **系统化胜过随机** - 流程胜过猜测
- **复杂度降低** - 简洁为首要目标
- **证据胜过声称** - 验证后再宣称成功

---

# 第七部分：总结

---

Superpowers 将 AI 编程助手从"快速写代码的工具"转变为"可靠的软件工程伙伴"。通过系统化的工作流程和严格的纪律执行，它确保:

- 需求被真正理解而非假设
- 设计经过审批而非事后发现问题
- 代码经过测试而非事后调试
- 工作经过审查而非积累问题

**使用 Superpowers 的关键是信任其流程** - 即使看似"简单"的任务，也遵循完整流程。这正是它避免大多数常见开发问题的方式。

---

**Sources**:
- [Superpowers GitHub](https://github.com/obra/superpowers)
- [Superpowers Blog](https://blog.fsck.com/2025/10/09/superpowers/)