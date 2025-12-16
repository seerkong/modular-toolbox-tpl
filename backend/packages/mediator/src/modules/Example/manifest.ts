import type { BackendModuleManifest, ModuleEndpoints } from "@backend/mediator/infra/types";
import type { ExampleActorMesh, ExampleModuleRuntime } from "@backend/core/modules/Example";
import { DefaultExampleService } from "./service/ExampleService";
import {
  createExampleFormDataHandlers,
  createExampleGetJsonHandlers,
  createExamplePostHandlers,
  createExampleSseHandlers,
} from "./endpoint";

export const exampleManifest: BackendModuleManifest<ExampleActorMesh, ExampleModuleRuntime> = {
  name: "Example",
  version: "1.0.0",
  description: "Example backend module",

  createActorMesh: (_runtime) => ({
    exampleService: new DefaultExampleService(),
  }),

  createEndpoints: (runtime): ModuleEndpoints => ({
    getJson: createExampleGetJsonHandlers(runtime),
    post: createExamplePostHandlers(runtime),
    formData: createExampleFormDataHandlers(runtime),
    sse: createExampleSseHandlers(runtime),
  }),
};
