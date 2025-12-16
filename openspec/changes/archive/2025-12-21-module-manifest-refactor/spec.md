# 模块化框架改造规范

## 1. 问题分析

### 1.1 当前存在的散弹式修改点

| 位置 | 文件路径 | 每次新增模块需要的修改 |
|------|----------|------------------------|
| 后端模块注册 | `backend/packages/mediator/src/index.ts` | 1. 导入服务实现<br>2. 创建服务实例<br>3. 在6-7个endpoints对象中展开handlers |
| 前端路由注册 | `frontend/packages/mediator/src/router/resources.ts` | 导入并展开路由配置 |
| 前端IoC容器 | `frontend/packages/mediator/src/container.ts` | 导入并加载ContainerModule |

### 1.2 原设计的局限性

1. **单一 Service 注入不足**：创建 endpoint 时只传入单个 service，但实际业务常需多个 service 协作
2. **缺少模块配置访问**：endpoint 无法方便地访问模块专属配置
3. **耦合度高**：框架需要知道每个模块的具体导出

---

## 2. 设计目标

### 2.1 核心原则

1. **Runtime 对象**：统一的依赖容器，包含 config、endpointRoute、actorMesh
2. **ActorMesh 模式**：模块化的服务容器，按 infra 和 modules 组织
3. **模块 Runtime 子集**：每个模块定义自己需要的依赖子集，类型安全
4. **显式类型定义**：不使用自动发现，保证类型友好和重构安全
5. **单点注册**：新增模块只需在 `modules/index.ts` 添加一行导入

### 2.2 改造后的效果

**新增模块只需两步：**
1. 在 `modules/` 目录下创建符合规范的模块文件夹
2. 在 `modules/index.ts` 中添加一行导入

```typescript
// modules/index.ts
export const allModuleManifests = [
  exampleManifest,
  prepareDbDataManifest,
  newModuleManifest, // ← 只需添加这一行
];
```

---

## 3. 核心类型定义

### 3.1 后端 Runtime 结构

```typescript
/**
 * 完整的后端 Runtime
 */
export interface BackendRuntime {
  config: BackendConfig;           // 配置（含模块配置）
  endpointRoute: BackendEndpointRoute;  // 端点路由表
  actorMesh: BackendActorMesh;     // 服务实例容器
}

/**
 * 端点路由表
 */
export interface BackendEndpointRoute {
  getJson: Record<string, GetEndpoint>;
  post: Record<string, PostEndpoint>;
  put: Record<string, PutEndpoint>;
  delete: Record<string, DeleteEndpoint>;
  formData: Record<string, PostEndpoint>;
  sse: Record<string, SseEndpoint>;
  ws: Record<string, WsEndpoint>;
}
```

### 3.2 ActorMesh 结构

```typescript
/**
 * 后端 ActorMesh - 模块化服务容器
 */
export interface BackendActorMesh {
  infra: InfraActorMesh;      // 基础设施服务
  modules: ModulesActorMesh;   // 各模块的服务
}

/**
 * 基础设施 ActorMesh
 */
export interface InfraActorMesh {
  logger: {
    info: (message: string, ...args: any[]) => void;
    warn: (message: string, ...args: any[]) => void;
    error: (message: string, ...args: any[]) => void;
    debug: (message: string, ...args: any[]) => void;
  };
  // 可扩展：db, cache, eventBus...
}

/**
 * 模块 ActorMesh 集合（由各模块扩展）
 */
export interface ModulesActorMesh {
  // Example: ExampleActorMesh;
  // PrepareDbData: PrepareDbDataActorMesh;
}
```

### 3.3 配置结构

```typescript
/**
 * 完整的后端配置
 */
export interface BackendConfig extends BackendBootstrapConfig {
  modules: ModulesConfig;
}

/**
 * 模块配置集合（由各模块扩展）
 */
export interface ModulesConfig {
  // Example: ExampleModuleConfig;
  // PrepareDbData: PrepareDbDataModuleConfig;
}
```

### 3.4 模块 Runtime 子集

