import type { PrepareDbDataToolRuntime } from "@backend/core";
import type { GetEndpoint } from "@backend/mediator/infra/http";
import { ok } from "@backend/mediator/infra/response";

export const createListDbProfilesEndpoint = (runtime: PrepareDbDataToolRuntime): GetEndpoint => {
  return async () => {
    const service = runtime.actorMesh.modules.PrepareDbDataTool.prepareDbDataService;
    return ok(await service.listProfiles());
  };
};
