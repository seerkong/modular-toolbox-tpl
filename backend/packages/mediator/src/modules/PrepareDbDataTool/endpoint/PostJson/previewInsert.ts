import type { PrepareGenerationInput } from "@app/shared";
import type { PrepareDbDataToolRuntime } from "@backend/core";
import type { PostEndpoint } from "@backend/mediator/infra/http";
import { ok } from "@backend/mediator/infra/response";

export const createPreviewInsertEndpoint = (runtime: PrepareDbDataToolRuntime): PostEndpoint => {
  return async ({ body }) => {
    const service = runtime.actorMesh.modules.PrepareDbDataTool.prepareDbDataService;
    return ok(await service.previewInsert(body as PrepareGenerationInput));
  };
};