```typescript
/**
 * 模块定义自己需要的 Runtime 子集
 *
 * 框架传入完整的 BackendRuntime，由于是超集，类型兼容
 */
export interface ExampleModuleRuntime {
  config: {
    modules: {
      Example: ExampleModuleConfig;
    };
  };
  actorMesh: {
    infra: InfraActorMesh;
    modules: {
      Example: ExampleActorMesh;
    };
  };
}
```

---

## 4. 后端模块 Manifest 规范

### 4.1 接口定义

```typescript
export interface BackendModuleManifest<
  TActorMesh = unknown,
  TRuntime extends ModuleRuntimeBase = ModuleRuntimeBase
> {
  name: string;
  version?: string;
  description?: string;

  /**
   * 创建模块的 ActorMesh
   * 返回的对象将被合并到 BackendActorMesh.modules[name]
   */
  createActorMesh: (runtime: TRuntime) => TActorMesh;

  /**
   * 创建模块的端点
   * 传入的 runtime 是完整的 BackendRuntime，但类型约束为模块的 Runtime 子集
   */
  createEndpoints: (runtime: TRuntime) => ModuleEndpoints;

  onInit?: (runtime: TRuntime) => Promise<void>;
  onDestroy?: () => Promise<void>;
}
```

### 4.2 模块实现示例

```typescript
// modules/Example/manifest.ts

// Step 1: 定义模块配置
export interface ExampleModuleConfig {
  maxItems: number;
}

// Step 2: 定义模块 ActorMesh
export interface ExampleActorMesh {
  exampleService: ExampleService;
  cacheService: CacheService;  // 可以有多个服务
}

// Step 3: 定义模块 Runtime 子集
export interface ExampleModuleRuntime {
  config: {
    modules: {
      Example: ExampleModuleConfig;
    };
  };
  actorMesh: {
    infra: InfraActorMesh;
    modules: {
      Example: ExampleActorMesh;
    };
  };
}

// Step 4: 定义 Manifest
export const exampleManifest: BackendModuleManifest<
  ExampleActorMesh,
  ExampleModuleConfig,
  ExampleModuleRuntime
> = {
  name: "Example",

  createActorMesh: (runtime) => ({
    exampleService: new ExampleServiceImpl(runtime.actorMesh.infra.logger, runtime.config.modules.Example),
    cacheService: new CacheServiceImpl(),
  }),

  createEndpoints: (runtime) => {
    // 类型安全地访问模块的服务和配置
    const { exampleService, cacheService } = runtime.actorMesh.modules.Example;
    const config = runtime.config.modules.Example;

    return {
      getJson: {
        "/api/example/demo": async (ctx) => {
          const result = exampleService.getDemo();
          return { code: 0, data: result };
        },
      },
    };
  },
};
```

### 4.3 模块目录结构规范

**重要约定**：模块的 Runtime 类型定义放在 **core package** 的 `contract/Runtime.ts` 文件中，而不是 mediator package。

```
# 后端目录结构

backend/packages/core/src/modules/
└── ModuleName/
    ├── index.ts
    └── contract/
        ├── index.ts              # 服务接口定义
        └── Runtime.ts            # ⭐ 模块 Runtime 类型定义

backend/packages/mediator/src/modules/
└── ModuleName/
    ├── index.ts              # 模块统一导出
    ├── manifest.ts           # 模块 Manifest 定义
    ├── service/              # 服务层实现
    │   └── impl.ts
    └── endpoint/             # 端点定义
        ├── GetJson/
        ├── PostJson/
        └── ...
```

### 4.4 Runtime.ts 文件规范

**位置**：`{backend|frontend}/packages/core/src/modules/{ModuleName}/contract/Runtime.ts`

**职责**：
- 定义模块的 ActorMesh 类型
- 定义模块的配置类型
- 定义模块的 Runtime 子集类型

**后端示例**：

