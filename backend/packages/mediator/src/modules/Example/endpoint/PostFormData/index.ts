import { ExampleApiType } from "@app/shared";
import type { ExampleModuleRuntime } from "@backend/core";
import type { PostEndpoint } from "@backend/mediator/infra/http";
import { createFileUploadEndpoint } from "./fileUpload";

export const createExampleFormDataHandlers = (runtime: ExampleModuleRuntime): Record<string, PostEndpoint> => ({
  [ExampleApiType.FileUpload]: createFileUploadEndpoint(runtime),
});
