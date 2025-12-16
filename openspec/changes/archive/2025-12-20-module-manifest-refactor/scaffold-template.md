# 模块脚手架模板

本文档提供使用 Runtime + ActorMesh 模式创建新模块的完整模板。

**重要约定**：Runtime 类型定义放在 **core package** 的 `contract/Runtime.ts` 文件中。

---

## 1. 后端模块模板

### 1.1 core package - 类型定义

#### core/modules/{ModuleName}/contract/index.ts

```typescript
/**
 * {ModuleName} 服务接口定义
 */
export interface {ModuleName}Service {
  // 服务方法定义
  getList(): Promise<unknown>;
  create(data: unknown): Promise<unknown>;
}
```

#### core/modules/{ModuleName}/contract/Runtime.ts

```typescript
import type { InfraActorMesh } from "@backend/mediator/infra";
import type { {ModuleName}Service } from "./index";

/**
 * {ModuleName} 模块配置
 */
export interface {ModuleName}ModuleConfig {
  // 模块专属配置
}

/**
 * {ModuleName} 模块 ActorMesh
 */
export interface {ModuleName}ActorMesh {
  {moduleName}Service: {ModuleName}Service;
}

/**
 * {ModuleName} 模块 Runtime 子集
 *
 * 框架传入完整的 BackendRuntime，由于是超集，类型兼容
 */
export interface {ModuleName}ModuleRuntime {
  config: {
    modules: {
      {ModuleName}: {ModuleName}ModuleConfig;
    };
  };
  actorMesh: {
    infra: InfraActorMesh;
    modules: {
      {ModuleName}: {ModuleName}ActorMesh;
    };
  };
}
```

#### core/modules/{ModuleName}/index.ts

```typescript
export * from "./contract";
export * from "./contract/Runtime";
```

---

### 1.2 mediator package - 实现

#### mediator/modules/{ModuleName}/manifest.ts

```typescript
import type { BackendModuleManifest, ModuleEndpoints } from "../../infra/types";
import type { GetEndpoint, PostEndpoint } from "../../infra/http";
import type {
  {ModuleName}Service,
  {ModuleName}ActorMesh,
  {ModuleName}ModuleConfig,
  {ModuleName}ModuleRuntime,
} from "@backend/core/modules/{ModuleName}";
import { {ModuleName}ServiceImpl } from "./service/impl";

// ============================================================
// 端点创建函数
// ============================================================

const createGetEndpoints = (
  runtime: {ModuleName}ModuleRuntime
): Record<string, GetEndpoint> => {
  const service = runtime.actorMesh.modules.{ModuleName}.{moduleName}Service;

  return {
    "/api/{module-name}/list": async (ctx) => {
      // 实现
      return { code: 0, data: {} };
    },
  };
};

const createPostEndpoints = (
  runtime: {ModuleName}ModuleRuntime
): Record<string, PostEndpoint> => {
  const service = runtime.actorMesh.modules.{ModuleName}.{moduleName}Service;

  return {
    "/api/{module-name}/create": async (ctx) => {
      // 实现
      return { code: 0, data: {} };
    },
  };
};

// ============================================================
// 模块 Manifest
// ============================================================

export const {moduleName}Manifest: BackendModuleManifest<
  {ModuleName}ActorMesh,
  {ModuleName}ModuleRuntime
> = {
  name: "{ModuleName}",
  version: "1.0.0",
  description: "{ModuleName} 模块",

  createActorMesh: (runtime) => ({
    {moduleName}Service: new {ModuleName}ServiceImpl(
      runtime.actorMesh.infra.logger,
      runtime.config.modules.{ModuleName}
    ),
  }),

  createEndpoints: (runtime): ModuleEndpoints => ({
    getJson: createGetEndpoints(runtime),
    post: createPostEndpoints(runtime),
  }),

  onInit: async (runtime) => {
    runtime.actorMesh.infra.logger.info("[{ModuleName}] Module initialized");
  },
};
```

#### mediator/modules/{ModuleName}/service/impl.ts

