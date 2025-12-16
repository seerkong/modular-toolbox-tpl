import type { PrepareColumnInfo } from "@app/shared";
import type { PrepareDbDataToolRuntime } from "@backend/core";
import type { PostEndpoint } from "@backend/mediator/infra/http";
import { ok, fail } from "@backend/mediator/infra/response";

export const createApplyTableProfileEndpoint = (runtime: PrepareDbDataToolRuntime): PostEndpoint => {
  return async ({ body }) => {
    const service = runtime.actorMesh.modules.PrepareDbDataTool.prepareDbDataService;
    const { profileId, columns = [] } = body ?? {};
    const id = Number(profileId);
    if (!profileId || Number.isNaN(id)) return fail("Invalid profileId");
    const reusable = await service.applySavedProfile(id, columns as PrepareColumnInfo[]);
    return ok({ fields: reusable });
  };
};
