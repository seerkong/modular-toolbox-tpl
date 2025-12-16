# 开发规则

开发时必须遵守的规则。

## 前端规则

### RULE-FE-001: 禁止浏览器原生弹窗

**规则**: 禁止使用 `alert()`、`confirm()`、`prompt()`

**原因**:
- 阻塞 UI 线程
- 不支持主题样式
- 用户体验差

**替代方案**: 使用自定义 UI 反馈组件

### RULE-FE-002: 按钮主题兼容

**规则**: 按钮必须使用 CSS 类，禁止内联颜色

**正确**:
```html
<button class="button">默认</button>
<button class="button button-active">激活</button>
<button class="button button-danger">危险</button>
```

**错误**:
```html
<button style="background-color: blue;">按钮</button>
```

### RULE-FE-003: React 响应式订阅

**规则**: React 组件必须使用 `useReactiveValue` 订阅响应式数据

**原因**: React 不自动响应 `@vue/reactivity` 的变化

**正确**:
```tsx
const value = useReactiveValue(() => state.someValue)
```

**错误**:
```tsx
const value = state.someValue // 不会响应更新
```

## 后端规则

### RULE-BE-001: 实体定义位置

**规则**: TypeORM 实体使用 Decorator 模式定义在 Core 层

**位置**: `backend/packages/core/src/modules/<ModuleName>/entity/`

### RULE-BE-002: 避免循环引用

**规则**: 实体关系使用字符串引用和类型导入

**正确**:
```typescript
import type { OtherEntity } from './OtherEntity'
import { Relation } from 'typeorm'

@ManyToOne('OtherEntity', (e: OtherEntity) => e.items)
other: Relation<OtherEntity>
```

### RULE-BE-003: 端点工厂模式

**规则**: 端点必须是工厂函数，接收 ActorMesh 参数

**正确**:
```typescript
export function createGetDemoEndpoint(actorMesh: ActorMesh): EndpointRoute {
  return {
    method: 'GET',
    path: '/api/demo',
    handler: async () => actorMesh.service.getDemo(),
  }
}
```

### RULE-BE-004: 实体表名无需前缀

**规则**: TypeORM 实体的物理表名不需要加模块前缀

**原因**: 每个模块独立使用一个数据库

**正确**:
```typescript
@Entity({ name: "table_profiles" })
export class TableProfile { ... }
```

**错误**:
```typescript
@Entity({ name: "mod_pdbt_table_profiles" })
export class TableProfile { ... }
```

### RULE-BE-005: Datasource 路径从配置传入

**规则**: Mediator 层不应读取环境变量或组装数据路径；路径应从 bootstrap config 传入

**正确**:
```typescript
// datasource.ts
export function createDataSource(dbPath: string) {
  return new DataSource({
    type: 'better-sqlite3',
    database: dbPath,
    // ...
  })
}

// Shell 层组装路径
const dbPath = path.join(config.dataDir, 'module.sqlite')
createDataSource(dbPath)
```

**错误**:
```typescript
// datasource.ts 直接读取环境变量
const dbPath = process.env.DATA_DIR + '/module.sqlite'
```

## 通用规则

### RULE-GEN-001: 模块命名

- 模块名: PascalCase（如 `PrepareDbDataTool`）
- 文件名: camelCase 或 PascalCase（与导出内容一致）
- API 路径: kebab-case（如 `/api/prepare-db-data-tool`）

### RULE-GEN-002: 导入顺序

1. 外部包（node_modules）
2. 包别名导入（`@backend/*`, `@frontend/*`）
3. 相对路径导入

### RULE-GEN-003: 类型导入

使用 `import type` 导入仅用于类型的内容，避免运行时依赖。
