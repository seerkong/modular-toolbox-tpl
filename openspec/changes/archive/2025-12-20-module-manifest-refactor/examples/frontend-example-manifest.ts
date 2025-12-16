/**
 * 前端 Example 模块完整示例
 *
 * 展示如何使用 Runtime + ActorMesh 模式定义前端模块
 *
 * 目录结构：
 *
 * frontend/packages/core/src/modules/Example/
 * ├── index.ts
 * ├── contract/
 * │   ├── Api.ts                # API 接口定义
 * │   └── Runtime.ts            # ⭐ Runtime 类型定义
 * └── api/
 *     └── ApiImpl.ts            # API 实现
 *
 * frontend/packages/mediator/src/modules/Example/
 * ├── index.ts
 * ├── manifest.ts               # Manifest 定义
 * ├── router/
 * │   └── routes.ts             # 路由配置
 * ├── hooks/
 * │   └── useExampleApi.ts      # React Hook
 * └── view/
 *     └── ExamplePost.tsx
 */

import type {
  FrontendModuleManifest,
  FrontendInfraActorMesh,
  AppRouteConfig,
} from "../types";

// ============================================================
// core package: contract/Api.ts - API 接口定义
// ============================================================

/**
 * Example API 接口
 *
 * 位置: frontend/packages/core/src/modules/Example/contract/Api.ts
 */
export interface ExampleApi {
  getDemo(): Promise<{ message: string; timestamp: number }>;
  echo(data: unknown): Promise<unknown>;
}

// ============================================================
// core package: contract/Runtime.ts - Runtime 类型定义
// ============================================================

/**
 * Example 前端模块配置
 *
 * 位置: frontend/packages/core/src/modules/Example/contract/Runtime.ts
 */
export interface ExampleFrontendConfig {
  /** 是否启用实验性功能 */
  enableExperimental?: boolean;
}

/**
 * Example 前端模块的 ActorMesh
 *
 * 位置: frontend/packages/core/src/modules/Example/contract/Runtime.ts
 */
export interface ExampleFrontendActorMesh {
  exampleApi: ExampleApi;
}

/**
 * Example 前端模块的 Runtime 类型
 *
 * 位置: frontend/packages/core/src/modules/Example/contract/Runtime.ts
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

// ============================================================
// core package: api/ApiImpl.ts - API 实现
// ============================================================

/**
 * Example API 实现
 *
 * 位置: frontend/packages/core/src/modules/Example/api/ApiImpl.ts
 */
export class ExampleApiImpl implements ExampleApi {
  constructor(private readonly httpClient: FrontendInfraActorMesh["httpClient"]) {}

  async getDemo() {
    return this.httpClient.get<{ code: number; data: { message: string; timestamp: number } }>(
      "/api/example/demo"
    ).then((res) => res.data);
  }

  async echo(data: unknown) {
    return this.httpClient.post<{ code: number; data: unknown }>(
      "/api/example/echo",
      data
    ).then((res) => res.data);
  }
}

// ============================================================
// mediator package: router/routes.ts - 路由配置
// ============================================================

/**
 * Example 模块路由配置
 *
 * 位置: frontend/packages/mediator/src/modules/Example/router/routes.ts
 */
export const exampleRoutes: AppRouteConfig[] = [
  {
    path: "/example",
    name: "example-root",
    title: "示例模块",
    component: "layout",
    meta: {
      isMenu: true,
      icon: "example-icon",
      order: 1,
    },
    children: [
      {
        path: "/example/post",
        name: "example-post",
        title: "POST示例",
        component: "modules/Example/view/ExamplePost",
        meta: { isMenu: true },
      },
      {
        path: "/example/sse",
        name: "example-sse",
        title: "SSE示例",
        component: "modules/Example/view/ExampleSse",
        meta: { isMenu: true },
      },
      {
        path: "/example/upload",
        name: "example-upload",
        title: "文件上传",
        component: "modules/Example/view/ExampleUpload",
        meta: { isMenu: true },
      },
    ],
  },
];

