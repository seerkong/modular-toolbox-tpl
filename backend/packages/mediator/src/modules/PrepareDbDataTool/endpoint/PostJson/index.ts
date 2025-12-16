import { PrepareDbDataToolApi } from "@app/shared";
import type { PrepareDbDataToolRuntime } from "@backend/core";
import type { PostEndpoint } from "@backend/mediator/infra/http";
import { createCreateDbProfileEndpoint } from "./createDbProfile";
import { createActivateDbProfileEndpoint } from "./activateDbProfile";
import { createTestDbProfileEndpoint } from "./testDbProfile";
import { createFetchSchemaEndpoint } from "./fetchSchema";
import { createSaveTableProfileEndpoint } from "./saveTableProfile";
import { createTableProfileDetailEndpoint } from "./tableProfileDetail";
import { createApplyTableProfileEndpoint } from "./applyTableProfile";
import { createPreviewInsertEndpoint } from "./previewInsert";
import { createExecuteInsertEndpoint } from "./executeInsert";
import { createCancelInsertEndpoint } from "./cancelInsert";
import { createCustomValueListEndpoint } from "./createCustomValueList";

export const createPrepareDbDataPostHandlers = (runtime: PrepareDbDataToolRuntime): Record<string, PostEndpoint> => ({
  [PrepareDbDataToolApi.ListDbProfiles]: createCreateDbProfileEndpoint(runtime),
  [PrepareDbDataToolApi.ActivateDbProfile]: createActivateDbProfileEndpoint(runtime),
  [PrepareDbDataToolApi.TestDbProfile]: createTestDbProfileEndpoint(runtime),
  [PrepareDbDataToolApi.FetchSchema]: createFetchSchemaEndpoint(runtime),
  [PrepareDbDataToolApi.SaveTableProfile]: createSaveTableProfileEndpoint(runtime),
  [PrepareDbDataToolApi.TableProfileDetail]: createTableProfileDetailEndpoint(runtime),
  [PrepareDbDataToolApi.ApplyTableProfile]: createApplyTableProfileEndpoint(runtime),
  [PrepareDbDataToolApi.PreviewInsert]: createPreviewInsertEndpoint(runtime),
  [PrepareDbDataToolApi.ExecuteInsert]: createExecuteInsertEndpoint(runtime),
  [PrepareDbDataToolApi.CancelInsert]: createCancelInsertEndpoint(runtime),
  [PrepareDbDataToolApi.CreateCustomValueList]: createCustomValueListEndpoint(runtime),
});
