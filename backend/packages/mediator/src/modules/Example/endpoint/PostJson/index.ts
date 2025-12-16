import { ExampleApiType } from "@app/shared";
import type { ExampleModuleRuntime } from "@backend/core";
import type { PostEndpoint } from "@backend/mediator/infra/http";
import { createPostExampleEndpoint } from "./postExample";

export const createExamplePostHandlers = (runtime: ExampleModuleRuntime): Record<string, PostEndpoint> => ({
  [ExampleApiType.PostExample]: createPostExampleEndpoint(runtime),
});
