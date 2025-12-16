# 层间交互示例

各层之间如何协作的示例。

## 后端请求流程

```
HTTP Request
    ↓
Shell (Elysia Route)
    ↓
Mediator (Endpoint Factory)
    ↓
Mediator (Service)
    ↓
Core (Business Logic)
    ↓
Mediator (DataSource/ORM)
    ↓
Database
```

## 前端数据流程

```
User Interaction
    ↓
Shell (Vue/React Component)
    ↓
Mediator (Controller)
    ↓
Core (State + API Client)
    ↓
HTTP Request to Backend
```

## 模块注册流程

```
1. Core 层定义契约和业务逻辑
2. Mediator 层实现契约，创建 manifest.ts
3. manifest.ts 导出 createActorMesh 和 createEndpoints
4. Shell 层导入 manifest，注册到应用
```
