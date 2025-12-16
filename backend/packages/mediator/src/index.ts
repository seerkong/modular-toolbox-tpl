import type { BackendConfig, BackendRuntime } from "./infra/types";
import { BackendModuleRegistry } from "./registry";
import { allModuleManifests } from "./modules";

export const createBackendRuntime = (config: BackendConfig): BackendRuntime => {
  const registry = new BackendModuleRegistry();
  registry.registerAll(allModuleManifests);
  return registry.build(config);
};

export * from "./infra/http";
export * from "./infra/types";
export * from "./registry";
export * from "./modules";
