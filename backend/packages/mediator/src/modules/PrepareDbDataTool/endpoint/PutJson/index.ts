import { PrepareDbDataToolApi } from "@app/shared";
import type { PrepareDbDataToolRuntime } from "@backend/core";
import type { PutEndpoint } from "@backend/mediator/infra/http";
import { createUpdateDbProfileEndpoint } from "./updateDbProfile";

export const createPrepareDbDataPutHandlers = (runtime: PrepareDbDataToolRuntime): Record<string, PutEndpoint> => ({
  [PrepareDbDataToolApi.DbProfileById]: createUpdateDbProfileEndpoint(runtime),
});
