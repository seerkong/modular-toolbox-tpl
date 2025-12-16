# AI 文档维护指南

本文档介绍如何维护 `docs/ai/` 目录结构，以及文档编写规则。

## 设计原则

### 1. 模块化

- 按主题划分目录：`architecture/`、`framework/`、`modules/`
- 每个模块独立自包含，可单独阅读

### 2. 分形设计

每个目录都采用相同的子目录结构：

```
<topic>/
├── index.md           # 索引和关键速查
├── introduce/         # 概念介绍
│   └── index.md
├── howto/             # 操作指南
│   └── index.md
├── example/           # 代码示例
│   └── index.md
├── rule/              # 规则约束
│   └── index.md
├── misc/              # 杂项补充
│   └── index.md
└── troubleshooting/   # 故障排除
    └── index.md
```

### 3. 渐进式披露

- `index.md` 提供概览和关键速查
- AI 可以在上层级获取关键信息，无需遍历所有子目录
- 需要详情时再深入具体文档

## 目录结构

```
docs/ai/
├── index.md                    # 根入口，关键文档速查
├── MAINTENANCE.md              # 本文档
├── architecture/               # 架构设计
│   ├── index.md
│   ├── introduce/
│   ├── howto/
│   ├── example/
│   ├── rule/
│   ├── misc/
│   └── troubleshooting/
├── framework/                  # 框架开发
│   ├── index.md
│   ├── introduce/
│   ├── howto/
│   ├── example/
│   ├── rule/
│   ├── misc/
│   └── troubleshooting/
└── modules/                    # 业务模块
    ├── Example/
    │   ├── index.md
    │   └── ... (分形结构)
    └── PrepareDbDataTool/
        ├── index.md
        └── ... (分形结构)
```

## 添加新模块文档

当添加新的业务模块时：

1. **创建目录结构**

```bash
mkdir -p docs/ai/modules/<ModuleName>/{introduce,howto,example,rule,misc,troubleshooting}
touch docs/ai/modules/<ModuleName>/index.md
touch docs/ai/modules/<ModuleName>/{introduce,howto,example,rule,misc,troubleshooting}/index.md
```

2. **编写 index.md**

使用以下模板（index.md 仅作文件索引）：

```markdown
# <ModuleName> 模块文档

<一句话描述模块功能>

## 文档列表

| 文档 | 说明 | 何时阅读 |
|------|------|----------|
| [introduce/](./introduce/index.md) | 模块概述 | 了解模块功能时 |
| [howto/](./howto/index.md) | 操作指南 | 使用或开发模块时 |
| [example/](./example/index.md) | 代码示例 | 参考实现细节时 |
| [rule/](./rule/index.md) | 模块规则 | 开发时遵循规范 |
| [misc/](./misc/index.md) | 杂项信息 | 需要补充信息时 |
| [troubleshooting/](./troubleshooting/index.md) | 问题排查 | 遇到问题时 |

## 代码位置

\`\`\`
shared/src/modules/<ModuleName>/
backend/packages/core/src/modules/<ModuleName>/
...
\`\`\`
```

3. **创建具体内容文件**

在各子目录中创建具体的 `.md` 文件（如 `introduce/overview.md`），将详细内容放入这些文件，而非 index.md。

4. **更新根 index.md**

在 `docs/ai/index.md` 的文档导航表格中添加新模块链接。

## 文档编写规则

### RULE-DOC-001: index.md 仅作文件索引 ⚠️ 关键规则

**每个 `index.md` 必须仅作为文件索引**，不得包含具体说明内容。

**正确做法**:
```markdown
# 目录标题

| 文档 | 说明 | 何时阅读 |
|------|------|----------|
| [overview.md](./overview.md) | 概述介绍 | 了解概念时 |
| [details.md](./details.md) | 详细内容 | 深入了解时 |
```

**错误做法**:
```markdown
# 目录标题

## 详细概念说明
这里包含大段解释文字...

## 具体操作步骤
1. 第一步...
2. 第二步...
```

**原因**: index.md 应快速导航到具体文档，不应包含需要阅读的内容。

### RULE-DOC-002: 禁止引用不存在的文件 ⚠️ 关键规则

**所有文件引用必须指向实际存在的文件**。

在添加引用前，必须确认目标文件存在：
```bash
# 验证引用的文件存在
ls docs/ai/architecture/introduce/overview.md
```

**错误示例**:
```markdown
| [three-layer.md](./three-layer.md) | 三层架构 | ...
```
如果 `three-layer.md` 文件不存在，这是严重错误。

**正确做法**: 先创建文件，再添加引用。

### RULE-DOC-003: 使用规范的表格格式

文档列表使用三列表格：

```markdown
| 文档 | 说明 | 何时阅读 |
|------|------|----------|
| [link](./path) | 描述 | 触发条件 |
```

### RULE-DOC-004: 路径引用约定

**同模块内引用**（复制粘贴友好）：
```markdown
参见 [规则](../../rule/index.md)
```

**跨模块引用**（明确来源）：
```markdown
参见 [docs/ai/framework/example/](docs/ai/framework/example/index.md)
```

### RULE-DOC-005: 规则命名规范

规则使用以下格式：`RULE-<SCOPE>-<NUMBER>`

| Scope | 说明 | 示例 |
|-------|------|------|
| ARCH | 架构规则 | RULE-ARCH-001 |
| FE | 前端规则 | RULE-FE-001 |
| BE | 后端规则 | RULE-BE-001 |
| GEN | 通用规则 | RULE-GEN-001 |
| DOC | 文档规则 | RULE-DOC-001 |
| <ModuleName> | 模块规则 | RULE-PDBT-001 |

### RULE-DOC-006: 保持简洁

- 每个子目录的 `index.md` 应控制在合理长度
- 详细内容放在独立文件中
- 代码示例保持精简，展示核心用法

### RULE-DOC-007: 中文为主

文档主体使用中文编写，代码和术语保持英文。

### RULE-DOC-008: 内容与索引分离

当需要添加说明内容时：

1. 创建具体的 `.md` 文件（如 `overview.md`、`details.md`）
2. 在 `index.md` 中添加该文件的引用
3. 将内容写入具体文件，而非 index.md

## 更新文档的时机

### 必须更新

- 添加新模块时
- 添加新规则时
- 发现新的常见问题时
- 架构或框架发生重大变更时

### 建议更新

- 发现更好的示例代码时
- 问题排查经验积累时
- 文档结构优化时

## 文档验证清单

- [ ] 所有 `index.md` 仅包含文件索引，无具体说明内容 (RULE-DOC-001)
- [ ] 所有文件引用指向实际存在的文件 (RULE-DOC-002)
- [ ] 路径引用正确（相对/跨模块）
- [ ] 规则编号唯一且符合命名规范
- [ ] 代码示例可运行
- [ ] 新模块已添加到根 index.md

### 验证脚本

验证所有引用的文件是否存在：

```bash
# 查找所有 .md 文件中的本地链接引用
grep -rh '\[.*\](\./' docs/ai/ | grep -oE '\./[^)]+' | sort -u

# 手动检查每个引用是否指向存在的文件
```

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| v2.1 | 2025-12-20 | 重构 index.md 规则：必须仅作索引，禁止引用不存在的文件 |
| v2.0 | 2025-12-20 | 初始版本，采用分形设计 |
