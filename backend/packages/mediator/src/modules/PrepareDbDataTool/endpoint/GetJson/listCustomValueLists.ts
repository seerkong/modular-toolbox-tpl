import type { PrepareDbDataToolRuntime } from "@backend/core";
import type { GetEndpoint } from "@backend/mediator/infra/http";
import { ok } from "@backend/mediator/infra/response";

export const createListCustomValueListsEndpoint = (runtime: PrepareDbDataToolRuntime): GetEndpoint => {
  return async ({ query }) => {
    const service = runtime.actorMesh.modules.PrepareDbDataTool.prepareDbDataService;
    const valueType = typeof query?.valueType === "string" ? (query.valueType as "string" | "number") : undefined;
    return ok(await service.listCustomValueLists(valueType));
  };
};
