/**
 * 模块注册表完整实现
 *
 * 负责：
 * 1. 收集所有模块的 Manifest
 * 2. 构建 ActorMesh（先 infra，再 modules）
 * 3. 构建 EndpointRoute
 * 4. 组装完整的 Runtime
 * 5. 管理模块生命周期
 */

import type {
  // 后端类型
  BackendModuleManifest,
  BackendRuntime,
  BackendConfig,
  BackendEndpointRoute,
  BackendActorMesh,
  InfraActorMesh,
  ModulesActorMesh,
  ModuleEndpoints,
  GetEndpoint,
  PostEndpoint,
  PutEndpoint,
  DeleteEndpoint,
  SseEndpoint,
  WsEndpoint,
  // 前端类型
  FrontendModuleManifest,
  FrontendRuntime,
  FrontendConfig,
  FrontendRouteTable,
  FrontendActorMesh,
  FrontendInfraActorMesh,
  FrontendModulesActorMesh,
  AppRouteConfig,
  AppMenuItem,
} from "../types";

// ============================================================
// 后端模块注册表
// ============================================================

/**
 * 后端模块注册表
 *
 * 使用流程：
 * 1. 创建注册表实例
 * 2. 注册所有模块 Manifest
 * 3. 调用 build(config) 构建完整的 BackendRuntime
 * 4. 可选：调用 initAll() 执行模块初始化钩子
 */
export class BackendModuleRegistry {
  private manifests: BackendModuleManifest<any, any>[] = [];
  private runtime: BackendRuntime | null = null;

  /**
   * 注册单个模块
   */
  register<T extends BackendModuleManifest<any, any>>(manifest: T): this {
    this.manifests.push(manifest);
    return this;
  }

  /**
   * 批量注册模块
   */
  registerAll(manifests: BackendModuleManifest<any, any>[]): this {
    this.manifests.push(...manifests);
    return this;
  }

  /**
   * 获取已注册的模块列表
   */
  getModules(): readonly BackendModuleManifest<any, any>[] {
    return this.manifests;
  }

  /**
   * 构建完整的 BackendRuntime
   *
   * 执行顺序：
   * 1. 创建 InfraActorMesh
   * 2. 为每个模块创建 ActorMesh
   * 3. 组装完整的 BackendActorMesh
   * 4. 为每个模块创建 Endpoints
   * 5. 组装完整的 BackendEndpointRoute
   * 6. 返回 BackendRuntime
   */
  build(config: BackendConfig): BackendRuntime {
    // Step 1: 创建基础设施 ActorMesh
    const infraMesh = this.createInfraActorMesh();

    // Step 2: 创建空的 EndpointRoute（先占位，后面填充）
    const endpointRoute: BackendEndpointRoute = {
      getJson: {},
      post: {},
      put: {},
      delete: {},
      formData: {},
      sse: {},
      ws: {},
    };

    // Step 3: 组装 Runtime（此时 endpoints 还是空的）
    const modulesActorMesh: Record<string, unknown> = {};
    const actorMesh: BackendActorMesh = {
      infra: infraMesh,
      modules: modulesActorMesh as ModulesActorMesh,
    };
    const runtime: BackendRuntime = {
      config,
      endpointRoute,
      actorMesh,
    };

    // Step 4: 为每个模块创建 ActorMesh
    for (const manifest of this.manifests) {
      const actorMesh = manifest.createActorMesh(runtime);
      modulesActorMesh[manifest.name] = actorMesh;
    }

    // Step 5: 为每个模块创建 Endpoints（传入完整的 runtime）
    for (const manifest of this.manifests) {
      const endpoints = manifest.createEndpoints(runtime);
      this.mergeEndpoints(endpointRoute, endpoints, manifest.name);
    }

    this.runtime = runtime;
    return runtime;
  }

  /**
   * 初始化所有模块
   */
  async initAll(): Promise<void> {
    if (!this.runtime) {
      throw new Error("Runtime not built. Call build() first.");
    }

    for (const manifest of this.manifests) {
      if (manifest.onInit) {
        try {
          await manifest.onInit(this.runtime);
        } catch (error) {
          console.error(`[${manifest.name}] Initialization failed:`, error);
          throw error;
        }
      }
    }
  }

  /**
   * 销毁所有模块（反向顺序）
   */
  async destroyAll(): Promise<void> {
    for (const manifest of [...this.manifests].reverse()) {
      if (manifest.onDestroy) {
        try {
          await manifest.onDestroy();
        } catch (error) {
          console.error(`[${manifest.name}] Destruction failed:`, error);
        }
      }
    }
    this.runtime = null;
  }

