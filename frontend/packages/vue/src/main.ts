import { createApp } from "vue";
import { createFrontendRuntime } from "@frontend/mediator";
import type { FrontendConfig } from "@frontend/mediator";
import { provideFrontendRuntime } from "./hooks/use-runtime";
import "@frontend/mediator/styles/index.css";
import App from "./App.vue";
import { router } from "./router";

const app = createApp(App);
const env = (() => {
  try {
    return (import.meta as any).env as Record<string, string | undefined>;
  } catch {
    return {};
  }
})();
const config: FrontendConfig = {
  apiBaseUrl: env?.VITE_API_BASE_URL ?? "",
  modules: {
    Example: {},
    PrepareDbDataTool: {
      wsBaseUrl: env?.VITE_WS_URL,
    },
  },
};
const runtime = createFrontendRuntime(config);
provideFrontendRuntime(runtime, app);
app.use(router);
app.mount("#app");
