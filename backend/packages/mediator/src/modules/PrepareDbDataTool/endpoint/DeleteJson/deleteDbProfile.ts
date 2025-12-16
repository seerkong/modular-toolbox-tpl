import type { PrepareDbDataToolRuntime } from "@backend/core";
import type { DeleteEndpoint } from "@backend/mediator/infra/http";
import { ok, fail } from "@backend/mediator/infra/response";

export const createDeleteDbProfileEndpoint = (runtime: PrepareDbDataToolRuntime): DeleteEndpoint => {
  return async ({ params }) => {
    const service = runtime.actorMesh.modules.PrepareDbDataTool.prepareDbDataService;
    const id = Number(params?.id);
    if (!id) return fail("Invalid id");
    await service.deleteProfile(id);
    return ok({ ok: true });
  };
};