```typescript
import type { InfraActorMesh } from "../../../infra/types";
import type { {ModuleName}Service, {ModuleName}ModuleConfig } from "@backend/core/modules/{ModuleName}";

export class {ModuleName}ServiceImpl implements {ModuleName}Service {
  constructor(
    private readonly logger: InfraActorMesh["logger"],
    private readonly config?: {ModuleName}ModuleConfig
  ) {}

  async getList() {
    // 实现
  }

  async create(data: unknown) {
    // 实现
  }
}
```

#### mediator/modules/{ModuleName}/index.ts

```typescript
export { {moduleName}Manifest } from "./manifest";
```

---

## 2. 前端模块模板

### 2.1 core package - 类型定义

#### core/modules/{ModuleName}/contract/Api.ts

```typescript
/**
 * {ModuleName} API 接口定义
 */
export interface {ModuleName}Api {
  getList(): Promise<unknown>;
  create(data: unknown): Promise<unknown>;
}
```

#### core/modules/{ModuleName}/contract/Runtime.ts

```typescript
import type { FrontendInfraActorMesh } from "@frontend/mediator/infra";
import type { {ModuleName}Api } from "./Api";

/**
 * {ModuleName} 前端模块配置
 */
export interface {ModuleName}FrontendConfig {
  // 模块专属配置
}

/**
 * {ModuleName} 前端模块 ActorMesh
 */
export interface {ModuleName}FrontendActorMesh {
  {moduleName}Api: {ModuleName}Api;
}

/**
 * {ModuleName} 前端模块 Runtime 子集
 */
export interface {ModuleName}FrontendRuntime {
  config: {
    modules: {
      {ModuleName}: {ModuleName}FrontendConfig;
    };
  };
  actorMesh: {
    infra: FrontendInfraActorMesh;
    modules: {
      {ModuleName}: {ModuleName}FrontendActorMesh;
    };
  };
}
```

#### core/modules/{ModuleName}/api/ApiImpl.ts

```typescript
import type { FrontendInfraActorMesh } from "@frontend/mediator/infra";
import type { {ModuleName}Api } from "../contract/Api";

export class {ModuleName}ApiImpl implements {ModuleName}Api {
  constructor(
    private readonly httpClient: FrontendInfraActorMesh["httpClient"]
  ) {}

  async getList() {
    return this.httpClient.get("/api/{module-name}/list");
  }

  async create(data: unknown) {
    return this.httpClient.post("/api/{module-name}/create", data);
  }
}
```

#### core/modules/{ModuleName}/index.ts

```typescript
export * from "./contract/Api";
export * from "./contract/Runtime";
export { {ModuleName}ApiImpl } from "./api/ApiImpl";
```

---

### 2.2 mediator package - 实现

#### mediator/modules/{ModuleName}/manifest.ts

```typescript
import type { FrontendModuleManifest, AppRouteConfig } from "../../infra/types";
import type {
  {ModuleName}FrontendActorMesh,
  {ModuleName}FrontendRuntime,
} from "@frontend/core/modules/{ModuleName}";
import { {ModuleName}ApiImpl } from "@frontend/core/modules/{ModuleName}";
import { {moduleName}Routes } from "./router/routes";

export const {moduleName}FrontendManifest: FrontendModuleManifest<
  {ModuleName}FrontendActorMesh,
  {ModuleName}FrontendRuntime
> = {
  name: "{ModuleName}",
  version: "1.0.0",
  description: "{ModuleName} 前端模块",

  routes: {moduleName}Routes,

  createActorMesh: (runtime) => ({
    {moduleName}Api: new {ModuleName}ApiImpl(runtime.actorMesh.infra.httpClient),
  }),

  onInit: (runtime) => {
    console.log("[{ModuleName}] Frontend module initialized");
  },
};
```

#### mediator/modules/{ModuleName}/router/routes.ts

```typescript
import type { AppRouteConfig } from "../../../infra/types";

export const {moduleName}Routes: AppRouteConfig[] = [
  {
    path: "/{module-name}",
    name: "{module-name}-root",
    title: "{ModuleName}",
    component: "layout",
    meta: {
      isMenu: true,
      order: 10,
    },
    children: [
      {
        path: "/{module-name}/list",
        name: "{module-name}-list",
        title: "列表",
        component: "modules/{ModuleName}/view/List",
        meta: { isMenu: true },
      },
    ],
  },
];
```

