# 架构规则

必须遵守的架构规则。

## RULE-ARCH-001: 依赖方向

**规则**: 依赖方向必须是单向的

```
Shell → Mediator → Core → Shared
```

**禁止**:
- Core 层导入 Mediator 或 Shell 的代码
- Mediator 层导入 Shell 的代码
- 任何层反向导入

**检查方法**:
- 查看 import 语句，确保不违反依赖方向
- Core 层不应有 `import ... from '@backend/mediator'`
- Mediator 层不应有 `import ... from '@backend/elysia'`

## RULE-ARCH-002: 模块命名

**规则**: 模块使用 PascalCase 命名

**正确**:
- `Example`
- `PrepareDbDataTool`
- `UserManagement`

**错误**:
- `example`
- `prepare-db-data-tool`
- `user_management`

## RULE-ARCH-003: 框架无关性

**规则**: Core 层必须框架无关

**禁止在 Core 层**:
- 导入 Vue、React 相关包
- 导入 Elysia、Express 等 HTTP 框架
- 导入 InversifyJS 等 DI 框架（Mediator 层使用）
- 直接访问 DOM 或浏览器 API

**允许在 Core 层**:
- `@vue/reactivity`（响应式原语，非 Vue 框架）
- 纯 TypeScript/JavaScript 代码
- 自定义契约和接口定义

## RULE-ARCH-004: 实体定义位置

**规则**: TypeORM 实体定义放在 Core 层

实体类使用 Decorator 模式定义在 `backend/packages/core/src/modules/<ModuleName>/entity/`。

DataSource 配置和初始化放在 Mediator 层。

## RULE-ARCH-005: 端点组织

**规则**: 端点按传输类型组织

```
endpoint/
├── GetJson/     # GET 请求返回 JSON
├── PostJson/    # POST 请求接收/返回 JSON
├── PostFormData/  # POST 请求接收 FormData
├── DeleteJson/  # DELETE 请求
├── PutJson/     # PUT 请求
├── SSE/         # Server-Sent Events
└── WS/          # WebSocket
```

每个端点一个文件，工厂函数返回端点定义。
