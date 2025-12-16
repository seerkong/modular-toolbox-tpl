# Change: Module Manifest Refactor

## Why

当前框架中模块注册存在「散弹式修改」问题：新增模块需要修改 3-5 个文件的多处位置。此外，创建 endpoint 时只能传入单个 Service，无法方便地访问多个服务和模块配置。

## What Changes

- 引入 **Runtime + ActorMesh** 模式作为统一的依赖容器
- 定义 **BackendModuleManifest** 和 **FrontendModuleManifest** 接口规范
- 实现 **ModuleRegistry** 用于模块注册和 Runtime 构建
- 模块定义自己的 Runtime 子集，类型安全地访问依赖
- 新增模块只需在 `modules/index.ts` 添加一行导入

## Impact

- Affected specs: `backend-modularity`
- Affected code:
  - `backend/packages/mediator/src/modules/` - 模块 manifest 定义
  - `backend/packages/mediator/src/registry.ts` - 模块注册表
  - `backend/packages/mediator/src/infra/types.ts` - Runtime/ActorMesh 类型
  - `frontend/packages/mediator/src/modules/` - 前端模块 manifest
  - `frontend/packages/mediator/src/registry.ts` - 前端模块注册表
  - `frontend/packages/mediator/src/types.ts` - 前端 Runtime 类型
