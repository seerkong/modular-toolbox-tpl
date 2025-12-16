import type { FrontendInfraActorMesh } from "@frontend/mediator/infra";
import type { PrepareDbDataApi } from "./Api";

export interface PrepareDbDataToolFrontendConfig {
  wsBaseUrl?: string;
}

export interface PrepareDbDataToolFrontendActorMesh {
  prepareDbDataApi: PrepareDbDataApi;
}

export interface PrepareDbDataToolRuntime {
  config: {
    modules: {
      PrepareDbDataTool: PrepareDbDataToolFrontendConfig;
    };
  };
  actorMesh: {
    infra: FrontendInfraActorMesh;
    modules: {
      PrepareDbDataTool: PrepareDbDataToolFrontendActorMesh;
    };
  };
}

export type PrepareDbDataRuntime = PrepareDbDataToolRuntime;
