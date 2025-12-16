import { ExampleApiType } from "@app/shared";
import type { ExampleModuleRuntime } from "@backend/core";
import type { GetEndpoint } from "@backend/mediator/infra/http";
import { createGetDemoEndpoint } from "./getDemo";

export const createExampleGetJsonHandlers = (runtime: ExampleModuleRuntime): Record<string, GetEndpoint> => ({
  [ExampleApiType.GetDemo]: createGetDemoEndpoint(runtime),
});
