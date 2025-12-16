import path from "path";
import type { BackendModuleManifest, ModuleEndpoints } from "@backend/mediator/infra/types";
import type { PrepareDbDataToolActorMesh, PrepareDbDataToolRuntime } from "@backend/core/modules/PrepareDbDataTool";
import { createPrepareDbDataDataSource } from "./datasource";
import { PrepareDbDataServiceImpl } from "./service/PrepareDbDataService";
import {
  createPrepareDbDataDeleteHandlers,
  createPrepareDbDataGetJsonHandlers,
  createPrepareDbDataPostHandlers,
  createPrepareDbDataPutHandlers,
  createPrepareDbDataWsHandlers,
} from "./endpoint";

export const prepareDbDataToolManifest: BackendModuleManifest<
  PrepareDbDataToolActorMesh,
  PrepareDbDataToolRuntime
> = {
  name: "PrepareDbDataTool",
  version: "1.0.0",
  description: "Prepare DB data tool backend module",

  createActorMesh: (runtime) => {
    const moduleConfig = runtime.config.modules.PrepareDbDataTool;
    if (!moduleConfig?.sqliteFileName) {
      throw new Error("PrepareDbDataTool module config requires sqliteFileName");
    }
    const sqlitePath = path.join(runtime.actorMesh.infra.dataDir, moduleConfig.sqliteFileName);
    const dataSource = createPrepareDbDataDataSource(sqlitePath);
    return {
      prepareDbDataService: new PrepareDbDataServiceImpl(dataSource),
    };
  },

  createEndpoints: (runtime): ModuleEndpoints => ({
    getJson: createPrepareDbDataGetJsonHandlers(runtime),
    post: createPrepareDbDataPostHandlers(runtime),
    put: createPrepareDbDataPutHandlers(runtime),
    delete: createPrepareDbDataDeleteHandlers(runtime),
    ws: createPrepareDbDataWsHandlers(runtime),
  }),
};
