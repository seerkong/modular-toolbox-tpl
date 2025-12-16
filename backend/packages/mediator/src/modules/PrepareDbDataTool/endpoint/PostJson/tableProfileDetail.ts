import type { PrepareDbDataToolRuntime } from "@backend/core";
import type { PostEndpoint } from "@backend/mediator/infra/http";
import { ok, fail } from "@backend/mediator/infra/response";

export const createTableProfileDetailEndpoint = (runtime: PrepareDbDataToolRuntime): PostEndpoint => {
  return async ({ body }) => {
    const service = runtime.actorMesh.modules.PrepareDbDataTool.prepareDbDataService;
    const id = Number(body?.id);
    if (!id) return fail("Invalid profile id");
    const profile = await service.getTableProfileById(id);
    if (!profile) return fail("Profile not found");
    return ok({ profile });
  };
};
