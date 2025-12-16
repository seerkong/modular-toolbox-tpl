/**
 * 后端 Example 模块完整示例
 *
 * 展示如何使用 Runtime + ActorMesh 模式定义模块
 *
 * 目录结构：
 *
 * backend/packages/core/src/modules/Example/
 * ├── index.ts
 * └── contract/
 *     ├── index.ts              # 服务接口定义
 *     └── Runtime.ts            # ⭐ Runtime 类型定义
 *
 * backend/packages/mediator/src/modules/Example/
 * ├── index.ts
 * ├── manifest.ts               # Manifest 定义
 * ├── service/
 * │   └── impl.ts               # 服务实现
 * └── endpoint/
 *     ├── GetJson/
 *     └── PostJson/
 */

import type {
  BackendModuleManifest,
  ModuleEndpoints,
  InfraActorMesh,
  GetEndpoint,
  PostEndpoint,
  SseEndpoint,
} from "../types";

// ============================================================
// core package: contract/index.ts - 服务接口定义
// ============================================================

/**
 * Example 服务接口
 *
 * 位置: backend/packages/core/src/modules/Example/contract/index.ts
 */
export interface ExampleService {
  getDemo(): { message: string; timestamp: number };
  echo(data: unknown): unknown;
  streamEvents(onEvent: (data: string) => void): () => void;
}

// ============================================================
// core package: contract/Runtime.ts - Runtime 类型定义
// ============================================================

/**
 * Example 模块配置
 *
 * 位置: backend/packages/core/src/modules/Example/contract/Runtime.ts
 */
export interface ExampleModuleConfig {
  /** 最大返回条目数 */
  maxItems: number;
  /** 是否启用调试模式 */
  debug?: boolean;
}

/**
 * Example 模块的 ActorMesh
 *
 * 位置: backend/packages/core/src/modules/Example/contract/Runtime.ts
 */
export interface ExampleActorMesh {
  exampleService: ExampleService;
}

/**
 * Example 模块的 Runtime 类型
 *
 * 位置: backend/packages/core/src/modules/Example/contract/Runtime.ts
 *
 * 这是模块声明自己需要的依赖子集
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

// ============================================================
// mediator package: service/impl.ts - 服务实现
// ============================================================

/**
 * Example 服务实现
 *
 * 位置: backend/packages/mediator/src/modules/Example/service/impl.ts
 */
export class ExampleServiceImpl implements ExampleService {
  constructor(
    private readonly logger: InfraActorMesh["logger"],
    private readonly config?: ExampleModuleConfig
  ) {}

  getDemo() {
    this.logger.debug("ExampleService.getDemo called");
    return {
      message: "Hello from Example Module",
      timestamp: Date.now(),
      maxItems: this.config?.maxItems ?? 10,
    };
  }

  echo(data: unknown) {
    this.logger.debug("ExampleService.echo called", data);
    return data;
  }

  streamEvents(onEvent: (data: string) => void) {
    this.logger.info("Starting SSE stream");
    const interval = setInterval(() => {
      onEvent(`Event at ${new Date().toISOString()}`);
    }, 1000);

    return () => {
      this.logger.info("Stopping SSE stream");
      clearInterval(interval);
    };
  }
}

// ============================================================
// mediator package: endpoint/ - 端点创建函数
// ============================================================

/**
 * 创建 GET 端点
 *
 * 位置: backend/packages/mediator/src/modules/Example/endpoint/GetJson/index.ts
 */
const createGetEndpoints = (runtime: ExampleModuleRuntime): Record<string, GetEndpoint> => {
  const service = runtime.actorMesh.modules.Example.exampleService;

  return {
    "/api/example/demo": async (ctx) => {
      const result = service.getDemo();
      return { code: 0, data: result };
    },
  };
};

/**
 * 创建 POST 端点
 */
const createPostEndpoints = (runtime: ExampleModuleRuntime): Record<string, PostEndpoint> => {
  const service = runtime.actorMesh.modules.Example.exampleService;

  return {
    "/api/example/echo": async (ctx) => {
      const result = service.echo(ctx.body);
      return { code: 0, data: result };
    },
  };
};

/**
 * 创建 SSE 端点
 */
const createSseEndpoints = (runtime: ExampleModuleRuntime): Record<string, SseEndpoint> => {
  const service = runtime.actorMesh.modules.Example.exampleService;

  return {
    "/sse/example/stream": async (ctx) => {
      const stream = new ReadableStream({
        start(controller) {
          const encoder = new TextEncoder();
          const cleanup = service.streamEvents((data) => {
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          });

          // 30秒后关闭
          setTimeout(() => {
            cleanup();
            controller.close();
          }, 30000);
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    },
  };
};

// ============================================================
// Step 6: 定义模块 Manifest
// ============================================================

/**
 * Example 模块 Manifest
 *
 * 这是模块对外暴露的唯一接口
 */
export const exampleManifest: BackendModuleManifest<
  ExampleActorMesh,
  ExampleModuleRuntime
> = {
  name: "Example",
  version: "1.0.0",
  description: "示例模块，展示 Runtime + ActorMesh 模式",

  /**
   * 创建模块的 ActorMesh
   *
   * 在这里创建模块内的所有服务实例
   */
  createActorMesh: (runtime) => {
    return {
      exampleService: new ExampleServiceImpl(
        runtime.actorMesh.infra.logger,
        runtime.config.modules.Example
      ),
    };
  },

  /**
   * 创建模块的端点
   *
   * 传入的 runtime 类型是 ExampleModuleRuntime
   * 可以类型安全地访问 runtime.actorMesh.modules.Example
   */
  createEndpoints: (runtime): ModuleEndpoints => {
    return {
      getJson: createGetEndpoints(runtime),
      post: createPostEndpoints(runtime),
      sse: createSseEndpoints(runtime),
    };
  },

  /**
   * 模块初始化钩子
   */
  onInit: async (runtime) => {
    const logger = runtime.actorMesh.infra.logger;
    const config = runtime.config.modules.Example;
    logger.info(`[Example] Module initialized with maxItems=${config.maxItems}`);
  },

  /**
   * 模块销毁钩子
   */
  onDestroy: async () => {
    console.log("[Example] Module destroyed");
  },
};

// ============================================================
// Step 7: 模块入口导出
// ============================================================

// modules/Example/index.ts
// export { exampleManifest } from "./manifest";
// export type { ExampleActorMesh, ExampleModuleConfig, ExampleModuleRuntime } from "./manifest";

// ============================================================
// 类型扩展示例（放在单独的 types.d.ts 文件中）
// ============================================================

/*
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
*/
