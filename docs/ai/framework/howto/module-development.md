# 模块开发流程

完整的模块开发 7 步流程。

## 第一步：Shared 层 - 定义契约

创建 `shared/src/modules/<ModuleName>/`:
- `Api.ts` - API 路径枚举
- `DTO.ts` - 请求/响应数据类型

```typescript
// Api.ts
export enum ExampleApi {
  GetDemo = '/api/example/demo',
  PostExample = '/api/example/create',
}

// DTO.ts
export interface ExampleResponse {
  message: string
  timestamp: number
}
```

## 第二步：Backend Core - 定义业务

创建 `backend/packages/core/src/modules/<ModuleName>/`:
- `contract/` - 服务接口
- `entity/` - TypeORM 实体
- `runtime/` - 运行时帮助

```typescript
// contract/index.ts
export interface IExampleService {
  getDemo(): Promise<ExampleResponse>
}
```

## 第三步：Backend Mediator - 实现服务

创建 `backend/packages/mediator/src/modules/<ModuleName>/`:
- `service/` - 服务实现
- `endpoint/` - API 端点
- `manifest.ts` - 模块清单

## 第四步：Backend Shell - 注册路由

在 `backend/packages/elysia/src/index.ts` 中注册模块端点。

## 第五步：Frontend Core - 实现客户端

创建 `frontend/packages/core/src/modules/<ModuleName>/`:
- `api/` - API 客户端
- `state/` - 响应式状态
- `contract/` - 类型定义

## 第六步：Frontend Mediator - 实现控制器

创建 `frontend/packages/mediator/src/modules/<ModuleName>/`:
- `controller/` - 控制器
- `manifest.ts` - 模块清单
- `style/index.css` - 模块样式（可选）

如果模块需要自定义样式，创建 `style/index.css` 并在 `modules/styles.css` 中注册：

```css
/* modules/styles.css */
@import "./Example/style/index.css";
@import "./<ModuleName>/style/index.css";  /* 添加新模块 */
```

样式文件使用 CSS 变量确保主题兼容：

```css
/* style/index.css */
.my-module-component {
  background: var(--card);
  border: 1px solid var(--border);
  color: var(--foreground);
}
```

## 第七步：Frontend Shell - 实现 UI

在 `frontend/packages/vue/src/modules/<ModuleName>/` 和
`frontend/packages/react/src/modules/<ModuleName>/` 创建视图组件。

## 开发检查清单

- [ ] Shared: API 枚举和 DTO 已定义
- [ ] Backend Core: 接口和实体已定义
- [ ] Backend Mediator: 服务和端点已实现
- [ ] Backend Shell: 路由已注册
- [ ] Frontend Core: API 客户端和状态已实现
- [ ] Frontend Mediator: 控制器已实现
- [ ] Frontend Mediator: 模块样式已注册（如有）
- [ ] Frontend Shell: UI 组件已实现
- [ ] 测试: 单元测试和集成测试已通过
