import { afterEach, describe, expect, it, vi } from "vitest";
import "reflect-metadata";
import {
  ApiResponse,
  PrepareDbDataToolApi,
  PrepareDbDataToolWsPath,
  PrepareDbProfileDTO,
  PrepareColumnInfo,
  PrepareFieldConfig,
  PrepareTableProfileSummary,
  PrepareTableProfileDetail,
  PrepareGenerationInput,
  PrepareGenerationResult,
  PrepareTaskState,
  PrepareCustomValueListDTO,
} from "@app/shared";
import type { HttpClient, HttpRequest, HttpResponse } from "../src/http";
import { PrepareDbDataApiImpl } from "../src/modules/PrepareDbDataTool/api/ApiImpl";
import type { PrepareDbDataRuntime } from "../src/modules/PrepareDbDataTool/contract";

// ============================================================================
// Mock Data Fixtures
// ============================================================================

const mockProfiles: PrepareDbProfileDTO[] = [
  { id: 1, name: "dev-db", host: "localhost", port: 3306, username: "root", database: "test", active: true },
  { id: 2, name: "prod-db", host: "prod.example.com", port: 3306, username: "app", database: "prod", active: false },
];

const mockColumns: PrepareColumnInfo[] = [
  { name: "id", rawType: "int", classification: "number", isPrimary: true },
  { name: "name", rawType: "varchar(255)", classification: "string", isPrimary: false },
  { name: "email", rawType: "varchar(255)", classification: "string", isPrimary: false },
];

const mockFields: PrepareFieldConfig[] = [
  { columnName: "id", columnTypeKind: "number", kind: "IdGenerator", type: "snowflake" },
  { columnName: "name", columnTypeKind: "string", kind: "RandomIn", type: "name" },
];

const mockTableProfileSummary: PrepareTableProfileSummary = {
  id: 1,
  profileName: "users-profile",
  tableName: "users",
  columnSummaries: { id: "number", name: "string" },
  dbProfileId: 1,
  isComplete: true,
};

const mockTableProfileDetail: PrepareTableProfileDetail = {
  ...mockTableProfileSummary,
  fields: mockFields,
};

const mockTaskState: PrepareTaskState = {
  id: "task-123",
  total: 100,
  completed: 50,
  failed: 0,
  status: "running",
};

const mockGenerationResult: PrepareGenerationResult = {
  statements: ["INSERT INTO users (id, name) VALUES (1, 'Alice');"],
  events: ["Generated 1 row"],
};

const mockCustomLists: PrepareCustomValueListDTO[] = [
  { id: 9, name: "names", valueType: "string", values: ["alice", "bob"], itemCount: 2 },
];

// ============================================================================
// Mock HttpClient Factory
// ============================================================================

type RequestHandler = (req: HttpRequest) => HttpResponse<any>;

const wrapSuccess = <T>(data: T): HttpResponse<ApiResponse<T>> => ({
  status: 200,
  ok: true,
  data: { code: 0, data },
});

const wrapError = (error: string): HttpResponse<ApiResponse<any>> => ({
  status: 400,
  ok: false,
  data: { code: 1, error },
});

const createMockHttpClient = (handler: RequestHandler): HttpClient => ({
  async request<T>(req: HttpRequest): Promise<HttpResponse<T>> {
    return handler(req) as HttpResponse<T>;
  },
});

const attachRest = (http: HttpClient) =>
  Object.assign(http, {
    get: async <T>(url: string, params?: Record<string, unknown>) => {
      const queryString = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "";
      const res = await http.request<T>({ url: `${url}${queryString}`, method: "GET" });
      return res.data;
    },
    post: async <T>(url: string, data?: unknown) => {
      const res = await http.request<T>({
        url,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: data === undefined ? undefined : JSON.stringify(data),
      });
      return res.data;
    },
    put: async <T>(url: string, data?: unknown) => {
      const res = await http.request<T>({
        url,
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: data === undefined ? undefined : JSON.stringify(data),
      });
      return res.data;
    },
    delete: async <T>(url: string, params?: Record<string, unknown>) => {
      const queryString = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "";
      const res = await http.request<T>({ url: `${url}${queryString}`, method: "DELETE" });
      return res.data;
    },
  });

const createRuntime = (http: HttpClient, wsBaseUrl?: string): PrepareDbDataRuntime => ({
  config: {
    modules: {
      PrepareDbDataTool: {
        wsBaseUrl,
      },
    },
  },
  actorMesh: {
    infra: {
      httpClient: attachRest(http),
    },
    modules: {
      PrepareDbDataTool: {
        prepareDbDataApi: new PrepareDbDataApiImpl(),
      },
    },
  },
});

