# 架构常见问题

架构层面的常见问题及解决方案。

## 问题：循环依赖导致的 ReferenceError

**症状**:
```
ReferenceError: Cannot access 'SomeEntity' before initialization
```

**原因**: TypeORM 实体间相互引用导致循环依赖

**解决方案**:
1. 使用 `import type` 而非直接 import
2. 关系装饰器中使用字符串引用: `@ManyToOne('OtherEntity')`
3. 使用 `Relation<T>` 类型包装

**示例**:
```typescript
// 错误
import { OtherEntity } from './OtherEntity'

// 正确
import type { OtherEntity } from './OtherEntity'
import { Relation } from 'typeorm'

@ManyToOne('OtherEntity', (other: OtherEntity) => other.items)
other: Relation<OtherEntity>
```

## 问题：DI 绑定未找到

**症状**:
```
No matching bindings found for serviceIdentifier: Symbol(xxx)
```

**原因**: 服务未在 DI 容器中注册

**解决方案**:
1. 检查 manifest.ts 中的 createActorMesh 是否正确创建服务
2. 确认服务已添加到返回的 ActorMesh 对象
3. 检查 Shell 层是否正确调用了 manifest 的工厂函数

## 问题：React 组件不响应状态变化

**症状**: 修改响应式状态后，React 组件不更新

**原因**: React 不自动订阅 `@vue/reactivity` 的变化

**解决方案**: 使用 `useReactiveValue` Hook

```tsx
// 错误
const value = state.someValue

// 正确
const value = useReactiveValue(() => state.someValue)
```
