import { exampleFrontendManifest } from "./Example/manifest";
import { prepareDbDataToolFrontendManifest } from "./PrepareDbDataTool/manifest";

export * from "./Example/container";
export * from "./Example/controller";
export * from "./PrepareDbDataTool/container";
export * from "./PrepareDbDataTool/controller/PrepareDbDataController";
export { exampleFrontendManifest } from "./Example/manifest";
export { prepareDbDataToolFrontendManifest } from "./PrepareDbDataTool/manifest";

export const allFrontendModuleManifests = [
  exampleFrontendManifest,
  prepareDbDataToolFrontendManifest,
];
