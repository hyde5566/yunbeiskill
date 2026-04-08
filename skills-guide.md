# Gstack & Compound Engineering 使用指南

本文档介绍两个核心技能系统的使用方法，帮助你高效完成软件开发工作。

---

## 一、Gstack

**来源**: Garry Tan (Y Combinator CEO)
**定位**: 浏览器自动化 + 工作流编排 + QA测试
**核心理念**: "Boil the Lake" - 完整性优先，AI让边际成本趋近于零

### 1.1 核心技能

| 技能 | 说明 | 使用场景 |
|------|------|----------|
| `/browse` | 浏览器自动化 | 打开网站、截图、表单操作 |
| `/qa` | QA测试 | 站点验证、功能测试、bug捕获 |
| `/qa-only` | 仅报告QA | 测试但不修复，只出报告 |
| `/office-hours` | YC办公时间 | 产品头脑风暴、方向探索 |
| `/review` | PR审查 | 代码审查、质量检查 |
| `/ship` | 发布流程 | 合并、部署、验证一站式 |
| `/land-and-deploy` | 部署流程 | 合并分支、部署、监控 |
| `/canary` | 金丝雀监控 | 发布后监控、问题检测 |
| `/investigate` | 问题调查 | 根因分析、系统调试 |
| `/retro` | 回顾总结 | 周回顾、项目总结 |
| `/learn` | 学习记录 | 记录已解决的问题 |
| `/benchmark` | 性能基准 | 性能回归检测 |
| `/cso` | 安全审计 | OWASP + STRIDE审计 |
| `/autoplan` | 自动规划 | CEO→设计→工程 全流程 |
| `/codex` | 第二意见 | 通过OpenAI获取第二意见 |

### 1.2 规划审查技能

| 技能 | 说明 |
|------|------|
| `/plan-ceo-review` | CEO视角审查计划 |
| `/plan-eng-review` | 工程视角审查计划 |
| `/plan-design-review` | 设计视角审查计划 |
| `/plan-devex-review` | 开发体验审查 |
| `/devex-review` | 开发体验详细审查 |

### 1.3 设计技能

| 技能 | 说明 |
|------|------|
| `/design-review` | 设计审查+修复循环 |
| `/design-consultation` | 从零开始设计系统 |
| `/design-shotgun` | 视觉设计探索 |
| `/design-html` | HTML设计生成 |

### 1.4 工具技能

| 技能 | 说明 |
|------|------|
| `/setup-deploy` | 部署配置初始化 |
| `/setup-browser-cookies` | 浏览器Cookie设置 |
| `/document-release` | 发布后文档更新 |
| `/open-gstack-browser` | 启动GStack浏览器 |

### 1.5 流程控制

| 技能 | 说明 |
|------|------|
| `/careful` | 谨慎模式 |
| `/freeze` | 冻结变更 |
| `/guard` | 保护模式 |
| `/unfreeze` | 解冻 |
| `/gstack-upgrade` | 升级Gstack |

### 1.6 典型工作流

#### 构建新功能
```
/office-hours     → 探索需求、明确方向
/plan-ceo-review  → CEO视角审查方案
/autoplan         → 自动生成完整计划
[实现代码]
/review           → 代码审查
/qa               → QA测试
/ship             → 发布
```

#### 发布后验证
```
/land-and-deploy  → 合并部署
/canary           → 监控验证
/retro            → 回顾总结
```

#### 问题调查
```
/investigate      → 根因分析
[修复问题]
/learn            → 记录解决方案
```

### 1.7 浏览器命令 (browse CLI)

```bash
# 导航
browse goto https://example.com
browse back / forward

# 截图
browse screenshot
browse prettyscreenshot  # 带注释

# 交互
browse click "#submit-btn"
browse fill "#email" "test@example.com"
browse type "#search" "hello"

# 信息获取
browse text              # 页面文本
browse html              # 页面HTML
browse links             # 所有链接
browse snapshot          # DOM快照

# 表单
browse forms             # 列出表单
browse upload "#file" "path/to/file.pdf"

# 网络和控制台
browse network           # 网络请求
browse console           # 控制台日志

# 响应式测试
browse responsive 375x667  # iPhone尺寸
browse viewport 1920 1080  # 设置视口

# 其他
browse wait 3000         # 等待3秒
browse eval "document.title"  # 执行JS
```

---

## 二、Compound Engineering

**来源**: Every Inc (Kieran Klaassen)
**定位**: 复合工程 + 知识沉淀 + 多角色审查
**核心理念**: 知识复利 (Compound Knowledge) - 每个解决的问题都让下一个更简单

### 2.1 核心工作流 (ce:*)

| 技能 | 说明 | 使用场景 |
|------|------|----------|
| `/ce:brainstorm` | 需求探索 | 功能构思、方案讨论 |
| `/ce:ideate` | 创意生成 | 项目改进点子、发散思考 |
| `/ce:plan` | 创建计划 | 多步骤任务、功能实施 |
| `/ce:review` | 代码审查 | PR审查、质量检查 |
| `/ce:work` | 执行工作 | 系统化执行任务项 |
| `/ce:compound` | 知识沉淀 | 文档化已解决的问题 |
| `/ce:compound-refresh` | 刷新知识 | 更新过时的学习内容 |

### 2.2 Git 工作流

| 技能 | 说明 |
|------|------|
| `git-commit` | 创建Git提交 |
| `git-commit-push-pr` | 提交+推送+开PR |
| `git-worktree` | Git工作树管理 |
| `git-clean-gone-branches` | 清理已删除的远程分支 |

