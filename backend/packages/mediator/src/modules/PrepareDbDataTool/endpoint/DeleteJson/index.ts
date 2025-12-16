import { PrepareDbDataToolApi } from "@app/shared";
import type { PrepareDbDataToolRuntime } from "@backend/core";
import type { DeleteEndpoint } from "@backend/mediator/infra/http";
import { createDeleteDbProfileEndpoint } from "./deleteDbProfile";
import { createDeleteTableProfileEndpoint } from "./deleteTableProfile";
import { createDeleteCustomValueListEndpoint } from "./deleteCustomValueList";

export const createPrepareDbDataDeleteHandlers = (runtime: PrepareDbDataToolRuntime): Record<string, DeleteEndpoint> => ({
  [PrepareDbDataToolApi.DbProfileById]: createDeleteDbProfileEndpoint(runtime),
  [PrepareDbDataToolApi.TableProfileById]: createDeleteTableProfileEndpoint(runtime),
  [PrepareDbDataToolApi.DeleteCustomValueList]: createDeleteCustomValueListEndpoint(runtime),
});
