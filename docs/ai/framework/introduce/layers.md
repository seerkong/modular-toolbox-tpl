# 框架各层详解

框架各个层次的详细介绍。

## 后端层次结构

### Backend Core (`@backend/core`)

**职责**: 业务逻辑和契约定义

**目录结构**:
```
backend/packages/core/src/modules/<ModuleName>/
  index.ts            # 重新导出模块各部分
  contract/           # 服务接口、DTO 帮助函数（复用 @app/shared 类型）
  entity/             # 领域类型（普通类型定义）
  runtime/            # 运行时对象帮助函数（仅存放runtime定义及其最小依赖的纯函数/常量）
  logic/              # 核心业务纯函数（builders/validators/defaults 等）
  helper/             # 可选的额外纯工具函数
```

**目录放置决策**:
- `runtime/` - 定义运行时形态或其最小帮助函数？→ 放这里
- `logic/` 或 `helper/` - 其他业务逻辑、构建器、规范化函数

**实体表名约定**:
> 由于每个模块独立一个数据库，因此在用 TypeORM 定义 entity 时的物理表名**不需要加前缀**。

```typescript
// 正确
@Entity({ name: "table_profiles" })

// 错误
@Entity({ name: "mod_abc_table_profiles" })
```

**禁止导入**: DI 框架、HTTP 框架、ORM 运行时

**最佳实践**:
- 优先使用小型、可组合的接口，使 mediator 实现保持专注
- 在 core 层规范化入站数据（纯函数），保持 mediator/service 代码精简
- 只导入 `@app/shared` 或同级 core 模块
- 存储路径/配置属于 mediator/shell，不属于 core

### Backend Mediator (`@backend/mediator`)

**职责**: 技术实现和依赖注入

**目录结构**:
```
backend/packages/mediator/src/modules/<ModuleName>/
  index.ts
  manifest.ts           # 模块清单（runtime -> actor mesh + endpoints）
  datasource.ts         # 模块数据库连接（sqlite 路径从 bootstrap config 传入）
  service/              # 实现 core 服务接口
  endpoint/             # 按传输类型的 handler 工厂；每个接口单独文件
    GetJson/            # GET JSON 端点（每个 API 一个文件）
    PostJson/           # POST JSON 端点（每个 API 一个文件）
    PostFormData/       # multipart 端点（每个 API 一个文件）
    SSE/                # SSE 端点（每个 API 一个文件）
    WS/                 # WebSocket（如需要）每个 API 一个文件
    index.ts            # 重新导出和按类型组合的工厂
  helper/ (可选)
```

**Infra 帮助函数**:
- `infra/response` - 一致的 `ApiResponse` 形态帮助函数（`ok()`, `fail()`）
- `infra/logging` - 标准化日志
- `infra/sqlite` - SQLite 初始化帮助函数

**HandlerContext**:
Handler 上下文包含以下属性：
- `body` - 请求体
- `query` - GET 请求的查询参数
- `request` - 原始 Request 对象
- `setHeader` - 设置响应头
- `error` - 返回错误响应
- `log` - 日志记录器

**最佳实践**:
- 文件解析（如 multipart）放在端点帮助函数中；传递规范化数据到服务
- 使用 `infra/sqlite` 帮助函数封装数据库初始化
- 避免在一个文件中捆绑多个 API，保持复制粘贴安全

### Backend Shell (`@backend/elysia`, `@backend/koa`)

**职责**: HTTP 传输层

**包含内容**:
- 路由注册
- 中间件配置（CORS、日志）
- 环境变量解析
- 数据目录管理（`dataDir` 解析，env 覆盖 + `AppConstConfig`）
- ready-file 写入
- 端口解析

**路由注册模式**:
```typescript
// 在 src/index.ts 中遍历 runtime.endpointRoute:
app.get(path, adaptGet(handler))     // GET JSON
app.post(path, adaptPost(handler))   // POST JSON/FormData
app.post(path, adaptSse(handler))    // SSE
```

**适配器模式**:
适配器应传递 `body`, `query`, `request`, `setHeader`, `error`, `log` 到 handlers，并应用 CORS/status 默认值。

**Koa 说明**:
- Koa shell 运行在 Node.js，使用 `koa-router` 注册 HTTP 路由，使用 `koa-websocket` 绑定 WS 端点。
- SSE 使用 `ReadableStream` → Node stream 适配并写入响应。

**规则**:
- 不在此处导入 ORM/DI；仅依赖 mediator 导出
- 保持路由键与 shared API 枚举对齐，防止漂移
- 保留 Shell 原语（Bun/Elysia 或 Node/Koa）；避免将框架逻辑重新引入 mediator/core
- 添加新 handler 映射时，镜像现有适配器模式（log start/end、status fallback、CORS merge）

## 前端层次结构

### Frontend Core (`@frontend/core`)

**职责**: 业务逻辑和状态管理

**目录结构**:
```
frontend/packages/core/src/modules/<ModuleName>/
  index.ts            # 重新导出模块各部分
  contract/           # 模块特定共享类型（运行时/配置类型在 core；路由数据/类型在 mediator）
  runtime/            # 基于 contract 的运行时帮助函数
  state/              # 响应式/普通状态持有者
  api/                # API 接口或瘦客户端
  helper/             # 纯工具函数
```

