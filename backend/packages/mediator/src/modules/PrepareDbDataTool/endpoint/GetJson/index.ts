import { PrepareDbDataToolApi } from "@app/shared";
import type { PrepareDbDataToolRuntime } from "@backend/core";
import type { GetEndpoint } from "@backend/mediator/infra/http";
import { createListDbProfilesEndpoint } from "./listDbProfiles";
import { createListTableProfilesEndpoint } from "./listTableProfiles";
import { createTableProfileByIdEndpoint } from "./tableProfileById";
import { createTaskStatusEndpoint } from "./taskStatus";
import { createListCustomValueListsEndpoint } from "./listCustomValueLists";

export const createPrepareDbDataGetJsonHandlers = (runtime: PrepareDbDataToolRuntime): Record<string, GetEndpoint> => ({
  [PrepareDbDataToolApi.ListDbProfiles]: createListDbProfilesEndpoint(runtime),
  [PrepareDbDataToolApi.ListTableProfiles]: createListTableProfilesEndpoint(runtime),
  [PrepareDbDataToolApi.TableProfileById]: createTableProfileByIdEndpoint(runtime),
  [PrepareDbDataToolApi.TaskStatus]: createTaskStatusEndpoint(runtime),
  [PrepareDbDataToolApi.ListCustomValueLists]: createListCustomValueListsEndpoint(runtime),
});
