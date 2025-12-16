import type { PrepareDbDataToolRuntime } from "@backend/core";
import type { PutEndpoint } from "@backend/mediator/infra/http";
import { ok, fail } from "@backend/mediator/infra/response";

export const createUpdateDbProfileEndpoint = (runtime: PrepareDbDataToolRuntime): PutEndpoint => {
  return async ({ params, body }) => {
    const service = runtime.actorMesh.modules.PrepareDbDataTool.prepareDbDataService;
    const id = Number(params?.id);
    if (!id) return fail("Invalid id");
    return ok(await service.updateProfile(id, body ?? {}));
  };
};