```typescript
// backend/packages/core/src/modules/Example/contract/Runtime.ts

import type { InfraActorMesh } from "@backend/mediator/infra";
import type { ExampleService } from "./index";

/**
 * Example 模块配置
 */
export interface ExampleModuleConfig {
  maxItems: number;
  debug?: boolean;
}

/**
 * Example 模块 ActorMesh
 */
export interface ExampleActorMesh {
  exampleService: ExampleService;
}

/**
 * Example 模块 Runtime 子集
 *
 * 框架传入完整的 BackendRuntime，由于是超集，类型兼容
 */
export interface ExampleModuleRuntime {
  config: {
    modules: {
      Example: ExampleModuleConfig;
    };
  };
  actorMesh: {
    infra: InfraActorMesh;
    modules: {
      Example: ExampleActorMesh;
    };
  };
}
```

**前端示例**：

```typescript
// frontend/packages/core/src/modules/Example/contract/Runtime.ts

import type { FrontendInfraActorMesh } from "@frontend/mediator/infra";
import type { ExampleApi } from "./Api";

/**
 * Example 前端模块配置
 */
export interface ExampleFrontendConfig {
  enableExperimental?: boolean;
}

/**
 * Example 前端模块 ActorMesh
 */
export interface ExampleFrontendActorMesh {
  exampleApi: ExampleApi;
}

/**
 * Example 前端模块 Runtime 子集
 */
export interface ExampleFrontendRuntime {
  config: {
    modules: {
      Example: ExampleFrontendConfig;
    };
  };
  actorMesh: {
    infra: FrontendInfraActorMesh;
    modules: {
      Example: ExampleFrontendActorMesh;
    };
  };
}
```

---

## 5. 前端模块规范

### 5.1 前端 Runtime 结构

```typescript
export interface FrontendRuntime {
  config: FrontendConfig;
  routeTable: FrontendRouteTable;
  actorMesh: FrontendActorMesh;
}

export interface FrontendActorMesh {
  infra: FrontendInfraActorMesh;
  modules: FrontendModulesActorMesh;
}

export interface FrontendInfraActorMesh {
  httpClient: {
    get: <T>(url: string, params?: Record<string, unknown>) => Promise<T>;
    post: <T>(url: string, data?: unknown) => Promise<T>;
    put: <T>(url: string, data?: unknown) => Promise<T>;
    delete: <T>(url: string, params?: Record<string, unknown>) => Promise<T>;
  };
}
```

### 5.2 前端 Manifest 接口

```typescript
export interface FrontendModuleManifest<
  TActorMesh = unknown,
  TRuntime extends FrontendModuleRuntimeBase = FrontendModuleRuntimeBase
> {
  name: string;
  version?: string;
  description?: string;

  routes?: AppRouteConfig[];

  createActorMesh: (runtime: TRuntime) => TActorMesh;

  onInit?: (runtime: TRuntime) => void | Promise<void>;
  onDestroy?: () => void | Promise<void>;
}
```

### 5.3 在组件中使用 Runtime

```typescript
// React: 通过 Context
export function useExampleApi(): ExampleApi {
  const runtime = useRuntime();
  return runtime.actorMesh.modules.Example.exampleApi;
}

// Vue: 通过 provide/inject
const runtime = inject<FrontendRuntime>("runtime")!;
const api = runtime.actorMesh.modules.Example.exampleApi;
```

---

## 6. 框架层注册表

### 6.1 后端注册表

```typescript
export class BackendModuleRegistry {
  private manifests: BackendModuleManifest<any, any>[] = [];

  register(manifest: BackendModuleManifest<any, any>): this;
  registerAll(manifests: BackendModuleManifest<any, any>[]): this;

  /**
   * 构建 Runtime
   *
   * 执行顺序：
   * 1. 创建 InfraActorMesh
   * 2. 创建空的 EndpointRoute
   * 3. 组装完整的 BackendRuntime（含空 ActorMesh）
   * 4. 为每个模块创建 ActorMesh（传入完整 Runtime）
   * 5. 为每个模块创建 Endpoints（传入完整 Runtime）
   * 6. 返回 BackendRuntime
   */
  build(config: BackendConfig): BackendRuntime;

  initAll(): Promise<void>;
  destroyAll(): Promise<void>;
}
```

### 6.2 使用方式

