<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# AI Documentation (docs/ai/)

本项目提供了专为 AI 助手设计的分形文档结构，位于 `docs/ai/` 目录。

## 文档结构

```
docs/ai/
├── index.md                    # 根入口（纯索引）
├── MAINTENANCE.md              # 文档维护指南
├── architecture/               # 架构设计（Core-Mediator-Shell 三层）
│   ├── introduce/              # 概念介绍
│   ├── howto/                  # 层级选择指南
│   ├── example/                # 层间交互示例
│   ├── rule/                   # 架构规则 RULE-ARCH-*
│   ├── misc/                   # 导入别名、响应式
│   └── troubleshooting/        # 循环依赖、DI 问题
├── framework/                  # 框架开发指南
│   ├── introduce/layers.md     # 各层详解（Backend/Frontend/Shared）
│   ├── howto/                  # 模块开发流程、主题 UI 开发、主题维护
│   ├── example/                # 代码示例
│   ├── rule/                   # 开发规则 RULE-FE-*/RULE-BE-*/RULE-GEN-*
│   ├── misc/                   # 主题系统、静态资源、项目重命名
│   └── troubleshooting/        # 常见问题解决
└── modules/                    # 业务模块文档
    ├── Example/                # 示例模块
    └── PrepareDbDataTool/      # 数据库数据准备工具
```

## 何时阅读

| 场景 | 入口文档 |
|------|----------|
| 首次接触项目 | `docs/ai/index.md` → `architecture/introduce/overview.md` |
| 添加新模块 | `framework/howto/module-development.md` |
| 开发 UI 组件 | `framework/howto/theme-ui-development.md` |
| 实现文件上传 | `modules/Example/example/file-upload-implementation.md` |
| 理解各层职责 | `framework/introduce/layers.md` |
| 遇到问题 | `framework/troubleshooting/common-issues.md` |
| 理解架构规则 | `architecture/rule/rules.md` |
| 维护主题系统 | `framework/howto/theme-system-maintenance.md` |

## 如何阅读

1. **从 index.md 开始**: 每个目录的 `index.md` 是纯文件索引，列出该目录下所有文档
2. **直接访问内容文件**: 具体内容在独立的 `.md` 文件中（如 `overview.md`, `rules.md`）
3. **分形结构**: 每个目录都有相同的子目录（introduce/howto/example/rule/misc/troubleshooting）
4. **渐进式深入**: 仅在需要详情时进入子目录

## 快速参考

```bash
# 核心文档路径
docs/ai/index.md                                    # 根入口
docs/ai/architecture/introduce/overview.md          # 三层架构概念
docs/ai/framework/introduce/layers.md               # 各层详解（最重要！）
docs/ai/framework/howto/module-development.md       # 模块开发 7 步流程
docs/ai/framework/howto/theme-ui-development.md     # 主题兼容 UI 开发
docs/ai/framework/rule/rules.md                     # 开发规则
docs/ai/framework/troubleshooting/common-issues.md  # 常见问题解决
docs/ai/modules/Example/example/file-upload-implementation.md  # 文件上传完整实现
docs/ai/MAINTENANCE.md                              # 文档维护指南
```

## 关键规则速查

**架构规则**:
- RULE-ARCH-001: 依赖方向 Shell → Mediator → Core → Shared
- RULE-ARCH-003: Core 层必须框架无关

**后端规则**:
- RULE-BE-004: 实体表名无需前缀（每模块独立数据库）
- RULE-BE-005: Datasource 路径从配置传入，Mediator 不读环境变量

**前端规则**:
- RULE-FE-001: 禁止 alert/confirm/prompt
- RULE-FE-003: React 必须使用 `useReactiveValue` 订阅响应式数据

## 与 OpenSpec 的关系

- **docs/ai/**: 框架开发指南，如何写代码
- **openspec/**: 规格驱动开发，如何管理变更提案

两者互补：先阅读 `docs/ai/` 理解框架，再使用 OpenSpec 管理变更。