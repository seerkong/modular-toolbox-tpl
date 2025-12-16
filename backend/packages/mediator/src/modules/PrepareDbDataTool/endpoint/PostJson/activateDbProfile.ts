import type { PrepareDbDataToolRuntime } from "@backend/core";
import type { PostEndpoint } from "@backend/mediator/infra/http";
import { ok, fail } from "@backend/mediator/infra/response";

export const createActivateDbProfileEndpoint = (runtime: PrepareDbDataToolRuntime): PostEndpoint => {
  return async ({ params }) => {
    const service = runtime.actorMesh.modules.PrepareDbDataTool.prepareDbDataService;
    const id = Number(params?.id);
    if (!id) return fail("Invalid id");
    return ok(await service.setActiveProfile(id));
  };
};