### 2.3 开发框架

| 技能 | 说明 |
|------|------|
| `frontend-design` | 前端界面设计 (非AI风格) |
| `dhh-rails-style` | DHH风格的Ruby/Rails代码 |
| `andrew-kane-gem-writer` | Andrew Kane风格的Ruby gem |
| `dspy-ruby` | DSPy.rb框架开发 |
| `agent-native-architecture` | Agent原生应用架构 |

### 2.4 审查代理 (28个)

`/ce:review` 会自动调度以下专业代理：

**代码质量**
- `correctness-reviewer` - 逻辑错误、边界情况
- `maintainability-reviewer` - 耦合、复杂度、命名
- `testing-reviewer` - 测试覆盖、断言强度
- `code-simplicity-reviewer` - 简洁性最终检查

**安全相关**
- `security-reviewer` - 可利用漏洞
- `security-sentinel` - 安全审计
- `data-integrity-guardian` - 数据库迁移安全

**性能相关**
- `performance-reviewer` - 运行时性能
- `performance-oracle` - 性能优化建议

**框架特定**
- `dhh-rails-reviewer` - Rails代码审查
- `kieran-rails-reviewer` - Rails严格审查
- `kieran-typescript-reviewer` - TypeScript审查
- `kieran-python-reviewer` - Python审查

**其他专业**
- `api-contract-reviewer` - API契约变更
- `cli-readiness-reviewer` - CLI代理友好度
- `architecture-strategist` - 架构决策分析
- `reliability-reviewer` - 生产可靠性
- `pattern-recognition-specialist` - 模式识别
- `adversarial-reviewer` - 对抗性审查

### 2.5 文档审查代理 (7个)

`document-review` 技能调用的代理：

| 代理 | 说明 |
|------|------|
| `coherence-reviewer` | 内部一致性、术语漂移 |
| `design-lens-reviewer` | 设计决策完整性 |
| `feasibility-reviewer` | 技术可行性 |
| `product-lens-reviewer` | 产品视角审查 |
| `scope-guardian-reviewer` | 范围控制 |
| `security-lens-reviewer` | 安全视角 |
| `adversarial-document-reviewer` | 对抗性文档审查 |

### 2.6 其他工具技能

| 技能 | 说明 |
|------|------|
| `document-review` | 文档审查 |
| `onboarding` | 生成ONBOARDING.md |
| `reproduce-bug` | Bug复现 |
| `feature-video` | 功能视频录制 |
| `test-browser` | 浏览器测试 |
| `rclone` | 云存储同步 |
| `proof` | 协作文档编辑 |
| `gemini-imagegen` | Gemini图像生成 |
| `todo-resolve` | 批量解决待办 |
| `todo-triage` | 待办分类 |
| `changelog` | 生成变更日志 |

### 2.7 典型工作流

#### 新功能开发
```
/ce:brainstorm   → 探索需求
/ce:plan         → 创建计划
/ce:work         → 执行实现
/ce:review       → 代码审查
/ce:compound     → 知识沉淀
```

#### Bug修复
```
/reproduce-bug   → 复现Bug
[修复代码]
/ce:review       → 审查修复
/ce:compound     → 记录解决方案
```

#### 文档审查
```
/document-review → 多视角文档审查
```

---

## 三、两者配合使用

### 3.1 职责划分

| 场景 | 推荐技能 | 所属系统 |
|------|----------|----------|
| 需求探索 | `/ce:brainstorm` | CE |
| 计划制定 | `/ce:plan` | CE |
| 代码审查 | `/ce:review` | CE |
| 知识沉淀 | `/ce:compound` | CE |
| 浏览器测试 | `/browse` | Gstack |
| QA验证 | `/qa` | Gstack |
| 部署发布 | `/ship` | Gstack |
| 问题调查 | `/investigate` | Gstack |
| 安全审计 | `/cso` | Gstack |

### 3.2 完整开发流程示例

```
# 1. 需求阶段
/ce:brainstorm              # CE: 探索需求
/ce:ideate                  # CE: 创意发散

# 2. 规划阶段
/ce:plan                    # CE: 创建实施计划
/plan-ceo-review            # Gstack: CEO视角审查

# 3. 开发阶段
/ce:work                    # CE: 系统化执行

# 4. 审查阶段
/ce:review                  # CE: 多代理代码审查
/cso                        # Gstack: 安全审计

# 5. 测试阶段
/qa                         # Gstack: QA测试
/browse goto https://...    # Gstack: 浏览器验证

# 6. 发布阶段
/ship                       # Gstack: 一键发布
/canary                     # Gstack: 发布后监控

# 7. 复盘阶段
/retro                      # Gstack: 回顾总结
/ce:compound                # CE: 知识沉淀
```

---

## 四、快速参考

### Gstack 常用命令
```bash
/browse <url>           # 打开网页
/qa <url>               # QA测试
/review                 # 代码审查
/ship                   # 发布
/investigate            # 问题调查
/cso                    # 安全审计
/retro                  # 回顾总结
```

### Compound Engineering 常用命令
```bash
/ce:brainstorm          # 需求探索
/ce:plan                # 创建计划
/ce:review              # 代码审查
/ce:work                # 执行工作
/ce:compound            # 知识沉淀
```

---

## 五、版本信息

| 系统 | 版本 | 来源 |
|------|------|------|
| Gstack | 0.15.13.0 | github.com/garrytan/gstack |
| Compound Engineering | 2.62.1 | github.com/EveryInc/compound-engineering-plugin |

---

*文档生成时间: 2026-04-06*