  /**
   * 创建基础设施 ActorMesh
   */
  private createInfraActorMesh(): InfraActorMesh {
    return {
      logger: {
        info: (msg, ...args) => console.log(`[INFO] ${msg}`, ...args),
        warn: (msg, ...args) => console.warn(`[WARN] ${msg}`, ...args),
        error: (msg, ...args) => console.error(`[ERROR] ${msg}`, ...args),
        debug: (msg, ...args) => console.debug(`[DEBUG] ${msg}`, ...args),
      },
      // 可扩展其他基础设施服务
    };
  }

  /**
   * 合并模块端点到全局路由表
   */
  private mergeEndpoints(
    target: BackendEndpointRoute,
    source: ModuleEndpoints,
    moduleName: string
  ): void {
    const merge = <T>(
      targetMap: Record<string, T>,
      sourceMap: Record<string, T> | undefined,
      type: string
    ) => {
      if (!sourceMap) return;
      for (const [path, handler] of Object.entries(sourceMap)) {
        if (path in targetMap) {
          console.warn(
            `[Warning] Endpoint conflict: ${type} "${path}" in module "${moduleName}" overrides existing endpoint`
          );
        }
        targetMap[path] = handler;
      }
    };

    merge(target.getJson, source.getJson, "GET");
    merge(target.post, source.post, "POST");
    merge(target.put, source.put, "PUT");
    merge(target.delete, source.delete, "DELETE");
    merge(target.formData, source.formData, "FormData");
    merge(target.sse, source.sse, "SSE");
    merge(target.ws, source.ws, "WebSocket");
  }
}

// ============================================================
// 前端模块注册表
// ============================================================

/**
 * 前端模块注册表
 */
export class FrontendModuleRegistry {
  private manifests: FrontendModuleManifest<any, any>[] = [];
  private runtime: FrontendRuntime | null = null;

  /**
   * 注册单个模块
   */
  register<T extends FrontendModuleManifest<any, any>>(manifest: T): this {
    this.manifests.push(manifest);
    return this;
  }

  /**
   * 批量注册模块
   */
  registerAll(manifests: FrontendModuleManifest<any, any>[]): this {
    this.manifests.push(...manifests);
    return this;
  }

  /**
   * 获取已注册的模块列表
   */
  getModules(): readonly FrontendModuleManifest<any, any>[] {
    return this.manifests;
  }

  /**
   * 构建完整的 FrontendRuntime
   */
  build(config: FrontendConfig): FrontendRuntime {
    // Step 1: 创建基础设施 ActorMesh
    const infraMesh = this.createInfraActorMesh(config.apiBaseUrl);

    // Step 2: 聚合路由
    const routeTable = this.buildRouteTable();

    // Step 3: 组装 Runtime
    const modulesActorMesh: Record<string, unknown> = {};
    const actorMesh: FrontendActorMesh = {
      infra: infraMesh,
      modules: modulesActorMesh as FrontendModulesActorMesh,
    };
    const runtime: FrontendRuntime = {
      config,
      routeTable,
      actorMesh,
    };

    // Step 4: 为每个模块创建 ActorMesh
    for (const manifest of this.manifests) {
      const actorMesh = manifest.createActorMesh(runtime);
      modulesActorMesh[manifest.name] = actorMesh;
    }

    this.runtime = runtime;
    return runtime;
  }

  /**
   * 初始化所有模块
   */
  async initAll(): Promise<void> {
    if (!this.runtime) {
      throw new Error("Runtime not built. Call build() first.");
    }

    for (const manifest of this.manifests) {
      if (manifest.onInit) {
        try {
          await manifest.onInit(this.runtime);
        } catch (error) {
          console.error(`[${manifest.name}] Initialization failed:`, error);
          throw error;
        }
      }
    }
  }

  /**
   * 销毁所有模块
   */
  async destroyAll(): Promise<void> {
    for (const manifest of [...this.manifests].reverse()) {
      if (manifest.onDestroy) {
        try {
          await manifest.onDestroy();
        } catch (error) {
          console.error(`[${manifest.name}] Destruction failed:`, error);
        }
      }
    }
    this.runtime = null;
  }

