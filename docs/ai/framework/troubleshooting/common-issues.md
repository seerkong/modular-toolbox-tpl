# 常见问题

开发过程中常见问题的解决方案。

## DI 问题

### 问题：No matching bindings found

**症状**:
```
No matching bindings found for serviceIdentifier: Symbol(xxx)
```

**解决方案**:
1. 检查 manifest.ts 中是否正确创建了服务
2. 确认 ActorMesh 包含该服务
3. 检查 Shell 层是否正确初始化了模块

### 问题：循环依赖

**症状**: 启动时报错提示循环依赖

**解决方案**:
1. 使用延迟注入 `@lazyInject`
2. 重构代码消除循环

## 响应式数据问题

### 问题：React 组件不更新

**症状**: 修改状态后 React 组件不重新渲染

**原因**: 未使用 `useReactiveValue` 订阅

**解决方案**:
```tsx
// 错误
const data = state.data

// 正确
const data = useReactiveValue(() => state.data)
```

### 问题：对象替换后不响应

**症状**: 替换整个对象后 UI 不更新

**原因**: 直接替换破坏了响应式代理

**解决方案**: 使用 `Object.assign` 或逐个属性赋值
```typescript
// 错误
state.user = newUser

// 正确
Object.assign(state.user, newUser)
```

## 后端问题

### 问题：Entity 循环引用

**症状**:
```
ReferenceError: Cannot access 'Entity' before initialization
```

**解决方案**: 参考 [docs/ai/architecture/troubleshooting/common-issues.md](../../architecture/troubleshooting/common-issues.md)

### 问题：DataSource 未初始化

**症状**: 操作数据库时报 DataSource 未初始化

**解决方案**:
1. 确保在使用前调用了 `dataSource.initialize()`
2. 检查初始化是否完成（使用 await）

### 问题：FormData 解析失败

**症状**: 文件上传时无法获取文件内容

**解决方案**:
1. 确保端点类型正确（PostFormData）
2. 使用正确的解析方式获取文件

## 路由问题

### 问题：动态导入失败

**症状**: 路由组件加载失败

**解决方案**:
1. 检查组件路径是否正确
2. 确保组件文件存在且导出正确
3. 检查 Vite 配置中的 alias

### 问题：嵌套路由不工作

**症状**: 子路由无法访问

**解决方案**:
1. 确保父路由有 `<RouterView>` 或 `<Outlet>`
2. 检查路由配置的 children 结构

## 构建问题

### 问题：Vite 路径解析错误

**症状**: 构建时找不到模块

**解决方案**:
1. 检查 vite.config.ts 中的 alias 配置
2. 确保 tsconfig.json 的 paths 与 vite 一致

### 问题：TypeScript 类型错误

**症状**: 构建时大量类型错误

**解决方案**:
1. 运行 `bun run build` 检查具体错误
2. 确保所有接口定义完整
3. 检查导入导出是否正确

## 快速诊断清单

1. **DI 问题**: 检查 manifest.ts 和 ActorMesh
2. **响应式问题**: 检查是否使用了正确的 Hook
3. **实体问题**: 检查循环引用和类型导入
4. **路由问题**: 检查路径和组件导出
5. **构建问题**: 检查 alias 和 paths 配置
