/**
 * 模块化框架核心类型定义
 *
 * 设计原则：
 * 1. Runtime 对象作为统一的依赖容器，包含 config、endpointRoute、actorMesh
 * 2. ActorMesh 是模块化的服务容器，按 infra 和 modules 组织
 * 3. 每个模块定义自己的 ActorMesh 和 Runtime 子集
 * 4. 创建 endpoint 时传入模块的 Runtime 子集，类型安全地访问所需依赖
 * 5. 显式类型定义，不使用自动发现，保证类型友好和重构安全
 */

// ============================================================
// 通用类型
// ============================================================

/**
 * API 响应结构
 */
export interface ApiResponse<T> {
  code: number;
  data?: T;
  message?: string;
}

/**
 * HTTP 处理器上下文
 */
export interface HandlerContext {
  body: any;
  query?: Record<string, unknown>;
  params?: Record<string, string>;
  request: Request;
  setHeader: (key: string, value: string) => void;
  error: (status: number, payload: any) => ApiResponse<any>;
  log?: (message: string) => void;
}

// ============================================================
// 后端端点类型
// ============================================================

export type GetEndpoint = (ctx: HandlerContext) => Promise<ApiResponse<any>>;
export type PostEndpoint = (ctx: HandlerContext) => Promise<ApiResponse<any>>;
export type PutEndpoint = (ctx: HandlerContext) => Promise<ApiResponse<any>>;
export type DeleteEndpoint = (ctx: HandlerContext) => Promise<ApiResponse<any>>;
export type SseEndpoint = (ctx: HandlerContext) => Promise<Response>;
export type WsEndpoint = {
  open?: (ws: any) => void;
  close?: (ws: any) => void;
  message?: (ws: any, message: any) => void;
};

/**
 * 端点路由表 - 按 HTTP 方法分类的端点集合
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

/**
 * 模块端点集合 - 模块创建时返回的端点（部分可选）
 */
export interface ModuleEndpoints {
  getJson?: Record<string, GetEndpoint>;
  post?: Record<string, PostEndpoint>;
  put?: Record<string, PutEndpoint>;
  delete?: Record<string, DeleteEndpoint>;
  formData?: Record<string, PostEndpoint>;
  sse?: Record<string, SseEndpoint>;
  ws?: Record<string, WsEndpoint>;
}

// ============================================================
// 后端配置类型
// ============================================================

/**
 * 后端启动配置 - 框架级配置
 */
export interface BackendBootstrapConfig {
  port: number;
  host?: string;
  cors?: {
    origins: string[];
  };
  // 框架级其他配置...
}

/**
 * 模块配置基础接口
 * 每个模块在此扩展自己的配置
 */
export interface ModulesConfig {
  // 由各模块扩展，例如：
  // Example: ExampleModuleConfig;
  // PrepareDbData: PrepareDbDataModuleConfig;
}

/**
 * 完整的后端配置
 */
export interface BackendConfig extends BackendBootstrapConfig {
  modules: ModulesConfig;
}

// ============================================================
// 后端 ActorMesh 类型
// ============================================================

/**
 * 基础设施 ActorMesh - 框架级服务
 *
 * 包含日志、数据库连接、缓存等基础设施服务
 */
export interface InfraActorMesh {
  logger: {
    info: (message: string, ...args: any[]) => void;
    warn: (message: string, ...args: any[]) => void;
    error: (message: string, ...args: any[]) => void;
    debug: (message: string, ...args: any[]) => void;
  };
  // 可扩展其他基础设施服务：
  // db?: DatabaseConnection;
  // cache?: CacheService;
  // eventBus?: EventBus;
}

/**
 * 模块 ActorMesh 集合
 * 每个模块在此扩展自己的 ActorMesh
 */
export interface ModulesActorMesh {
  // 由各模块扩展，例如：
  // Example: ExampleActorMesh;
  // PrepareDbData: PrepareDbDataActorMesh;
}

/**
 * 完整的后端 ActorMesh
 */
export interface BackendActorMesh {
  infra: InfraActorMesh;
  modules: ModulesActorMesh;
}

