# 导入别名与响应式

架构相关的补充信息。

## 导入别名约定

### 包级别别名

后端：
- `@backend/core/*`
- `@backend/mediator/*`
- `@backend/elysia-shell/*`

前端：
- `@frontend/core/*`
- `@frontend/mediator/*`
- `@frontend/react/*`
- `@frontend/vue/*`

### 使用建议

- **跨包导入**: 使用别名，如 `import { xxx } from '@frontend/core'`
- **包内导入**: 使用相对路径，保持复制粘贴友好

## 为何 Core 层使用 @vue/reactivity

`@vue/reactivity` 是 Vue 的响应式核心，但它是独立的包，不依赖 Vue 框架。

优点：
- 提供 `reactive()`、`ref()`、`computed()` 等响应式原语
- 可在任何 JavaScript 环境使用
- 前端 Core 层的状态可以被 Vue 和 React 共同使用

注意：
- React 组件需要使用 `useReactiveValue` Hook 订阅响应式数据
- Vue 组件可直接使用响应式数据
