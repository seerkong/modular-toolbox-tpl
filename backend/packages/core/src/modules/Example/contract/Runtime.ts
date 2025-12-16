import type { InfraActorMesh } from "@backend/mediator/infra";
import type { ExampleService } from "./index";

export interface ExampleModuleConfig {}

export interface ExampleActorMesh {
  exampleService: ExampleService;
}

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
