import type { PrepareDbDataToolRuntime } from "@backend/core";
import type { GetEndpoint } from "@backend/mediator/infra/http";
import { ok, fail } from "@backend/mediator/infra/response";

export const createTableProfileByIdEndpoint = (runtime: PrepareDbDataToolRuntime): GetEndpoint => {
  return async ({ params }) => {
    const service = runtime.actorMesh.modules.PrepareDbDataTool.prepareDbDataService;
    const id = Number(params?.id);
    if (!id) return fail("Invalid profile id");
    const profile = await service.getTableProfileById(id);
    if (!profile) return fail("Profile not found");
    return ok(profile);
  };
};
