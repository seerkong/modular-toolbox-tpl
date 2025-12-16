import type { PrepareDbDataToolRuntime } from "@backend/core";
import type { GetEndpoint } from "@backend/mediator/infra/http";
import { ok, fail } from "@backend/mediator/infra/response";

export const createTaskStatusEndpoint = (runtime: PrepareDbDataToolRuntime): GetEndpoint => {
  return async ({ params }) => {
    const service = runtime.actorMesh.modules.PrepareDbDataTool.prepareDbDataService;
    const id = params?.id;
    if (!id) return fail("Invalid task id");
    const task = await service.getTask(id);
    if (!task) return fail("Task not found");
    return ok({ task });
  };
};
