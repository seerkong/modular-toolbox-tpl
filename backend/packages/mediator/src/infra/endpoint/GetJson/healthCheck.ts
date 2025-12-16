import { InfraApiType, HealthCheckResponse } from "@app/shared";
import type { GetEndpoint } from "@backend/mediator/infra/http";
import { ok } from "@backend/mediator/infra/response";
import { logEndpointStart } from "@backend/mediator/infra/logging";

export const createHealthCheckEndpoint = (): GetEndpoint => {
  return async ({ log }) => {
    logEndpointStart(log, InfraApiType.HealthCheck);
    const payload: HealthCheckResponse = { status: "ok", timestamp: new Date().toISOString() };
    return ok(payload);
  };
};
