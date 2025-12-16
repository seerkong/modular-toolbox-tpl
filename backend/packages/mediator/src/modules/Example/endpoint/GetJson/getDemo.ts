import { ExampleApiType } from "@app/shared";
import type { ExampleModuleRuntime } from "@backend/core";
import type { GetEndpoint } from "@backend/mediator/infra/http";
import { ok } from "@backend/mediator/infra/response";
import { logEndpointStart } from "@backend/mediator/infra/logging";

export const createGetDemoEndpoint = (runtime: ExampleModuleRuntime): GetEndpoint => {
  return async ({ log }) => {
    logEndpointStart(log, ExampleApiType.GetDemo);
    const service = runtime.actorMesh.modules.Example.exampleService;
    const res = service.getDemo();
    return ok(res);
  };
};