```typescript
// backend/packages/mediator/src/index.ts

import { BackendModuleRegistry } from "./infra/registry";
import { exampleManifest } from "./modules/Example";
import { prepareDbDataManifest } from "./modules/PrepareDbData";

// 显式的模块列表（不使用自动发现）
const allModuleManifests = [
  exampleManifest,
  prepareDbDataManifest,
];

export const createBackendRuntime = (config: BackendConfig): BackendRuntime => {
  const registry = new BackendModuleRegistry();
  registry.registerAll(allModuleManifests);
  return registry.build(config);
};
```

---

## 7. 类型扩展机制

每个模块需要扩展全局的接口：

```typescript
// modules/Example/types.d.ts

import type { ExampleActorMesh, ExampleModuleConfig } from "./manifest";

declare module "../../infra/types" {
  interface ModulesConfig {
    Example: ExampleModuleConfig;
  }

  interface ModulesActorMesh {
    Example: ExampleActorMesh;
  }
}
```

这样可以让 `BackendRuntime` 类型自动包含所有模块的类型信息。

---

## 8. 模块开发流程

### 8.1 新模块开发步骤

**后端模块：**

1. **在 core package 创建模块目录**
   - `backend/packages/core/src/modules/{ModuleName}/contract/index.ts` - 服务接口
   - `backend/packages/core/src/modules/{ModuleName}/contract/Runtime.ts` - Runtime 类型定义 ⭐

2. **在 mediator package 创建模块实现**
   - `backend/packages/mediator/src/modules/{ModuleName}/manifest.ts` - Manifest
   - `backend/packages/mediator/src/modules/{ModuleName}/service/impl.ts` - 服务实现
   - `backend/packages/mediator/src/modules/{ModuleName}/endpoint/` - 端点实现

3. **在入口文件注册**
   - `backend/packages/mediator/src/modules/index.ts`

**前端模块：**

1. **在 core package 创建模块目录**
   - `frontend/packages/core/src/modules/{ModuleName}/contract/Api.ts` - API 接口
   - `frontend/packages/core/src/modules/{ModuleName}/contract/Runtime.ts` - Runtime 类型定义 ⭐
   - `frontend/packages/core/src/modules/{ModuleName}/api/ApiImpl.ts` - API 实现

2. **在 mediator package 创建模块实现**
   - `frontend/packages/mediator/src/modules/{ModuleName}/manifest.ts` - Manifest
   - `frontend/packages/mediator/src/modules/{ModuleName}/router/routes.ts` - 路由配置
   - `frontend/packages/mediator/src/modules/{ModuleName}/view/` - 视图组件

3. **在入口文件注册**
   - `frontend/packages/mediator/src/modules/index.ts`

### 8.2 对已有模块的改造

如果模块已存在但缺少 `contract/Runtime.ts`：

1. **检查是否存在 `contract/Runtime.ts`**
2. **如果不存在**：创建该文件，定义 `{ModuleName}ActorMesh`、`{ModuleName}ModuleConfig`、`{ModuleName}ModuleRuntime`
3. **如果已存在**：按新规范修改，确保包含完整的 Runtime 子集定义

### 8.2 模块迁移流程

当框架升级时：

1. **复制模块文件夹**
2. **检查 Manifest 接口兼容性**
3. **在 `modules/index.ts` 添加一行注册**

---

## 9. 对比总结

| 维度 | 改造前 | 改造后 |
|------|--------|--------|
| 新增模块修改点 | 3-5个文件，多处展开 | 1个文件，1行导入 |
| 依赖注入 | 单个 Service | 完整 Runtime（含多个 Service 和配置） |
| 类型安全 | 手动维护 | 模块 Runtime 子集自动约束 |
| 框架耦合度 | 直接依赖具体模块类 | 只依赖抽象 Manifest 接口 |
| 模块迁移 | 需要修改多处注册代码 | 复制文件夹 + 1行注册 |
| 自动发现 | 不使用 | 不使用（保持类型友好） |

---

## 10. 附录

- [完整类型定义](./types.ts)
- [后端模块示例](./examples/backend-example-manifest.ts)
- [前端模块示例](./examples/frontend-example-manifest.ts)
- [注册表实现](./examples/registry-implementation.ts)
- [模块脚手架模板](./scaffold-template.md)
