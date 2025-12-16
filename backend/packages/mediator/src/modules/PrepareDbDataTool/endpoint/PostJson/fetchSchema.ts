import type { PrepareDbDataToolRuntime } from "@backend/core";
import type { PostEndpoint } from "@backend/mediator/infra/http";
import { ok } from "@backend/mediator/infra/response";

export const createFetchSchemaEndpoint = (runtime: PrepareDbDataToolRuntime): PostEndpoint => {
  return async ({ body }) => {
    const service = runtime.actorMesh.modules.PrepareDbDataTool.prepareDbDataService;
    const { tableName, database, dbProfileId, tableProfileId } = body ?? {};
    const columns = await service.fetchSchema({
      tableName: tableName ?? null,
      databaseOverride: database,
      dbProfileId,
      tableProfileId,
    });
    return ok({ columns });
  };
};
