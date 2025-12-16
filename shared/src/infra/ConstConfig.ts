export const AppConstConfig = {
  kebabName: "modular-toolbox-tpl",
  pascalName: "ModularToolboxTpl",
  displayName: "Modular Toolbox Tpl",
  // Default POSIX data dir; Windows will override via LOCALAPPDATA fallback in runtime helpers.
  dataDir: "/var/tmp/modular-toolbox-tpl",
  backendBinaryName: "modular-toolbox-tpl-backend",
  desktopBinaryName: "modular-toolbox-tpl.bin",
  appBundleName: "ModularToolboxTpl.app",
  launcherName: "ModularToolboxTpl",
  env: {
    dataDir: "APP_DATA_DIR",
    frontendDir: "APP_FRONTEND_DIR",
    logFile: "APP_LOG_FILE",
    readyFile: "APP_READY_FILE",
    resourcesDir: "APP_RESOURCES",
    desktopDevPort: "APP_DESKTOP_DEV_PORT",
  },
};

export type AppConstConfigType = typeof AppConstConfig;
