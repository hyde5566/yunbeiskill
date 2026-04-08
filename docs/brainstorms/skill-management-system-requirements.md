---
date: 2026-04-06
topic: skill-management-system
---

# 云贝科技 Skill 管理系统

## Problem Frame

公司员工在使用AI Skills时面临三大层面问题：

**缺乏标准**：没有统一的skill命名规范、版本管理规则、安全评估标准

**缺乏控制**：没有审核机制保证skill安全，没有强制或引导机制让员工使用规范skill

**缺乏发现**：skill分散在Claude Code Skills、GitHub/Gist、内部自研多个平台，员工找不到合适的skill

导致的具体痛点：
1. 同一skill不同员工使用版本不统一，未及时关注更新
2. 同名skill太多，分享时容易搞错
3. 部分skill不安全，需要审查后才能批量使用
4. skill平台分散，员工查找困难
5. 每个项目使用过的skill缺乏记录和跟踪

## Requirements

**Skill仓库管理**
- R1. 用户可以浏览skill列表，按分类、来源平台、安全等级筛选
- R2. 用户可以搜索skill，支持名称、描述、作者关键词搜索
- R3. 用户可以查看skill详情，包含版本历史、安全评级、使用说明、下载次数
- R4. 用户可以下载指定版本的skill文件

**版本管理与审核**
- R5. 用户可以提交新skill或为已有skill提交新版本
- R6. 所有skill（内部自研和外部导入）必须经过安全审核才能发布
- R7. 新skill或新版本提交时自动触发安全扫描；审核员查看扫描结果后，批准或拒绝入库
- R8. skill命名采用弱唯一性：允许同名skill，通过"来源平台+作者+名称"组合区分

**安全扫描项**
- S1. 敏感词检测：检测密码、token、api_key、secret等敏感信息泄露
- S2. 外部URL分析：分析外部URL请求，标记可疑域名和非HTTPS链接
- S3. 命令执行检测：检测shell命令执行、系统调用等高风险操作
- S4. 文件操作检测：评估文件读写、删除、权限修改等操作风险
- S5. 扫描结果处理策略：扫描结果仅作参考，审核员综合判断后决定是否入库；高风险项会高亮提醒但不自动拒绝

**用户角色与权限**
- 角色：普通用户、审核员、管理员
- 普通用户：浏览、搜索、下载、订阅、提交skill、注册项目、记录使用
- 审核员：审核skill、查看扫描结果、批准/拒绝入库
- 管理员：用户管理、分类管理、推荐标记、查看统计报表

**用户订阅系统**
- R9. 用户可以订阅关注的skill，选择跟随最新版本或锁定特定版本
- R10. 当订阅的skill有新版本发布时，跟随最新版本的用户登录系统可看到更新提醒；锁定特定版本的用户可查看版本差异提示
- R11. 用户可以在"我的订阅"页面管理订阅列表，查看待更新项

**项目追踪**
- R12. 项目需要在系统中注册（用户可自行注册项目）
- R13. 用户下载skill时可选择关联项目（可选操作）
- R14. 用户可以查看各项目使用的skill列表及版本信息
- R15. 管理员可以查看公司整体skill使用统计报表

**平台集成**
- R16. 系统支持从Claude Code Skills导入官方skill
- R17. 系统支持从GitHub/Gist URL导入外部skill
- R18. 系统支持用户直接上传内部自研skill

## Success Criteria

- 员工能在3分钟内找到需要的skill
- 所有发布的skill都经过安全审核
- 同名skill能通过来源平台+作者清晰区分
- 项目使用的skill版本可追溯查询
- skill更新后订阅用户能看到更新提醒

## Scope Boundaries

- 不做skill自动同步到Claude Code客户端（用户手动下载）
- 不做飞书/邮件通知（仅系统内通知）
- 不做skill在线编辑（仅上传/导入）
- 第一期不做AI推荐算法（仅管理员手动标记推荐）

## Key Decisions

- **统一审核**：内部自研和外部导入skill走相同审核流程，保证一致性
- **弱唯一性命名**：允许同名skill，用来源平台+作者+名称组合区分
- **项目注册制**：项目需注册，但用户可自行注册
- **被动通知**：skill更新时用户登录系统查看提醒，不推送外部消息
- **冷启动策略**：系统上线前预填充初始skill内容，确保用户能找到需要的skill

## Dependencies / Assumptions

- 用户已熟悉skill的基本概念和SKILL.md文件格式
- 公司有人员可担任审核员角色
- 外部平台（Claude/GitHub）API可访问或有导入机制
- 系统内置本地账户认证，独立用户管理

## Outstanding Questions

### Resolve Before Planning
- 无阻塞问题

### Deferred to Planning
- [Affects R16][技术] Claude Code Skills官方目录是否有公开API？
- [Affects R7][技术] GitHub/Gist API导入的技术实现方式？
- [Affects R17][技术] URL导入的SSRF防护和域名白名单策略

## Next Steps

-> /ce:plan for structured implementation planning