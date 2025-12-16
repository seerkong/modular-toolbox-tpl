import { InfraApiType } from "@app/shared";
import type { GetEndpoint } from "@backend/mediator/infra/http";
import { createHealthCheckEndpoint } from "./healthCheck";

export const createInfraGetJsonHandlers = (): Record<string, GetEndpoint> => ({
  [InfraApiType.HealthCheck]: createHealthCheckEndpoint(),
});
