# 模块化框架改造方案

## 概述

本方案解决当前框架中模块注册的「散弹式修改」问题，采用 **Runtime + ActorMesh** 模式实现真正的即插即用模块化架构。

## 核心设计

### Runtime 对象

前后端统一使用 Runtime 作为依赖容器：

```typescript
// 后端
interface BackendRuntime {
  config: BackendConfig;           // 配置（含模块配置）
  endpointRoute: BackendEndpointRoute;  // 端点路由表
  actorMesh: BackendActorMesh;     // 服务实例容器
}

// 前端
interface FrontendRuntime {
  config: FrontendConfig;
  routeTable: FrontendRouteTable;
  actorMesh: FrontendActorMesh;
}
```

### ActorMesh 模式

ActorMesh 是模块化的服务容器，按 `infra` 和 `modules` 组织：

```typescript
interface BackendActorMesh {
  infra: InfraActorMesh;     // 基础设施服务（logger, db, cache...）
  modules: {
    Example: ExampleActorMesh;
    PrepareDbData: PrepareDbDataActorMesh;
    // 各模块的服务...
  };
}
```

### 模块 Runtime 子集

每个模块定义自己需要的依赖子集，框架传入完整 Runtime（超集），类型自动兼容。模块在 `createActorMesh` / `createEndpoints` 中统一接收 runtime，endpoint handler 也使用 runtime 取服务与配置：

```typescript
// 模块声明自己需要的依赖
interface ExampleModuleRuntime {
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

// 创建 endpoint 时类型安全地访问
createEndpoints: (runtime: ExampleModuleRuntime) => {
  const service = runtime.actorMesh.modules.Example.exampleService;
  const config = runtime.config.modules.Example;
  // ...
}

// 创建 ActorMesh 时统一从 runtime 取 infra/config
createActorMesh: (runtime: ExampleModuleRuntime) => ({
  exampleService: new ExampleServiceImpl(
    runtime.actorMesh.infra.logger,
    runtime.config.modules.Example
  ),
})
```

## 改造后效果

**新增模块只需修改 1 个文件、1 行代码：**

```typescript
// modules/index.ts
export const allModuleManifests = [
  exampleManifest,
  prepareDbDataManifest,
  newModuleManifest, // ← 只需添加这一行
];
```

## 设计原则

1. **显式类型定义**：不使用自动发现（`import.meta.glob`），保证类型友好和重构安全
2. **Runtime 传递**：createActorMesh / createEndpoints / handler 均接收完整 Runtime，可访问多个 Service 和模块配置
3. **模块隔离**：每个模块定义自己的 ActorMesh 和 Runtime 子集
4. **单点注册**：框架层只需一处注册，解耦模块与框架

## 文件结构

```
openspec/changes/module-manifest-refactor/
├── README.md              # 本文件
├── spec.md               # 详细规范文档
├── types.ts              # 完整类型定义
├── scaffold-template.md  # 模块脚手架模板
└── examples/
    ├── backend-example-manifest.ts   # 后端模块示例
    ├── frontend-example-manifest.ts  # 前端模块示例
    └── registry-implementation.ts    # 注册表实现
```

## 快速上手

1. 阅读 [详细规范](./spec.md)
2. 参考 [后端模块示例](./examples/backend-example-manifest.ts)
3. 参考 [前端模块示例](./examples/frontend-example-manifest.ts)
4. 使用 [模块脚手架模板](./scaffold-template.md) 创建新模块

## 对比总结

| 维度 | 改造前 | 改造后 |
|------|--------|--------|
| 新增模块修改点 | 3-5个文件 | 1个文件，1行代码 |
| 依赖注入 | 单个 Service | 完整 Runtime |
| 类型安全 | 手动维护 | 模块 Runtime 子集自动约束 |
| 自动发现 | — | 不使用（保持类型友好） |
