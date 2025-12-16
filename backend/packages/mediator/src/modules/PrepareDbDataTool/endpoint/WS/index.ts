import { PrepareDbDataToolWsPath } from "@app/shared";
import type { PrepareDbDataToolRuntime } from "@backend/core";
import { registerPrepareDbDataWsClient } from "../../service/wsHub";
import type { WsEndpoint } from "@backend/mediator/infra/http";

export const createPrepareDbDataWsHandlers = (_runtime: PrepareDbDataToolRuntime): Record<string, WsEndpoint> => ({
  [PrepareDbDataToolWsPath]: {
    open(ws) {
      const cleanup = registerPrepareDbDataWsClient(ws);
      (ws as any)._cleanup = cleanup;
    },
    close(ws) {
      const cleanup = (ws as any)._cleanup;
      if (cleanup) cleanup();
    },
  },
});