// ============================================================
// 后端 Runtime 类型
// ============================================================

/**
 * 完整的后端 Runtime
 *
 * 这是后端应用的核心运行时对象，包含：
 * - config: 完整配置
 * - endpointRoute: 所有端点路由
 * - actorMesh: 所有服务实例
 */
export interface BackendRuntime {
  config: BackendConfig;
  endpointRoute: BackendEndpointRoute;
  actorMesh: BackendActorMesh;
}

/**
 * 模块 Runtime 基础类型
 *
 * 每个模块定义自己的 Runtime 子集，用于类型安全地访问所需依赖
 * 框架传入 BackendRuntime 实例，由于是模块 Runtime 的超集，类型匹配
 *
 * @example
 * ```typescript
 * // 模块定义自己的 Runtime 子集
 * interface ExampleModuleRuntime extends ModuleRuntimeBase {
 *   config: {
 *     modules: {
 *       Example: ExampleModuleConfig;
 *     };
 *   };
 *   actorMesh: {
 *     infra: InfraActorMesh;
 *     modules: {
 *       Example: ExampleActorMesh;
 *     };
 *   };
 * }
 *
 * // 创建 endpoint 时使用模块 Runtime
 * const createGetDemoEndpoint = (runtime: ExampleModuleRuntime): GetEndpoint => {
 *   return async (ctx) => {
 *     const service = runtime.actorMesh.modules.Example.exampleService;
 *     const config = runtime.config.modules.Example;
 *     // ...
 *   };
 * };
 * ```
 */
export interface ModuleRuntimeBase {
  config: {
    modules: Partial<ModulesConfig>;
  };
  actorMesh: {
    infra: InfraActorMesh;
    modules: Partial<ModulesActorMesh>;
  };
}

// ============================================================
// 后端模块 Manifest 类型
// ============================================================

/**
 * 后端模块 Manifest
 *
 * 每个模块必须导出符合此接口的对象，包含：
 * - 模块标识信息
 * - ActorMesh 创建函数
 * - Endpoint 创建函数
 * - 生命周期钩子
 *
 * @template TActorMesh - 模块的 ActorMesh 类型
 * @template TRuntime - 模块的 Runtime 子集类型
 */
export interface BackendModuleManifest<
  TActorMesh = unknown,
  TRuntime extends ModuleRuntimeBase = ModuleRuntimeBase
> {
  /**
   * 模块唯一标识
   * 必须与 ModulesActorMesh 和 ModulesConfig 中的键名一致
   */
  name: string;

  /**
   * 模块版本（可选）
   */
  version?: string;

  /**
   * 模块描述（可选）
   */
  description?: string;

  /**
   * 创建模块的 ActorMesh
   *
   * 在应用启动时调用，用于创建模块内的所有服务实例
   * 返回的 ActorMesh 将被合并到 BackendActorMesh.modules[name]
   *
   * @param runtime - 模块的 Runtime 子集（实际传入完整 BackendRuntime）
   * @returns 模块的 ActorMesh
   */
  createActorMesh: (runtime: TRuntime) => TActorMesh;

  /**
   * 创建模块的端点
   *
   * 在 ActorMesh 创建完成后调用
   * 传入的 runtime 是 BackendRuntime 的实例，但类型约束为模块的 Runtime 子集
   * 这样模块只能访问自己声明需要的依赖，同时保持类型安全
   *
   * @param runtime - 模块的 Runtime 子集（实际传入完整的 BackendRuntime）
   * @returns 模块的端点集合
   */
  createEndpoints: (runtime: TRuntime) => ModuleEndpoints;

  /**
   * 模块初始化钩子（可选）
   *
   * 在所有模块的端点创建完成后调用
   */
  onInit?: (runtime: TRuntime) => Promise<void>;

  /**
   * 模块销毁钩子（可选）
   */
  onDestroy?: () => Promise<void>;
}

// ============================================================
// 前端类型定义
// ============================================================

/**
 * 路由元信息
 */
export interface RouteMeta {
  isMenu?: boolean;
  isRoute?: boolean;
  title?: string;
  icon?: string;
  order?: number;
  permissions?: string[];
  keepAlive?: boolean;
  [key: string]: unknown;
}

