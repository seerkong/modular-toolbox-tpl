# 三层架构概述

本项目采用 Core-Mediator-Shell 三层架构，加上跨层共享的 Shared 层。

## 架构层次

```
Shell (壳层)
   ↓ 依赖
Mediator (膜层)
   ↓ 依赖
Core (核心层)
   ↓ 依赖
Shared (共享层)
```

## 各层职责

### Shared 层 (`@app/shared`)

- 跨层共享的契约定义
- DTO、常量、枚举
- 无运行时副作用

### Core 层 (`@backend/core`, `@frontend/core`)

- 框架无关的业务逻辑
- 纯函数和契约定义
- 不依赖任何 UI 或服务器框架

### Mediator 层 (`@backend/mediator`, `@frontend/mediator`)

- 技术实现层
- DI 容器、ORM、适配器
- 传输无关

### Shell 层 (`@backend/elysia-shell`, `@frontend/vue`, `@frontend/react`)

- 传输/呈现层
- HTTP 服务器或 UI 框架
- 仅依赖 Mediator 层导出

## 分离关注点

- **业务逻辑** 在 Core 层，与技术选型无关
- **技术实现** 在 Mediator 层，可替换不影响业务
- **呈现/传输** 在 Shell 层，可多端复用业务逻辑

这种设计使得：
- 前端可以同时支持 Vue 和 React
- 后端可以更换传输层（如从 Elysia 迁移到其他框架）
- 测试可以在不启动服务器或 UI 的情况下进行

## 依赖方向

依赖方向严格单向：Shell → Mediator → Core → Shared

**禁止**：
- Core 层导入 Mediator 或 Shell 的代码
- Mediator 层导入 Shell 的代码
- 任何层反向导入

## 关键术语

| 术语 | 英文 | 说明 |
|------|------|------|
| 契约 | Contract | 接口定义，描述"做什么"而非"怎么做" |
| 运行时 | Runtime | 模块运行时状态和依赖的聚合 |
| 演员网格 | ActorMesh | 模块内各服务/controller的实例集合 |
| 端点 | Endpoint | API 接口定义，包含路径、方法、处理函数 |
| 清单 | Manifest | 模块元数据和工厂函数的声明 |
