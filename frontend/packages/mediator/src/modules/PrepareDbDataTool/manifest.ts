import type { FrontendModuleManifest } from "@frontend/mediator/types";
import type { PrepareDbDataToolFrontendActorMesh, PrepareDbDataToolRuntime } from "@frontend/core/modules/PrepareDbDataTool";
import { PrepareDbDataApiImpl } from "@frontend/core";
import { prepareDbRoutes } from "./router/routes";

export const prepareDbDataToolFrontendManifest: FrontendModuleManifest<
  PrepareDbDataToolFrontendActorMesh,
  PrepareDbDataToolRuntime
> = {
  name: "PrepareDbDataTool",
  version: "1.0.0",
  description: "Prepare DB data tool frontend module",
  routes: prepareDbRoutes,

  createActorMesh: (_runtime) => ({
    prepareDbDataApi: new PrepareDbDataApiImpl(),
  }),
};