#### mediator/modules/{ModuleName}/hooks/use{ModuleName}Api.ts

```typescript
import { useRuntime } from "../../../context/RuntimeContext";
import type { {ModuleName}Api } from "@frontend/core/modules/{ModuleName}";

export function use{ModuleName}Api(): {ModuleName}Api {
  const runtime = useRuntime();
  return runtime.actorMesh.modules.{ModuleName}.{moduleName}Api;
}
```

#### mediator/modules/{ModuleName}/view/List.tsx (React)

```tsx
import { useState, useEffect } from "react";
import { use{ModuleName}Api } from "../hooks/use{ModuleName}Api";

export default function {ModuleName}List() {
  const api = use{ModuleName}Api();
  const [data, setData] = useState<unknown>(null);

  useEffect(() => {
    api.getList().then(setData);
  }, []);

  return (
    <div>
      <h1>{ModuleName} List</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
```

#### mediator/modules/{ModuleName}/index.ts

```typescript
export { {moduleName}FrontendManifest } from "./manifest";
```

---

## 3. 注册模块

### 后端 modules/index.ts

```typescript
import type { BackendModuleManifest } from "../infra/types";

import { exampleManifest } from "./Example";
import { prepareDbDataManifest } from "./PrepareDbData";
import { {moduleName}Manifest } from "./{ModuleName}"; // ← 添加

export const allModuleManifests: BackendModuleManifest<any, any>[] = [
  exampleManifest,
  prepareDbDataManifest,
  {moduleName}Manifest, // ← 添加
];
```

### 前端 modules/index.ts

```typescript
import type { FrontendModuleManifest } from "../infra/types";

import { exampleFrontendManifest } from "./Example";
import { prepareDbDataFrontendManifest } from "./PrepareDbData";
import { {moduleName}FrontendManifest } from "./{ModuleName}"; // ← 添加

export const allFrontendManifests: FrontendModuleManifest<any, any>[] = [
  exampleFrontendManifest,
  prepareDbDataFrontendManifest,
  {moduleName}FrontendManifest, // ← 添加
];
```

---

## 4. 变量替换说明

| 占位符 | 说明 | 示例 |
|--------|------|------|
| `{ModuleName}` | PascalCase 模块名 | `UserManagement` |
| `{moduleName}` | camelCase 模块名 | `userManagement` |
| `{module-name}` | kebab-case 模块名 | `user-management` |

---

## 5. 目录结构总览

```
# 后端目录结构

backend/packages/core/src/modules/{ModuleName}/
├── index.ts
└── contract/
    ├── index.ts              # 服务接口定义
    └── Runtime.ts            # ⭐ Runtime 类型定义

backend/packages/mediator/src/modules/{ModuleName}/
├── index.ts                  # 模块统一导出
├── manifest.ts               # Manifest 定义
├── service/
│   └── impl.ts               # 服务实现
└── endpoint/
    ├── GetJson/
    └── PostJson/


# 前端目录结构

frontend/packages/core/src/modules/{ModuleName}/
├── index.ts
├── contract/
│   ├── Api.ts                # API 接口定义
│   └── Runtime.ts            # ⭐ Runtime 类型定义
└── api/
    └── ApiImpl.ts            # API 实现

frontend/packages/mediator/src/modules/{ModuleName}/
├── index.ts                  # 模块统一导出
├── manifest.ts               # Manifest 定义
├── router/
│   └── routes.ts             # 路由配置
├── hooks/
│   └── use{ModuleName}Api.ts # React Hook
└── view/
    ├── List.tsx
    └── Detail.tsx
```

## 6. 关键要点

1. **Runtime 类型定义放在 core package**：`contract/Runtime.ts`
2. **服务接口放在 core package**：`contract/index.ts` (后端) 或 `contract/Api.ts` (前端)
3. **Manifest 和实现放在 mediator package**
4. **从 core 导入类型，在 mediator 使用**