**注意**: 控制器 和 DI 绑定放在 mediator（`frontend/packages/mediator/src/modules/<ModuleName>/`）。

**禁止导入**: Vue、React、DI 框架

**最佳实践**:
- 避免 shell 特定依赖；只依赖共享工具和其他 core 模块，使文件夹可在其他应用中复用
- 保持复制粘贴友好

### Frontend Mediator (`@frontend/mediator`)

**职责**: 控制器和 DI 配置

**目录结构**:
```
frontend/packages/mediator/src/modules/<ModuleName>/
  index.ts
  controller/         # 使用 core contracts/state/runtime 协调模块逻辑的编排类
  container/          # DI 绑定（仅在需要遗留路径时）
  router/             # 模块路由数据（纯 AppRouteConfig[]，使用无扩展名组件路径）
  style/              # 模块特定样式（index.css）
  manifest.ts         # 导出 createActorMesh(runtime) 和可选 routes
```

**模块样式管理**:
- 每个模块在 `style/index.css` 中定义模块特定样式
- 所有模块样式在 `modules/styles.css` 中聚合（模式同 `allFrontendModuleManifests`）
- 主入口 `styles/index.css` 自动导入所有模块样式
- 使用 CSS 变量确保主题兼容

**路由数据管理**:
- 全局路由树在 `frontend/packages/mediator/src/router/resources.ts` 中从模块 manifests 组装
- Shell 直接复用此数据
- **组件路径无扩展名**：Vue 添加 `.vue`，React 尝试解析 `.tsx/.ts/.jsx/.js`

**菜单自动隐藏**:
- 当视图文件不存在时，菜单项自动隐藏
- 没有子项的父菜单会被剪枝
- 使用 `meta.isMenu` / `meta.isRoute` 控制可见性

**DI 绑定规则**:
- 使用清晰的作用域绑定服务（如 `inSingletonScope()` 用于共享 controllers/APIs）

**边界规则**:
- 从 `@frontend/core` 导入 contracts、runtime helpers、state holders 和 APIs；不在此处复制
- 避免 shell 特定依赖；mediator 应保持框架中立，专注于 DI + 编排胶水

### Frontend Shell (`@frontend/vue`, `@frontend/react`)

**职责**: UI 呈现

**目录结构**:
```
frontend/packages/<vue|react>/src/modules/<ModuleName>/
  index.ts            # 导出 { slug, title }（无 routes）
  view/               # 页面组件
  component/          # 可复用 UI 片段
  api/                # 可选，shell 特定 API
  hooks/              # 可选，shell 特定 Hook
  helper/             # 可选，shell 特定帮助函数
  styles/             # 可选，shell 特定样式
```

**注意**: 路由 contracts 在 mediator；不要在此处添加 `router/` 或 `contract/`。

**纯数据路由**:
- 路由配置在 mediator 中保持为纯数据，带无扩展名 `component` 路径
- React router 尝试按 `.tsx/.ts/.jsx/.js` 顺序解析组件
- Vue router 添加 `.vue` 扩展名

**主题/布局对齐**:
- 视图在 `AppLayout` 内渲染
- 复用现有主题类（`theme-crt-amber`, `theme-crt-green`, `theme-e-ink`）
- 复用实用样式类（`card`, `grid`, `table`, `chip`, `button`, `alert` 等）

**运行时访问**:
- 使用 `useFrontendRuntime` 从 `runtime.actorMesh.modules.<ModuleName>` 访问模块 APIs
- 避免在 shells 中直接使用 DI

**验证命令**:
- Vue: `bun run dev:frontend:vue` 本地检查，`bun run build:frontend:vue` 构建验证
- React: `bun run dev:frontend:react` 本地检查，`bun run build:frontend:react` 构建验证

## Shared 层

**职责**: 跨前后端共享的契约

**目录结构**:
```
shared/src/modules/<ModuleName>/
  DTO.ts              # 共享请求/响应和数据传输类型
  Api.ts              # 模块所有端点的枚举。不要导出字符串常量；每个消费者应从枚举读取 URLs
  ConstConfig.ts      # 可选，不可变配置如文件名或键
```

**枚举使用规则**:
- **后端路由映射**应使用枚举值作为键
- **前端 API 客户端**应引用枚举值作为 `url`
- **不要复制字符串字面量**；依赖枚举保持路径对齐

```typescript
// Api.ts 示例
export enum ExampleApi {
  GetDemo = '/api/example/demo',
  PostExample = '/api/example/create',
}

// 后端使用
const handlers = {
  [ExampleApi.GetDemo]: getDemoHandler,
  [ExampleApi.PostExample]: postExampleHandler,
}

// 前端使用
await fetch(ExampleApi.GetDemo)
```

**保持 shared-only 关注点**:
- Shared 模块应保持 UI 无关和框架中立
- 避免导入后端特定库或前端框架
- 限制导入为内置类型和其他 shared 文件
