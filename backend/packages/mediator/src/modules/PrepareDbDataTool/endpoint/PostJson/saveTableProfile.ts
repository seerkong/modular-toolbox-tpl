import type { PrepareColumnInfo } from "@app/shared";
import type { PrepareDbDataToolRuntime } from "@backend/core";
import type { PostEndpoint } from "@backend/mediator/infra/http";
import { ok, fail } from "@backend/mediator/infra/response";

export const createSaveTableProfileEndpoint = (runtime: PrepareDbDataToolRuntime): PostEndpoint => {
  return async ({ body }) => {
    const service = runtime.actorMesh.modules.PrepareDbDataTool.prepareDbDataService;
    const { tableName, columns, fields, profileName, profileId, dbProfileId } = body ?? {};
    if (!tableName) return fail("tableName required");
    const profile = await service.saveTableProfile({
      tableName,
      columns: (columns as PrepareColumnInfo[]) ?? [],
      fields: fields ?? [],
      profileName,
      profileId,
      dbProfileId,
    });
    return ok({ profile });
  };
};