// ============================================================================
// Tests
// ============================================================================

describe("PrepareDbDataApiImpl", () => {
  const originalWindow = (globalThis as any).window;
  const originalWebSocket = (globalThis as any).WebSocket;

  afterEach(() => {
    (globalThis as any).window = originalWindow;
    (globalThis as any).WebSocket = originalWebSocket;
    vi.restoreAllMocks();
  });

  describe("Profile CRUD Operations", () => {
    it("listProfiles sends GET request and returns profiles", async () => {
      let capturedReq: HttpRequest | null = null;
      const http = createMockHttpClient((req) => {
        capturedReq = req;
        return wrapSuccess(mockProfiles);
      });

      const api = new PrepareDbDataApiImpl();
      const result = await api.listProfiles(createRuntime(http));

      expect(capturedReq?.url).toBe(PrepareDbDataToolApi.ListDbProfiles);
      expect(capturedReq?.method).toBe("GET");
      expect(result).toEqual(mockProfiles);
    });

    it("createProfile sends POST with JSON body", async () => {
      let capturedReq: HttpRequest | null = null;
      const http = createMockHttpClient((req) => {
        capturedReq = req;
        return wrapSuccess(mockProfiles[0]);
      });

      const input = { name: "new-db", host: "localhost", port: 3306, username: "root" };
      const api = new PrepareDbDataApiImpl();
      const result = await api.createProfile(createRuntime(http), input);

      expect(capturedReq?.url).toBe(PrepareDbDataToolApi.ListDbProfiles);
      expect(capturedReq?.method).toBe("POST");
      expect(capturedReq?.headers?.["Content-Type"]).toBe("application/json");
      expect(JSON.parse(capturedReq?.body)).toEqual(input);
      expect(result).toEqual(mockProfiles[0]);
    });

    it("updateProfile sends PUT with path param and JSON body", async () => {
      let capturedReq: HttpRequest | null = null;
      const http = createMockHttpClient((req) => {
        capturedReq = req;
        return wrapSuccess(mockProfiles[0]);
      });

      const input = { name: "updated-db" };
      const api = new PrepareDbDataApiImpl();
      const result = await api.updateProfile(createRuntime(http), 1, input);

      expect(capturedReq?.url).toBe("/api/prepare-db-data/db-profiles/1");
      expect(capturedReq?.method).toBe("PUT");
      expect(JSON.parse(capturedReq?.body)).toEqual(input);
      expect(result).toEqual(mockProfiles[0]);
    });

    it("deleteProfile sends DELETE with path param", async () => {
      let capturedReq: HttpRequest | null = null;
      const http = createMockHttpClient((req) => {
        capturedReq = req;
        return wrapSuccess({ ok: true });
      });

      const api = new PrepareDbDataApiImpl();
      await api.deleteProfile(createRuntime(http), 2);

      expect(capturedReq?.url).toBe("/api/prepare-db-data/db-profiles/2");
      expect(capturedReq?.method).toBe("DELETE");
    });

    it("activateProfile sends POST with path param", async () => {
      let capturedReq: HttpRequest | null = null;
      const activatedProfile = { ...mockProfiles[1], active: true };
      const http = createMockHttpClient((req) => {
        capturedReq = req;
        return wrapSuccess(activatedProfile);
      });

      const api = new PrepareDbDataApiImpl();
      const result = await api.activateProfile(createRuntime(http), 2);

      expect(capturedReq?.url).toBe("/api/prepare-db-data/db-profiles/2/activate");
      expect(capturedReq?.method).toBe("POST");
      expect(result.active).toBe(true);
    });

    it("testConnection sends POST with connection params", async () => {
      let capturedReq: HttpRequest | null = null;
      const http = createMockHttpClient((req) => {
        capturedReq = req;
        return wrapSuccess({ ok: true });
      });

      const input = { host: "localhost", port: 3306, username: "root", password: "secret" };
      const api = new PrepareDbDataApiImpl();
      await api.testConnection(createRuntime(http), input);

      expect(capturedReq?.url).toBe(PrepareDbDataToolApi.TestDbProfile);
      expect(capturedReq?.method).toBe("POST");
      expect(JSON.parse(capturedReq?.body)).toEqual(input);
    });
  });

  describe("Schema Operations", () => {
    it("fetchSchema sends POST with table options and extracts columns", async () => {
      let capturedReq: HttpRequest | null = null;
      const http = createMockHttpClient((req) => {
        capturedReq = req;
        return wrapSuccess({ columns: mockColumns });
      });

      const api = new PrepareDbDataApiImpl();
      const result = await api.fetchSchema(createRuntime(http), {
        tableName: "users",
        databaseOverride: "testdb",
        dbProfileId: 1,
        tableProfileId: 10,
      });

      expect(capturedReq?.url).toBe(PrepareDbDataToolApi.FetchSchema);
      expect(capturedReq?.method).toBe("POST");
      const body = JSON.parse(capturedReq?.body);
      expect(body.tableName).toBe("users");
      expect(body.database).toBe("testdb");
      expect(body.dbProfileId).toBe(1);
      expect(body.tableProfileId).toBe(10);
      expect(result).toEqual(mockColumns);
    });

    it("fetchSchema handles null tableName", async () => {
      let capturedReq: HttpRequest | null = null;
      const http = createMockHttpClient((req) => {
        capturedReq = req;
        return wrapSuccess({ columns: [] });
      });

      const api = new PrepareDbDataApiImpl();
      await api.fetchSchema(createRuntime(http), { tableName: null });

      const body = JSON.parse(capturedReq?.body);
      expect(body.tableName).toBe(null);
    });
  });

  describe("Table Profile Operations", () => {
    it("listTableProfiles sends GET without query param when dbProfileId is undefined", async () => {
      let capturedReq: HttpRequest | null = null;
      const http = createMockHttpClient((req) => {
        capturedReq = req;
        return wrapSuccess([mockTableProfileSummary]);
      });

      const api = new PrepareDbDataApiImpl();
      const result = await api.listTableProfiles(createRuntime(http));

      expect(capturedReq?.url).toBe(PrepareDbDataToolApi.ListTableProfiles);
      expect(capturedReq?.method).toBe("GET");
      expect(result).toEqual([mockTableProfileSummary]);
    });

    it("listTableProfiles appends query param when dbProfileId is provided", async () => {
      let capturedReq: HttpRequest | null = null;
      const http = createMockHttpClient((req) => {
        capturedReq = req;
        return wrapSuccess([mockTableProfileSummary]);
      });

      const api = new PrepareDbDataApiImpl();
      await api.listTableProfiles(createRuntime(http), 5);

      expect(capturedReq?.url).toBe(`${PrepareDbDataToolApi.ListTableProfiles}?dbProfileId=5`);
    });

    it("getTableProfile sends POST with id and returns profile", async () => {
      let capturedReq: HttpRequest | null = null;
      const http = createMockHttpClient((req) => {
        capturedReq = req;
        return wrapSuccess({ profile: mockTableProfileDetail });
      });

      const api = new PrepareDbDataApiImpl();
      const result = await api.getTableProfile(createRuntime(http), 1);

      expect(capturedReq?.url).toBe(PrepareDbDataToolApi.TableProfileDetail);
      expect(capturedReq?.method).toBe("POST");
      expect(JSON.parse(capturedReq?.body)).toEqual({ id: 1 });
      expect(result).toEqual(mockTableProfileDetail);
    });

    it("getTableProfile returns null when profile not found", async () => {
      const http = createMockHttpClient(() => wrapSuccess({ profile: undefined }));

      const api = new PrepareDbDataApiImpl();
      const result = await api.getTableProfile(createRuntime(http), 999);

      expect(result).toBe(null);
    });

    it("saveTableProfile sends POST with full payload", async () => {
      let capturedReq: HttpRequest | null = null;
      const http = createMockHttpClient((req) => {
        capturedReq = req;
        return wrapSuccess({ profile: mockTableProfileDetail });
      });

      const payload = {
        profileName: "new-profile",
        tableName: "users",
        columns: mockColumns,
        fields: mockFields,
        dbProfileId: 1,
      };

      const api = new PrepareDbDataApiImpl();
      const result = await api.saveTableProfile(createRuntime(http), payload);

      expect(capturedReq?.url).toBe(PrepareDbDataToolApi.SaveTableProfile);
      expect(capturedReq?.method).toBe("POST");
      expect(JSON.parse(capturedReq?.body)).toEqual(payload);
      expect(result).toEqual(mockTableProfileDetail);
    });

    it("applyTableProfile sends POST with profileId and columns", async () => {
      let capturedReq: HttpRequest | null = null;
      const http = createMockHttpClient((req) => {
        capturedReq = req;
        return wrapSuccess({ fields: mockFields });
      });

      const api = new PrepareDbDataApiImpl();
      const result = await api.applyTableProfile(createRuntime(http), 1, mockColumns);

      expect(capturedReq?.url).toBe(PrepareDbDataToolApi.ApplyTableProfile);
      expect(capturedReq?.method).toBe("POST");
      const body = JSON.parse(capturedReq?.body);
      expect(body.profileId).toBe(1);
      expect(body.columns).toEqual(mockColumns);
      expect(result).toEqual(mockFields);
    });

    it("applyTableProfile returns empty array when fields undefined", async () => {
      const http = createMockHttpClient(() => wrapSuccess({ fields: undefined }));

      const api = new PrepareDbDataApiImpl();
      const result = await api.applyTableProfile(createRuntime(http), 1, mockColumns);

      expect(result).toEqual([]);
    });

    it("deleteTableProfile sends DELETE with path param", async () => {
      let capturedReq: HttpRequest | null = null;
      const http = createMockHttpClient((req) => {
        capturedReq = req;
        return wrapSuccess({ ok: true });
      });

      const api = new PrepareDbDataApiImpl();
      await api.deleteTableProfile(createRuntime(http), 5);

      expect(capturedReq?.url).toBe("/api/prepare-db-data/table-profiles/5");
      expect(capturedReq?.method).toBe("DELETE");
    });
  });

  describe("Custom list operations", () => {
    it("listCustomValueLists sends GET with optional type filter", async () => {
      let capturedReq: HttpRequest | null = null;
      const http = createMockHttpClient((req) => {
        capturedReq = req;
        return wrapSuccess(mockCustomLists);
      });

      const api = new PrepareDbDataApiImpl();
      const result = await api.listCustomValueLists(createRuntime(http), "string");

      expect(capturedReq?.url).toBe(`${PrepareDbDataToolApi.ListCustomValueLists}?valueType=string`);
      expect(capturedReq?.method).toBe("GET");
      expect(result).toEqual(mockCustomLists);
    });

    it("createCustomValueList sends POST with CSV payload", async () => {
      let capturedReq: HttpRequest | null = null;
      const http = createMockHttpClient((req) => {
        capturedReq = req;
        return wrapSuccess(mockCustomLists[0]);
      });

      const api = new PrepareDbDataApiImpl();
      const payload = { name: "names", valueType: "string" as const, csvText: "alice\nbob" };
      const result = await api.createCustomValueList(createRuntime(http), payload);

      expect(capturedReq?.url).toBe(PrepareDbDataToolApi.CreateCustomValueList);
      expect(capturedReq?.method).toBe("POST");
      expect(JSON.parse(capturedReq?.body)).toEqual(payload);
      expect(result).toEqual(mockCustomLists[0]);
    });

    it("deleteCustomValueList sends DELETE with path param", async () => {
      let capturedReq: HttpRequest | null = null;
      const http = createMockHttpClient((req) => {
        capturedReq = req;
        return wrapSuccess({ ok: true });
      });

      const api = new PrepareDbDataApiImpl();
      await api.deleteCustomValueList(createRuntime(http), 9);

      expect(capturedReq?.url).toBe("/api/prepare-db-data/custom-lists/9");
      expect(capturedReq?.method).toBe("DELETE");
    });
  });

  describe("Insert Operations", () => {
    const generationInput: PrepareGenerationInput = {
      tableName: "users",
      totalRows: 100,
      batchSize: 10,
      columns: mockColumns,
      fieldConfigs: mockFields,
      dbProfileId: 1,
    };

    it("previewInsert sends POST with generation input", async () => {
      let capturedReq: HttpRequest | null = null;
      const http = createMockHttpClient((req) => {
        capturedReq = req;
        return wrapSuccess(mockGenerationResult);
      });

      const api = new PrepareDbDataApiImpl();
      const result = await api.previewInsert(createRuntime(http), generationInput);

      expect(capturedReq?.url).toBe(PrepareDbDataToolApi.PreviewInsert);
      expect(capturedReq?.method).toBe("POST");
      expect(JSON.parse(capturedReq?.body)).toEqual(generationInput);
      expect(result).toEqual(mockGenerationResult);
    });

    it("executeInsert sends POST and returns taskId", async () => {
      let capturedReq: HttpRequest | null = null;
      const http = createMockHttpClient((req) => {
        capturedReq = req;
        return wrapSuccess({ taskId: "task-456" });
      });

      const api = new PrepareDbDataApiImpl();
      const result = await api.executeInsert(createRuntime(http), generationInput);

      expect(capturedReq?.url).toBe(PrepareDbDataToolApi.ExecuteInsert);
      expect(capturedReq?.method).toBe("POST");
      expect(result.taskId).toBe("task-456");
    });

    it("cancelTask sends POST with path param", async () => {
      let capturedReq: HttpRequest | null = null;
      const http = createMockHttpClient((req) => {
        capturedReq = req;
        return wrapSuccess({ ok: true });
      });

      const api = new PrepareDbDataApiImpl();
      await api.cancelTask(createRuntime(http), "task-789");

      expect(capturedReq?.url).toBe("/api/prepare-db-data/execute/task-789/cancel");
      expect(capturedReq?.method).toBe("POST");
    });

    it("getTask sends GET with path param and returns task state", async () => {
      let capturedReq: HttpRequest | null = null;
      const http = createMockHttpClient((req) => {
        capturedReq = req;
        return wrapSuccess({ task: mockTaskState });
      });

      const api = new PrepareDbDataApiImpl();
      const result = await api.getTask(createRuntime(http), "task-123");

      expect(capturedReq?.url).toBe("/api/prepare-db-data/tasks/task-123");
      expect(capturedReq?.method).toBe("GET");
      expect(result).toEqual(mockTaskState);
    });

    it("getTask returns null when task not found", async () => {
      const http = createMockHttpClient(() => wrapSuccess({ task: undefined }));

      const api = new PrepareDbDataApiImpl();
      const result = await api.getTask(createRuntime(http), "nonexistent");

      expect(result).toBe(null);
    });
  });

  describe("WebSocket progress channel", () => {
    const noopHttp = createMockHttpClient(() => wrapSuccess({ ok: true }));

    const installWsMock = () => {
      const wsInstance: any = { close: vi.fn(), onmessage: null };
      const ctor = vi.fn(() => wsInstance);
      (globalThis as any).WebSocket = ctor;
      return { ctor, wsInstance };
    };

    it("uses runtime.wsBaseUrl when provided", () => {
      (globalThis as any).window = { location: { protocol: "http:", hostname: "localhost", port: "5173" } };
      const { ctor, wsInstance } = installWsMock();

      const api = new PrepareDbDataApiImpl();
      const runtime = createRuntime(noopHttp, "ws://api.example.com:1234/base");
      const cleanup = api.connectProgressSocket(runtime, () => {});
      cleanup();

      expect(ctor).toHaveBeenCalledWith(`ws://api.example.com:1234/base${PrepareDbDataToolWsPath}`);
      expect(wsInstance.close).toHaveBeenCalled();
    });

    it("defaults to backend port 4000 in dev when no wsBaseUrl", () => {
      (globalThis as any).window = { location: { protocol: "http:", hostname: "localhost", port: "5173" } };
      const { ctor } = installWsMock();

      const api = new PrepareDbDataApiImpl();
      api.connectProgressSocket(createRuntime(noopHttp), () => {});

      expect(ctor).toHaveBeenCalledWith(`ws://localhost:4000${PrepareDbDataToolWsPath}`);
    });
  });

  describe("Error Handling", () => {
    it("throws error when response code is not 0", async () => {
      const http = createMockHttpClient(() => ({
        status: 200,
        ok: true,
        data: { code: 1, error: "Connection failed" },
      }));

      const api = new PrepareDbDataApiImpl();
      await expect(api.listProfiles(createRuntime(http))).rejects.toThrow("Connection failed");
    });

    it("throws error when response ok is false", async () => {
      const http = createMockHttpClient(() => wrapError("Server error"));

      const api = new PrepareDbDataApiImpl();
      await expect(api.listProfiles(createRuntime(http))).rejects.toThrow("Server error");
    });

    it("throws generic error when no error message provided", async () => {
      const http = createMockHttpClient(() => ({
        status: 500,
        ok: false,
        data: { code: 1 },
      }));

      const api = new PrepareDbDataApiImpl();
      await expect(api.listProfiles(createRuntime(http))).rejects.toThrow("Request failed");
    });

    it("uses message field when error field is not present", async () => {
      const http = createMockHttpClient(() => ({
        status: 400,
        ok: false,
        data: { code: 1, message: "Validation error" },
      }));

      const api = new PrepareDbDataApiImpl();
      await expect(api.listProfiles(createRuntime(http))).rejects.toThrow("Validation error");
    });
  });
});
