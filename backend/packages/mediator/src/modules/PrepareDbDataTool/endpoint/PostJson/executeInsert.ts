import type { PrepareGenerationInput } from "@app/shared";
import type { PrepareDbDataToolRuntime } from "@backend/core";
import type { PostEndpoint } from "@backend/mediator/infra/http";
import { ok } from "@backend/mediator/infra/response";

export const createExecuteInsertEndpoint = (runtime: PrepareDbDataToolRuntime): PostEndpoint => {
  return async ({ body }) => {
    const service = runtime.actorMesh.modules.PrepareDbDataTool.prepareDbDataService;
    return ok(await service.startInsert(body as PrepareGenerationInput, undefined));
  };
};