  /**
   * 创建基础设施 ActorMesh
   */
  private createInfraActorMesh(apiBaseUrl: string): FrontendInfraActorMesh {
    return {
      httpClient: {
        get: async <T>(url: string, params?: Record<string, unknown>): Promise<T> => {
          const queryString = params
            ? "?" + new URLSearchParams(params as Record<string, string>).toString()
            : "";
          const response = await fetch(`${apiBaseUrl}${url}${queryString}`);
          return response.json();
        },
        post: async <T>(url: string, data?: unknown): Promise<T> => {
          const response = await fetch(`${apiBaseUrl}${url}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          return response.json();
        },
        put: async <T>(url: string, data?: unknown): Promise<T> => {
          const response = await fetch(`${apiBaseUrl}${url}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          return response.json();
        },
        delete: async <T>(url: string, params?: Record<string, unknown>): Promise<T> => {
          const queryString = params
            ? "?" + new URLSearchParams(params as Record<string, string>).toString()
            : "";
          const response = await fetch(`${apiBaseUrl}${url}${queryString}`, {
            method: "DELETE",
          });
          return response.json();
        },
      },
    };
  }

  /**
   * 构建路由表
   */
  private buildRouteTable(): FrontendRouteTable {
    // 收集所有模块的路由
    const allRoutes: AppRouteConfig[] = [];
    for (const manifest of this.manifests) {
      if (manifest.routes) {
        allRoutes.push(...manifest.routes);
      }
    }

    // 按 order 排序
    allRoutes.sort((a, b) => {
      const orderA = a.meta?.order ?? 999;
      const orderB = b.meta?.order ?? 999;
      return orderA - orderB;
    });

    // 生成菜单（简化实现，实际应递归处理）
    const menus: AppMenuItem[] = allRoutes
      .filter((r) => r.meta?.isMenu !== false)
      .map((r) => ({
        key: r.path,
        title: r.title || r.name || r.path,
        icon: r.meta?.icon,
        order: r.meta?.order,
        children: r.children
          ?.filter((c) => c.meta?.isMenu !== false)
          .map((c) => ({
            key: c.path,
            title: c.title || c.name || c.path,
            icon: c.meta?.icon,
            order: c.meta?.order,
          })),
      }));

    return { routes: allRoutes, menus };
  }
}

// ============================================================
// 使用示例
// ============================================================

/*
// ===== 后端使用示例 =====

// 1. 定义模块类型（在模块内部）
interface ExampleModuleConfig {
  maxItems: number;
}

interface ExampleActorMesh {
  exampleService: ExampleService;
}

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

// 2. 定义模块 Manifest
const exampleManifest: BackendModuleManifest<
  ExampleActorMesh,
  ExampleModuleRuntime
> = {
  name: "Example",

  createActorMesh: (runtime) => ({
    exampleService: new ExampleServiceImpl(
      runtime.actorMesh.infra.logger,
      runtime.config.modules.Example
    ),
  }),

  createEndpoints: (runtime) => {
    // runtime 类型是 ExampleModuleRuntime
    // 可以类型安全地访问 runtime.actorMesh.modules.Example
    const service = runtime.actorMesh.modules.Example.exampleService;
    const config = runtime.config.modules.Example;

    return {
      getJson: {
        "/api/example/demo": async (ctx) => {
          const result = service.getDemo();
          return { code: 0, data: result };
        },
      },
    };
  },
};

// 3. 在框架层组装
import { exampleManifest } from "./modules/Example";
import { prepareDbDataManifest } from "./modules/PrepareDbData";

// 显式的模块列表（不使用自动发现）
const allModuleManifests = [
  exampleManifest,
  prepareDbDataManifest,
];

// 构建 Runtime
const registry = new BackendModuleRegistry();
registry.registerAll(allModuleManifests);

const config: BackendConfig = {
  port: 3000,
  modules: {
    Example: { maxItems: 100 },
    PrepareDbData: { dbPath: "./data.db" },
  },
};

const runtime = registry.build(config);

// 可选：执行初始化钩子
await registry.initAll();

// 在 Elysia/Express 中使用
for (const [path, handler] of Object.entries(runtime.endpointRoute.getJson)) {
  app.get(path, adaptGet(handler));
}


// ===== 前端使用示例 =====

// 类似后端，每个模块定义自己的类型和 Manifest
const exampleFrontendManifest: FrontendModuleManifest<
  ExampleFrontendActorMesh,
  ExampleFrontendRuntime
> = {
  name: "Example",
  routes: exampleRoutes,
  createActorMesh: (runtime) => ({
    exampleApi: new ExampleApiImpl(runtime.actorMesh.infra.httpClient),
  }),
};

// 显式的模块列表
const allFrontendManifests = [
  exampleFrontendManifest,
  prepareDbDataFrontendManifest,
];

// 构建 Runtime
const frontendRegistry = new FrontendModuleRegistry();
frontendRegistry.registerAll(allFrontendManifests);

const frontendRuntime = frontendRegistry.build({
  apiBaseUrl: "http://localhost:3000",
  modules: {},
});

// 使用 runtime.routeTable.routes 配置路由器
// 使用 runtime.actorMesh.modules.Example.exampleApi 调用 API
*/
