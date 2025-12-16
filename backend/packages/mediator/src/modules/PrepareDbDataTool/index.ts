import type { PrepareDbDataToolRuntime } from "@backend/core";
import {
  createPrepareDbDataGetJsonHandlers as createPrepareDbDataGetJsonHandlersImpl,
  createPrepareDbDataPostHandlers as createPrepareDbDataPostHandlersImpl,
  createPrepareDbDataPutHandlers as createPrepareDbDataPutHandlersImpl,
  createPrepareDbDataDeleteHandlers as createPrepareDbDataDeleteHandlersImpl,
  createPrepareDbDataWsHandlers,
} from "./endpoint";
import { registerPrepareDbDataWsClient } from "./service/wsHub";

export const createPrepareDbDataGetJsonHandlers = (runtime: PrepareDbDataToolRuntime) =>
  createPrepareDbDataGetJsonHandlersImpl(runtime);
export const createPrepareDbDataPostHandlers = (runtime: PrepareDbDataToolRuntime) =>
  createPrepareDbDataPostHandlersImpl(runtime);
export const createPrepareDbDataPutHandlers = (runtime: PrepareDbDataToolRuntime) =>
  createPrepareDbDataPutHandlersImpl(runtime);
export const createPrepareDbDataDeleteHandlers = (runtime: PrepareDbDataToolRuntime) =>
  createPrepareDbDataDeleteHandlersImpl(runtime);
export const createPrepareDbDataWsHandlersFactory = (runtime: Parameters<typeof createPrepareDbDataWsHandlers>[0]) =>
  createPrepareDbDataWsHandlers(runtime);

export { registerPrepareDbDataWsClient };
export { prepareDbDataToolManifest } from "./manifest";