/**
 * 路由配置
 */
export interface AppRouteConfig {
  path: string;
  name?: string;
  title?: string;
  component?: string;
  redirect?: string;
  meta?: RouteMeta;
  children?: AppRouteConfig[];
}

/**
 * 菜单项
 */
export interface AppMenuItem {
  key: string;
  title: string;
  icon?: string;
  children?: AppMenuItem[];
  order?: number;
}

// ============================================================
// 前端配置类型
// ============================================================

/**
 * 前端启动配置 - 框架级配置
 */
export interface FrontendBootstrapConfig {
  apiBaseUrl: string;
  // 框架级其他配置...
}

/**
 * 前端模块配置集合
 */
export interface FrontendModulesConfig {
  // 由各模块扩展
}

/**
 * 完整的前端配置
 */
export interface FrontendConfig extends FrontendBootstrapConfig {
  modules: FrontendModulesConfig;
}

// ============================================================
// 前端 ActorMesh 类型
// ============================================================

/**
 * 前端基础设施 ActorMesh
 */
export interface FrontendInfraActorMesh {
  httpClient: {
    get: <T>(url: string, params?: Record<string, unknown>) => Promise<T>;
    post: <T>(url: string, data?: unknown) => Promise<T>;
    put: <T>(url: string, data?: unknown) => Promise<T>;
    delete: <T>(url: string, params?: Record<string, unknown>) => Promise<T>;
  };
  // 可扩展：
  // eventBus?: EventBus;
  // storage?: StorageService;
}

/**
 * 前端模块 ActorMesh 集合
 */
export interface FrontendModulesActorMesh {
  // 由各模块扩展
}

/**
 * 完整的前端 ActorMesh
 */
export interface FrontendActorMesh {
  infra: FrontendInfraActorMesh;
  modules: FrontendModulesActorMesh;
}

// ============================================================
// 前端 Runtime 类型
// ============================================================

/**
 * 前端路由表
 */
export interface FrontendRouteTable {
  routes: AppRouteConfig[];
  menus: AppMenuItem[];
}

/**
 * 完整的前端 Runtime
 */
export interface FrontendRuntime {
  config: FrontendConfig;
  routeTable: FrontendRouteTable;
  actorMesh: FrontendActorMesh;
}

/**
 * 前端模块 Runtime 基础类型
 */
export interface FrontendModuleRuntimeBase {
  config: {
    modules: Partial<FrontendModulesConfig>;
  };
  actorMesh: {
    infra: FrontendInfraActorMesh;
    modules: Partial<FrontendModulesActorMesh>;
  };
}

// ============================================================
// 前端模块 Manifest 类型
// ============================================================

/**
 * 前端模块 Manifest
 *
 * @template TActorMesh - 模块的 ActorMesh 类型
 * @template TRuntime - 模块的 Runtime 子集类型
 */
export interface FrontendModuleManifest<
  TActorMesh = unknown,
  TRuntime extends FrontendModuleRuntimeBase = FrontendModuleRuntimeBase
> {
  /**
   * 模块唯一标识
   */
  name: string;

  /**
   * 模块版本（可选）
   */
  version?: string;

  /**
   * 模块描述（可选）
   */
  description?: string;

  /**
   * 路由配置（可选）
   */
  routes?: AppRouteConfig[];

  /**
   * 创建模块的 ActorMesh
   *
   * @param runtime - 模块的 Runtime 子集（实际传入完整 FrontendRuntime）
   * @returns 模块的 ActorMesh
   */
  createActorMesh: (runtime: TRuntime) => TActorMesh;

  /**
   * 模块初始化钩子（可选）
   */
  onInit?: (runtime: TRuntime) => void | Promise<void>;

  /**
   * 模块销毁钩子（可选）
   */
  onDestroy?: () => void | Promise<void>;
}

// ============================================================
// 辅助类型
// ============================================================

/**
 * 提取模块名称类型
 */
export type ModuleName<T extends { name: string }> = T["name"];

/**
 * 深度 Partial 类型
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * 确保类型包含指定键
 */
export type RequireKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;
