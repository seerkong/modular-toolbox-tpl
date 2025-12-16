import type {
  PrepareColumnInfo,
  PrepareFieldConfig,
  PrepareGenerationInput,
  PrepareGenerationResult,
  PrepareTableProfileDetail,
  PrepareTableProfileSummary,
  PrepareDbProfileDTO,
  PrepareTaskEvent,
  PrepareTaskState,
  PrepareCustomValueListDTO,
} from "@app/shared";

export interface PrepareDbDataService {
  listProfiles(): Promise<PrepareDbProfileDTO[]>;
  createProfile(input: Partial<PrepareDbProfileDTO>): Promise<PrepareDbProfileDTO>;
  updateProfile(id: number, input: Partial<PrepareDbProfileDTO>): Promise<PrepareDbProfileDTO>;
  deleteProfile(id: number): Promise<void>;
  setActiveProfile(id: number): Promise<PrepareDbProfileDTO>;
  testConnection(input: Partial<PrepareDbProfileDTO>): Promise<void>;
  fetchSchema(options: { tableName: string | null; databaseOverride?: string; dbProfileId?: number; tableProfileId?: number }): Promise<PrepareColumnInfo[]>;
  listTableProfiles(dbProfileId?: number): Promise<PrepareTableProfileSummary[]>;
  getTableProfileById(id: number): Promise<PrepareTableProfileDetail | null>;
  saveTableProfile(options: {
    profileName?: string;
    profileId?: number;
    tableName: string;
    columns: PrepareColumnInfo[];
    fields: PrepareFieldConfig[];
    dbProfileId?: number;
  }): Promise<PrepareTableProfileDetail>;
  applySavedProfile(profileId: number, columns: PrepareColumnInfo[]): Promise<PrepareFieldConfig[]>;
  deleteTableProfile(id: number): Promise<void>;
  previewInsert(input: PrepareGenerationInput): Promise<PrepareGenerationResult>;
  startInsert(input: PrepareGenerationInput, emitEvent: (event: PrepareTaskEvent) => void): Promise<{ taskId: string }>;
  cancelTask(id: string): Promise<boolean>;
  getTask(id: string): Promise<PrepareTaskState | null>;
  listCustomValueLists(valueType?: "string" | "number"): Promise<PrepareCustomValueListDTO[]>;
  createCustomValueListFromCsv(payload: { name: string; valueType: "string" | "number"; csvText: string }): Promise<PrepareCustomValueListDTO>;
  deleteCustomValueList(id: number): Promise<void>;
}

export * from "./Runtime";
