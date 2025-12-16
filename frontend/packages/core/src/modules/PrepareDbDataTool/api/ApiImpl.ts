import { injectable } from "inversify";
import {
  ApiResponse,
  PrepareDbDataToolApi,
  PrepareDbDataToolWsPath,
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
import type { PrepareDbDataApi, PrepareDbDataRuntime, ProgressMessageHandler } from "../contract";

@injectable()
export class PrepareDbDataApiImpl implements PrepareDbDataApi {
  async listProfiles(runtime: PrepareDbDataRuntime): Promise<PrepareDbProfileDTO[]> {
    const res = await this.request<ApiResponse<PrepareDbProfileDTO[]>>(runtime, {
      url: PrepareDbDataToolApi.ListDbProfiles,
      method: "GET",
    });
    return this.unwrap(res);
  }

  async createProfile(runtime: PrepareDbDataRuntime, input: Partial<PrepareDbProfileDTO>): Promise<PrepareDbProfileDTO> {
    const res = await this.request<ApiResponse<PrepareDbProfileDTO>>(runtime, {
      url: PrepareDbDataToolApi.ListDbProfiles,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return this.unwrap(res);
  }

  async updateProfile(runtime: PrepareDbDataRuntime, id: number, input: Partial<PrepareDbProfileDTO>): Promise<PrepareDbProfileDTO> {
    const res = await this.request<ApiResponse<PrepareDbProfileDTO>>(runtime, {
      url: PrepareDbDataToolApi.DbProfileById.replace(":id", String(id)),
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return this.unwrap(res);
  }

  async deleteProfile(runtime: PrepareDbDataRuntime, id: number): Promise<void> {
    const res = await this.request<ApiResponse<{ ok: boolean }>>(runtime, {
      url: PrepareDbDataToolApi.DbProfileById.replace(":id", String(id)),
      method: "DELETE",
    });
    this.unwrap(res);
  }

  async activateProfile(runtime: PrepareDbDataRuntime, id: number): Promise<PrepareDbProfileDTO> {
    const res = await this.request<ApiResponse<PrepareDbProfileDTO>>(runtime, {
      url: PrepareDbDataToolApi.ActivateDbProfile.replace(":id", String(id)),
      method: "POST",
    });
    return this.unwrap(res);
  }

  async testConnection(runtime: PrepareDbDataRuntime, input: Partial<PrepareDbProfileDTO>): Promise<void> {
    const res = await this.request<ApiResponse<{ ok: boolean }>>(runtime, {
      url: PrepareDbDataToolApi.TestDbProfile,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    this.unwrap(res);
  }

  async fetchSchema(
    runtime: PrepareDbDataRuntime,
    options: { tableName: string | null; databaseOverride?: string; dbProfileId?: number; tableProfileId?: number }
  ): Promise<PrepareColumnInfo[]> {
    const res = await this.request<ApiResponse<{ columns: PrepareColumnInfo[] }>>(runtime, {
      url: PrepareDbDataToolApi.FetchSchema,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tableName: options.tableName,
        database: options.databaseOverride,
        dbProfileId: options.dbProfileId,
        tableProfileId: options.tableProfileId,
      }),
    });
    const data = this.unwrap(res);
    return data.columns;
  }

  async listTableProfiles(runtime: PrepareDbDataRuntime, dbProfileId?: number): Promise<PrepareTableProfileSummary[]> {
    const url =
      typeof dbProfileId === "number"
        ? `${PrepareDbDataToolApi.ListTableProfiles}?dbProfileId=${encodeURIComponent(dbProfileId)}`
        : PrepareDbDataToolApi.ListTableProfiles;
    const res = await this.request<ApiResponse<PrepareTableProfileSummary[]>>(runtime, {
      url,
      method: "GET",
    });
    return this.unwrap(res);
  }

  async getTableProfile(runtime: PrepareDbDataRuntime, id: number): Promise<PrepareTableProfileDetail | null> {
    const res = await this.request<ApiResponse<{ profile: PrepareTableProfileDetail }>>(runtime, {
      url: PrepareDbDataToolApi.TableProfileDetail,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = this.unwrap(res);
    return data.profile ?? null;
  }

  async saveTableProfile(
    runtime: PrepareDbDataRuntime,
    payload: {
      profileName?: string;
      profileId?: number;
      tableName: string;
      columns: PrepareColumnInfo[];
      fields: PrepareFieldConfig[];
      dbProfileId?: number;
    }
  ): Promise<PrepareTableProfileDetail> {
    const res = await this.request<ApiResponse<{ profile: PrepareTableProfileDetail }>>(runtime, {
      url: PrepareDbDataToolApi.SaveTableProfile,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = this.unwrap(res);
    return data.profile;
  }

  async applyTableProfile(runtime: PrepareDbDataRuntime, profileId: number, columns: PrepareColumnInfo[]): Promise<PrepareFieldConfig[]> {
    const res = await this.request<ApiResponse<{ fields: PrepareFieldConfig[] }>>(runtime, {
      url: PrepareDbDataToolApi.ApplyTableProfile,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId, columns }),
    });
    const data = this.unwrap(res);
    return data.fields ?? [];
  }

  async deleteTableProfile(runtime: PrepareDbDataRuntime, id: number): Promise<void> {
    const res = await this.request<ApiResponse<{ ok: boolean }>>(runtime, {
      url: PrepareDbDataToolApi.TableProfileById.replace(":id", String(id)),
      method: "DELETE",
    });
    this.unwrap(res);
  }

  async listCustomValueLists(runtime: PrepareDbDataRuntime, valueType?: PrepareValueListType): Promise<PrepareCustomValueListDTO[]> {
    const url =
      typeof valueType === "string"
        ? `${PrepareDbDataToolApi.ListCustomValueLists}?valueType=${encodeURIComponent(valueType)}`
        : PrepareDbDataToolApi.ListCustomValueLists;
    const res = await this.request<ApiResponse<PrepareCustomValueListDTO[]>>(runtime, {
      url,
      method: "GET",
    });
    return this.unwrap(res);
  }

  async createCustomValueList(
    runtime: PrepareDbDataRuntime,
    payload: { name: string; valueType: PrepareValueListType; csvText: string }
  ): Promise<PrepareCustomValueListDTO> {
    const res = await this.request<ApiResponse<PrepareCustomValueListDTO>>(runtime, {
      url: PrepareDbDataToolApi.CreateCustomValueList,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return this.unwrap(res);
  }

  async deleteCustomValueList(runtime: PrepareDbDataRuntime, id: number): Promise<void> {
    const res = await this.request<ApiResponse<{ ok: boolean }>>(runtime, {
      url: PrepareDbDataToolApi.DeleteCustomValueList.replace(":id", String(id)),
      method: "DELETE",
    });
    this.unwrap(res);
  }

  async previewInsert(runtime: PrepareDbDataRuntime, input: PrepareGenerationInput): Promise<PrepareGenerationResult> {
    const res = await this.request<ApiResponse<PrepareGenerationResult>>(runtime, {
      url: PrepareDbDataToolApi.PreviewInsert,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return this.unwrap(res);
  }

  async executeInsert(runtime: PrepareDbDataRuntime, input: PrepareGenerationInput): Promise<{ taskId: string }> {
    const res = await this.request<ApiResponse<{ taskId: string }>>(runtime, {
      url: PrepareDbDataToolApi.ExecuteInsert,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return this.unwrap(res);
  }

  async cancelTask(runtime: PrepareDbDataRuntime, taskId: string): Promise<void> {
    const res = await this.request<ApiResponse<{ ok: boolean }>>(runtime, {
      url: PrepareDbDataToolApi.CancelInsert.replace(":id", taskId),
      method: "POST",
    });
    this.unwrap(res);
  }

  async getTask(runtime: PrepareDbDataRuntime, taskId: string): Promise<PrepareTaskState | null> {
    const res = await this.request<ApiResponse<{ task: PrepareTaskState }>>(runtime, {
      url: PrepareDbDataToolApi.TaskStatus.replace(":id", taskId),
      method: "GET",
    });
    const data = this.unwrap(res);
    return data.task ?? null;
  }

  connectProgressSocket(runtime: PrepareDbDataRuntime, onMessage: ProgressMessageHandler): () => void {
    const url = this.buildWsUrl(runtime);
    const ws = new WebSocket(url);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.batch && Array.isArray(data.events)) {
          (data.events as PrepareTaskEvent[]).forEach(onMessage);
        } else {
          onMessage(data as PrepareTaskEvent);
        }
      } catch {
        // ignore malformed
      }
    };

    return () => {
      try {
        ws.close();
      } catch {
        // ignore
      }
    };
  }

  private async request<T>(runtime: PrepareDbDataRuntime, req: { url: string; method: string; headers?: Record<string, string>; body?: any }) {
    return runtime.actorMesh.infra.httpClient.request<T>({
      url: req.url,
      method: req.method,
      headers: req.headers,
      body: req.body,
    });
  }

  private unwrap<T>(res: { ok: boolean; data: any }): T {
    if (res.ok && (res.data?.code == 0)) return res.data.data as T;
    throw new Error(res.data?.error || res.data?.message || "Request failed");
  }

  private buildWsUrl(runtime: PrepareDbDataRuntime) {
    const base = this.resolveWsBase(runtime);
    if (base.includes(PrepareDbDataToolWsPath)) return base;
    const normalizedBase = base.replace(/\/$/, "");
    const path = normalizedBase.endsWith("/ws")
      ? PrepareDbDataToolWsPath.replace(/^\/ws/, "")
      : PrepareDbDataToolWsPath;
    return `${normalizedBase}${path}`;
  }

  private resolveWsBase(runtime: PrepareDbDataRuntime) {
    const moduleConfig = runtime.config.modules.PrepareDbDataTool;
    if (moduleConfig?.wsBaseUrl) {
      return moduleConfig.wsBaseUrl.replace(/\/$/, "");
    }

    const env = this.safeImportMetaEnv();
    const envWsUrl = env?.VITE_WS_URL as string | undefined;
    if (envWsUrl) {
      return envWsUrl.replace(/\/$/, "");
    }

    if (typeof window === "undefined") {
      throw new Error("Cannot derive WebSocket URL without window or wsBaseUrl");
    }

    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const defaultDevPort = env?.VITE_BACKEND_PORT || "4000";
    const isDev = !!env?.DEV || window.location.port === "5173";
    const port = isDev ? defaultDevPort : window.location.port;
    const portSegment = port ? `:${port}` : "";
    return `${protocol}://${window.location.hostname}${portSegment}`;
  }

  private safeImportMetaEnv(): Record<string, any> | undefined {
    try {
      return (import.meta as any).env;
    } catch {
      return undefined;
    }
  }
}
