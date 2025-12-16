import path from "path";
import { AppConstConfig } from "@app/shared/src/infra/ConstConfig";
import { PrepareDbDataToolConstConfig } from "@app/shared/src/modules/PrepareDbDataTool/ConstConfig";
import type { BackendConfig } from "@backend/mediator";

export const resolveDataDir = () =>
  path.resolve(process.env[AppConstConfig.env.dataDir] ?? AppConstConfig.dataDir);

export const buildBackendBootstrapConfig = (dataDir: string): BackendConfig => ({
  dataDir,
  modules: {
    PrepareDbDataTool: { sqliteFileName: PrepareDbDataToolConstConfig.DbFileName },
  },
});