// ============================================================
// mediator package: manifest.ts - Manifest 定义
// ============================================================

/**
 * Example 前端模块 Manifest
 *
 * 位置: frontend/packages/mediator/src/modules/Example/manifest.ts
 */
export const exampleFrontendManifest: FrontendModuleManifest<
  ExampleFrontendActorMesh,
  ExampleFrontendRuntime
> = {
  name: "Example",
  version: "1.0.0",
  description: "示例前端模块",

  // 路由配置
  routes: exampleRoutes,

  /**
   * 创建模块的 ActorMesh
   */
  createActorMesh: (runtime) => {
    return {
      exampleApi: new ExampleApiImpl(runtime.actorMesh.infra.httpClient),
    };
  },

  /**
   * 模块初始化钩子
   */
  onInit: (runtime) => {
    console.log("[Example] Frontend module initialized");
    const config = runtime.config.modules.Example;
    if (config?.enableExperimental) {
      console.log("[Example] Experimental features enabled");
    }
  },

  /**
   * 模块销毁钩子
   */
  onDestroy: () => {
    console.log("[Example] Frontend module destroyed");
  },
};

// ============================================================
// Step 7: 在组件中使用 Runtime
// ============================================================

/*
// 方式 1: 通过 Context 获取 Runtime（React）

// context/RuntimeContext.tsx
import { createContext, useContext } from "react";
import type { FrontendRuntime } from "../infra/types";

const RuntimeContext = createContext<FrontendRuntime | null>(null);

export const RuntimeProvider = RuntimeContext.Provider;

export function useRuntime(): FrontendRuntime {
  const runtime = useContext(RuntimeContext);
  if (!runtime) {
    throw new Error("useRuntime must be used within RuntimeProvider");
  }
  return runtime;
}

// 创建模块专用的 hook
export function useExampleApi(): ExampleApi {
  const runtime = useRuntime();
  return runtime.actorMesh.modules.Example.exampleApi;
}


// 在组件中使用
// modules/Example/view/ExamplePost.tsx

import { useState } from "react";
import { useExampleApi } from "../../../context/RuntimeContext";

export default function ExamplePost() {
  const api = useExampleApi();
  const [result, setResult] = useState<string>("");

  const handleSubmit = async (data: unknown) => {
    const response = await api.echo(data);
    setResult(JSON.stringify(response, null, 2));
  };

  return (
    <div>
      <h1>POST 示例</h1>
      <button onClick={() => handleSubmit({ hello: "world" })}>
        发送请求
      </button>
      <pre>{result}</pre>
    </div>
  );
}


// 方式 2: 通过 Vue provide/inject

// main.ts
import { createApp } from "vue";
import { FrontendModuleRegistry } from "../infra/registry";
import { allFrontendManifests } from "./modules";

const registry = new FrontendModuleRegistry();
registry.registerAll(allFrontendManifests);

const runtime = registry.build({
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  modules: {},
});

const app = createApp(App);
app.provide("runtime", runtime);
app.mount("#app");


// 在组件中使用
// modules/Example/view/ExamplePost.vue

<script setup lang="ts">
import { inject, ref } from "vue";
import type { FrontendRuntime } from "../../../infra/types";

const runtime = inject<FrontendRuntime>("runtime")!;
const api = runtime.actorMesh.modules.Example.exampleApi;
const result = ref("");

const handleSubmit = async (data: unknown) => {
  const response = await api.echo(data);
  result.value = JSON.stringify(response, null, 2);
};
</script>

<template>
  <div>
    <h1>POST 示例</h1>
    <button @click="handleSubmit({ hello: 'world' })">发送请求</button>
    <pre>{{ result }}</pre>
  </div>
</template>
*/

// ============================================================
// Step 8: 模块入口导出
// ============================================================

// modules/Example/index.ts
// export { exampleFrontendManifest } from "./manifest";
// export type {
//   ExampleFrontendActorMesh,
//   ExampleFrontendConfig,
//   ExampleFrontendRuntime,
//   ExampleApi,
// } from "./manifest";
