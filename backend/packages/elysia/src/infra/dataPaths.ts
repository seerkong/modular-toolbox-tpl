import os from "os";
import path from "path";
import { AppConstConfig } from "@app/shared/src/infra/ConstConfig";
import { PrepareDbDataToolConstConfig } from "@app/shared/src/modules/PrepareDbDataTool/ConstConfig";
import type { BackendConfig } from "@backend/mediator";

const expandTilde = (p: string) =>
  p.startsWith("~") ? path.join(os.homedir(), p.slice(1)) : p;

export const resolveDataDir = () => {
  const envDir = process.env[AppConstConfig.env.dataDir];
  if (envDir) return path.resolve(expandTilde(envDir));
  if (process.platform === "win32") {
    const base = process.env.LOCALAPPDATA || os.homedir() || os.tmpdir();
    return path.join(base, AppConstConfig.kebabName);
  }
  return path.resolve(expandTilde(AppConstConfig.dataDir));
};

export const buildBackendBootstrapConfig = (dataDir: string): BackendConfig => ({
  dataDir,
  modules: {
    PrepareDbDataTool: { sqliteFileName: PrepareDbDataToolConstConfig.DbFileName },
  },
});
