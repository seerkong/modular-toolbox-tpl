import type {
  PrepareDbProfileDTO,
  PrepareColumnInfo,
  PrepareFieldConfig,
  PrepareGenerationInput,
  PrepareGenerationResult,
  PrepareTableProfileDetail,
  PrepareTableProfileSummary,
  PrepareTaskEvent,
  PrepareTaskState,
  PrepareCustomValueListDTO,
  PrepareValueListType,
} from "@app/shared";
import type { PrepareDbDataRuntime } from "./Runtime";

export type ProgressMessageHandler = (event: PrepareTaskEvent) => void;

export interface PrepareDbDataApi {
  listProfiles(runtime: PrepareDbDataRuntime): Promise<PrepareDbProfileDTO[]>;
  createProfile(runtime: PrepareDbDataRuntime, input: Partial<PrepareDbProfileDTO>): Promise<PrepareDbProfileDTO>;
  updateProfile(runtime: PrepareDbDataRuntime, id: number, input: Partial<PrepareDbProfileDTO>): Promise<PrepareDbProfileDTO>;
  deleteProfile(runtime: PrepareDbDataRuntime, id: number): Promise<void>;
  activateProfile(runtime: PrepareDbDataRuntime, id: number): Promise<PrepareDbProfileDTO>;
  testConnection(runtime: PrepareDbDataRuntime, input: Partial<PrepareDbProfileDTO>): Promise<void>;

  fetchSchema(
    runtime: PrepareDbDataRuntime,
    options: { tableName: string | null; databaseOverride?: string; dbProfileId?: number; tableProfileId?: number }
  ): Promise<PrepareColumnInfo[]>;

  listTableProfiles(runtime: PrepareDbDataRuntime, dbProfileId?: number): Promise<PrepareTableProfileSummary[]>;
  getTableProfile(runtime: PrepareDbDataRuntime, id: number): Promise<PrepareTableProfileDetail | null>;
  saveTableProfile(
    runtime: PrepareDbDataRuntime,
    payload: {
      profileName?: string;
      profileId?: number;
      tableName: string;
      columns: PrepareColumnInfo[];
      fields: PrepareFieldConfig[];
      dbProfileId?: number;
    }
  ): Promise<PrepareTableProfileDetail>;
  applyTableProfile(runtime: PrepareDbDataRuntime, profileId: number, columns: PrepareColumnInfo[]): Promise<PrepareFieldConfig[]>;
  deleteTableProfile(runtime: PrepareDbDataRuntime, id: number): Promise<void>;

  listCustomValueLists(runtime: PrepareDbDataRuntime, valueType?: PrepareValueListType): Promise<PrepareCustomValueListDTO[]>;
  createCustomValueList(
    runtime: PrepareDbDataRuntime,
    payload: { name: string; valueType: PrepareValueListType; csvText: string }
  ): Promise<PrepareCustomValueListDTO>;
  deleteCustomValueList(runtime: PrepareDbDataRuntime, id: number): Promise<void>;

  previewInsert(runtime: PrepareDbDataRuntime, input: PrepareGenerationInput): Promise<PrepareGenerationResult>;
  executeInsert(runtime: PrepareDbDataRuntime, input: PrepareGenerationInput): Promise<{ taskId: string }>;
  cancelTask(runtime: PrepareDbDataRuntime, taskId: string): Promise<void>;
  getTask(runtime: PrepareDbDataRuntime, taskId: string): Promise<PrepareTaskState | null>;

  connectProgressSocket(runtime: PrepareDbDataRuntime, onMessage: ProgressMessageHandler): () => void;
}
