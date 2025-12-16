import type { PrepareDbDataToolRuntime } from "@backend/core";
import type { PostEndpoint } from "@backend/mediator/infra/http";
import { ok } from "@backend/mediator/infra/response";

export const createTestDbProfileEndpoint = (runtime: PrepareDbDataToolRuntime): PostEndpoint => {
  return async ({ body }) => {
    const service = runtime.actorMesh.modules.PrepareDbDataTool.prepareDbDataService;
    await service.testConnection(body ?? {});
    return ok({ ok: true });
  };
};
