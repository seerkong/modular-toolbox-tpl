import type { PrepareDbDataToolRuntime } from "@backend/core";
import type { GetEndpoint } from "@backend/mediator/infra/http";
import { ok } from "@backend/mediator/infra/response";

export const createListTableProfilesEndpoint = (runtime: PrepareDbDataToolRuntime): GetEndpoint => {
  return async ({ query }) => {
    const service = runtime.actorMesh.modules.PrepareDbDataTool.prepareDbDataService;
    const dbProfileId = query?.dbProfileId ? Number(query.dbProfileId) : undefined;
    return ok(await service.listTableProfiles(dbProfileId));
  };
};
