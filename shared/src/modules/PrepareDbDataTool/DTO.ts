export type PrepareColumnKind = "string" | "number" | "unsupported";

export interface PrepareDbProfileDTO {
  id: number;
  name: string;
  host: string;
  port: number;
  username: string;
  password?: string;
  database?: string;
  active: boolean;
}

export interface PrepareColumnInfo {
  name: string;
  rawType: string;
  classification: PrepareColumnKind;
  isPrimary: boolean;
}

export type PrepareMockKind = "IdGenerator" | "SequenceIn" | "RandomIn" | "TimeGenerator" | "Default";

export type PrepareValueListType = "string" | "number";

export interface PrepareCustomValueListDTO {
  id: number;
  name: string;
  valueType: PrepareValueListType;
  values: Array<string | number>;
  itemCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export type PrepareFieldExtraConfig = {
  listId?: number;
  listName?: string;
  listValues?: Array<string | number>;
  valueType?: PrepareValueListType;
} & Record<string, unknown>;

export interface PrepareFieldConfig {
  columnName: string;
  columnTypeKind: "string" | "number";
  kind: PrepareMockKind;
  type: string;
  extraConfig?: PrepareFieldExtraConfig;
  orderIndex?: number;
}

export interface PrepareTableProfileSummary {
  id: number;
  profileName: string;
  tableName: string;
  columnSummaries: Record<string, "string" | "number">;
  dbProfileId: number;
  isComplete: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PrepareTableProfileDetail extends PrepareTableProfileSummary {
  fields: PrepareFieldConfig[];
}

export interface PrepareGenerationInput {
  tableName: string;
  totalRows: number;
  batchSize: number;
  columns: PrepareColumnInfo[];
  fieldConfigs: PrepareFieldConfig[];
  dbProfileId?: number;
  database?: string;
}

export interface PrepareGenerationResult {
  statements: string[];
  events: string[];
}

export type PrepareTaskStatus = "pending" | "running" | "completed" | "failed" | "cancelled";

export interface PrepareTaskProgress {
  status: PrepareTaskStatus;
  completed: number;
  failed: number;
  total: number;
  error?: string;
}

export type PrepareTaskEventType = "log" | "progress" | "status";

export interface PrepareTaskEvent {
  taskId: string;
  type: PrepareTaskEventType;
  message?: string;
  progress?: PrepareTaskProgress;
}

export interface PrepareTaskState {
  id: string;
  total: number;
  completed: number;
  failed: number;
  status: PrepareTaskStatus;
  error?: string;
  cancelRequested?: boolean;
}
