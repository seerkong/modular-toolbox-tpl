import type { InfraActorMesh } from "@backend/mediator/infra";
import type { PrepareDbDataService } from "./index";

export interface PrepareDbDataToolModuleConfig {
  sqliteFileName: string;
}

export interface PrepareDbDataToolActorMesh {
  prepareDbDataService: PrepareDbDataService;
}

export interface PrepareDbDataToolRuntime {
  config: {
    modules: {
      PrepareDbDataTool: PrepareDbDataToolModuleConfig;
    };
  };
  actorMesh: {
    infra: InfraActorMesh;
    modules: {
      PrepareDbDataTool: PrepareDbDataToolActorMesh;
    };
  };
}
