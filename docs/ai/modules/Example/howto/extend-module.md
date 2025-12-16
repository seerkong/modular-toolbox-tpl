# 扩展 Example 模块

如何添加新 API 或修改 UI。

## 添加新 API 端点

### 1. 定义 API 路径

编辑 `shared/src/modules/Example/Api.ts`:

```typescript
export enum ExampleApi {
  GetDemo = '/api/example/demo',
  PostExample = '/api/example/create',
  // 添加新路径
  GetNewEndpoint = '/api/example/new-endpoint',
}
```

### 2. 定义 DTO

编辑 `shared/src/modules/Example/DTO.ts`:

```typescript
export interface NewEndpointResponse {
  data: string
}
```

### 3. 添加服务方法

编辑 `backend/packages/core/src/modules/Example/contract/index.ts`:

```typescript
export interface IExampleService {
  // ...existing methods
  getNewEndpoint(): Promise<NewEndpointResponse>
}
```

### 4. 实现服务方法

编辑 `backend/packages/mediator/src/modules/Example/service/ExampleService.ts`

### 5. 创建端点

创建 `backend/packages/mediator/src/modules/Example/endpoint/GetJson/getNewEndpoint.ts`

### 6. 注册端点

在 `endpoint/GetJson/index.ts` 中导出新端点

### 7. 更新前端 API 客户端

编辑 `frontend/packages/core/src/modules/Example/api/ApiImpl.ts`

## 修改 UI 组件

### Vue 组件位置

`frontend/packages/vue/src/modules/Example/view/`

### React 组件位置

`frontend/packages/react/src/modules/Example/view/`

### 注意事项

1. 使用主题兼容的 CSS 类（参考 [docs/ai/framework/rule/rules.md](../../../framework/rule/rules.md)）
2. React 中使用 `useReactiveValue` 订阅响应式数据
3. 保持 Vue 和 React 实现的功能一致性
