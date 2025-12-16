import type { PrepareDbDataToolRuntime } from "@backend/core";
import type { PostEndpoint } from "@backend/mediator/infra/http";
import { ok, fail } from "@backend/mediator/infra/response";

export const createCancelInsertEndpoint = (runtime: PrepareDbDataToolRuntime): PostEndpoint => {
  return async ({ params }) => {
    const service = runtime.actorMesh.modules.PrepareDbDataTool.prepareDbDataService;
    const id = params?.id;
    if (!id) return fail("Invalid task id");
    const okCancel = await service.cancelTask(id);
    if (!okCancel) return fail("Task not found");
    return ok({ ok: true });
  };
};
