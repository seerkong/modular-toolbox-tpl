import type { PrepareDbDataToolRuntime } from "@backend/core";
import type { DeleteEndpoint } from "@backend/mediator/infra/http";
import { ok } from "@backend/mediator/infra/response";

export const createDeleteCustomValueListEndpoint = (runtime: PrepareDbDataToolRuntime): DeleteEndpoint => {
  return async ({ params }) => {
    const service = runtime.actorMesh.modules.PrepareDbDataTool.prepareDbDataService;
    const id = Number(params?.id);
    if (!Number.isFinite(id)) {
      throw new Error("Invalid id");
    }
    await service.deleteCustomValueList(id);
    return ok(true);
  };
};
