import type {
  PrepareDbProfileDTO,
  PrepareTableProfileSummary,
  PrepareGenerationInput,
  PrepareGenerationResult,
  PrepareTaskEvent,
  PrepareCustomValueListDTO,
  PrepareValueListType,
} from "@app/shared";
import type { PrepareDbDataApi, PrepareDbDataRuntime } from "@frontend/core";

export class PrepareDbDataController {
  constructor(private readonly api: PrepareDbDataApi) {}

  listProfiles(runtime: PrepareDbDataRuntime): Promise<PrepareDbProfileDTO[]> {
    return this.api.listProfiles(runtime);
  }

  listTableProfiles(runtime: PrepareDbDataRuntime, dbProfileId?: number): Promise<PrepareTableProfileSummary[]> {
    return this.api.listTableProfiles(runtime, dbProfileId);
  }

  preview(runtime: PrepareDbDataRuntime, payload: PrepareGenerationInput): Promise<PrepareGenerationResult> {
    return this.api.previewInsert(runtime, payload);
  }

  execute(runtime: PrepareDbDataRuntime, payload: PrepareGenerationInput): Promise<{ taskId: string }> {
    return this.api.executeInsert(runtime, payload);
  }

  listCustomValueLists(runtime: PrepareDbDataRuntime, valueType?: PrepareValueListType): Promise<PrepareCustomValueListDTO[]> {
    return this.api.listCustomValueLists(runtime, valueType);
  }

  createCustomValueList(
    runtime: PrepareDbDataRuntime,
    payload: { name: string; valueType: PrepareValueListType; csvText: string }
  ): Promise<PrepareCustomValueListDTO> {
    return this.api.createCustomValueList(runtime, payload);
  }

  deleteCustomValueList(runtime: PrepareDbDataRuntime, id: number): Promise<void> {
    return this.api.deleteCustomValueList(runtime, id);
  }

  subscribeProgress(runtime: PrepareDbDataRuntime, onEvent: (event: PrepareTaskEvent) => void): () => void {
    return this.api.connectProgressSocket(runtime, onEvent);
  }
}
