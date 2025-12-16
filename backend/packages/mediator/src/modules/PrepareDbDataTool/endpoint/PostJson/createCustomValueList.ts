import type { PrepareDbDataToolRuntime } from "@backend/core";
import type { PostEndpoint } from "@backend/mediator/infra/http";
import { ok } from "@backend/mediator/infra/response";

export const createCustomValueListEndpoint = (runtime: PrepareDbDataToolRuntime): PostEndpoint => {
  return async ({ body }) => {
    const service = runtime.actorMesh.modules.PrepareDbDataTool.prepareDbDataService;
    return ok(
      await service.createCustomValueListFromCsv({
        name: body?.name ?? "",
        valueType: body?.valueType ?? "string",
        csvText: body?.csvText ?? "",
      })
    );
  };
};
