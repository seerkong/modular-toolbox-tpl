import { describe, expect, it, vi } from "vitest";
import type {
  PrepareDbProfileDTO,
  PrepareTableProfileSummary,
  PrepareGenerationInput,
  PrepareGenerationResult,
  PrepareTaskEvent,
} from "@app/shared";
import type { PrepareDbDataApi, PrepareDbDataRuntime } from "@frontend/core";
import { PrepareDbDataController } from "../src/modules/PrepareDbDataTool/controller/PrepareDbDataController";

// ============================================================================
// Mock Data Fixtures
// ============================================================================

const mockProfiles: PrepareDbProfileDTO[] = [
  { id: 1, name: "dev-db", host: "localhost", port: 3306, username: "root", database: "test", active: true },
];

const mockTableProfiles: PrepareTableProfileSummary[] = [
  {
    id: 1,
    profileName: "users-profile",
    tableName: "users",
    columnSummaries: { id: "number", name: "string" },
    dbProfileId: 1,
    isComplete: true,
  },
];

const mockGenerationInput: PrepareGenerationInput = {
  tableName: "users",
  totalRows: 100,
  batchSize: 10,
  columns: [{ name: "id", rawType: "int", classification: "number", isPrimary: true }],
  fieldConfigs: [{ columnName: "id", columnTypeKind: "number", kind: "IdGenerator", type: "snowflake" }],
  dbProfileId: 1,
};

const mockGenerationResult: PrepareGenerationResult = {
  statements: ["INSERT INTO users (id) VALUES (1);"],
  events: ["Generated 1 row"],
};

// ============================================================================
// Mock API Factory
// ============================================================================

interface MockApiCall {
  method: string;
  args: any[];
}

const createMockApi = () => {
  const calls: MockApiCall[] = [];

  const api: PrepareDbDataApi = {
    listProfiles: vi.fn(async (runtime: PrepareDbDataRuntime) => {
      calls.push({ method: "listProfiles", args: [runtime] });
      return mockProfiles;
    }),

    createProfile: vi.fn(),
    updateProfile: vi.fn(),
    deleteProfile: vi.fn(),
    activateProfile: vi.fn(),
    testConnection: vi.fn(),
    fetchSchema: vi.fn(),

    listTableProfiles: vi.fn(async (runtime: PrepareDbDataRuntime, dbProfileId?: number) => {
      calls.push({ method: "listTableProfiles", args: [runtime, dbProfileId] });
      return mockTableProfiles;
    }),

    getTableProfile: vi.fn(),
    saveTableProfile: vi.fn(),
    applyTableProfile: vi.fn(),
    deleteTableProfile: vi.fn(),

    listCustomValueLists: vi.fn(async (runtime: PrepareDbDataRuntime, valueType?: "string" | "number") => {
      calls.push({ method: "listCustomValueLists", args: [runtime, valueType] });
      return [];
    }),
    createCustomValueList: vi.fn(async (runtime: PrepareDbDataRuntime, payload: any) => {
      calls.push({ method: "createCustomValueList", args: [runtime, payload] });
      return { id: 1, name: "list", valueType: "string", values: [], itemCount: 0 };
    }),
    deleteCustomValueList: vi.fn(async (runtime: PrepareDbDataRuntime, id: number) => {
      calls.push({ method: "deleteCustomValueList", args: [runtime, id] });
    }),

    previewInsert: vi.fn(async (runtime: PrepareDbDataRuntime, input: PrepareGenerationInput) => {
      calls.push({ method: "previewInsert", args: [runtime, input] });
      return mockGenerationResult;
    }),

    executeInsert: vi.fn(async (runtime: PrepareDbDataRuntime, input: PrepareGenerationInput) => {
      calls.push({ method: "executeInsert", args: [runtime, input] });
      return { taskId: "task-123" };
    }),

    cancelTask: vi.fn(),
    getTask: vi.fn(),

    connectProgressSocket: vi.fn((runtime: PrepareDbDataRuntime, onMessage: (event: PrepareTaskEvent) => void) => {
      calls.push({ method: "connectProgressSocket", args: [runtime, onMessage] });
      return () => {};
    }),
  };

  return { api, calls };
};

const createMockRuntime = (): PrepareDbDataRuntime => ({
  config: {
    modules: {
      PrepareDbDataTool: {},
    },
  },
  actorMesh: {
    infra: {
      httpClient: {
        async request() {
          return { status: 200, ok: true, data: {} };
        },
        async get() {
          return {};
        },
        async post() {
          return {};
        },
        async put() {
          return {};
        },
        async delete() {
          return {};
        },
      },
    },
    modules: {
      PrepareDbDataTool: {
        prepareDbDataApi: {} as PrepareDbDataApi,
      },
    },
  },
});

// ============================================================================
// Tests
// ============================================================================

describe("PrepareDbDataController", () => {
  describe("listProfiles", () => {
    it("delegates to api.listProfiles with runtime", async () => {
      const { api, calls } = createMockApi();
      const controller = new PrepareDbDataController(api);
      const runtime = createMockRuntime();

      const result = await controller.listProfiles(runtime);

      expect(calls).toHaveLength(1);
      expect(calls[0].method).toBe("listProfiles");
      expect(calls[0].args[0]).toBe(runtime);
      expect(result).toEqual(mockProfiles);
    });
  });

  describe("listTableProfiles", () => {
    it("delegates to api.listTableProfiles without dbProfileId", async () => {
      const { api, calls } = createMockApi();
      const controller = new PrepareDbDataController(api);
      const runtime = createMockRuntime();

      const result = await controller.listTableProfiles(runtime);

      expect(calls).toHaveLength(1);
      expect(calls[0].method).toBe("listTableProfiles");
      expect(calls[0].args[0]).toBe(runtime);
      expect(calls[0].args[1]).toBeUndefined();
      expect(result).toEqual(mockTableProfiles);
    });

    it("delegates to api.listTableProfiles with dbProfileId", async () => {
      const { api, calls } = createMockApi();
      const controller = new PrepareDbDataController(api);
      const runtime = createMockRuntime();

      const result = await controller.listTableProfiles(runtime, 5);

      expect(calls).toHaveLength(1);
      expect(calls[0].method).toBe("listTableProfiles");
      expect(calls[0].args[0]).toBe(runtime);
      expect(calls[0].args[1]).toBe(5);
      expect(result).toEqual(mockTableProfiles);
    });
  });

  describe("custom value lists", () => {
    it("delegates listCustomValueLists with optional filter", async () => {
      const { api, calls } = createMockApi();
      const controller = new PrepareDbDataController(api);
      const runtime = createMockRuntime();

      await controller.listCustomValueLists(runtime, "number");

      expect(calls).toHaveLength(1);
      expect(calls[0].method).toBe("listCustomValueLists");
      expect(calls[0].args[0]).toBe(runtime);
      expect(calls[0].args[1]).toBe("number");
    });

    it("delegates create and delete custom value lists", async () => {
      const { api, calls } = createMockApi();
      const controller = new PrepareDbDataController(api);
      const runtime = createMockRuntime();

      await controller.createCustomValueList(runtime, { name: "cities", valueType: "string", csvText: "a\nb" });
      await controller.deleteCustomValueList(runtime, 7);

      expect(calls.map((c) => c.method)).toEqual(["createCustomValueList", "deleteCustomValueList"]);
      expect(calls[0].args[0]).toBe(runtime);
      expect(calls[0].args[1]).toMatchObject({ name: "cities" });
      expect(calls[1].args[1]).toBe(7);
    });
  });

  describe("preview", () => {
    it("delegates to api.previewInsert with payload", async () => {
      const { api, calls } = createMockApi();
      const controller = new PrepareDbDataController(api);
      const runtime = createMockRuntime();

      const result = await controller.preview(runtime, mockGenerationInput);

      expect(calls).toHaveLength(1);
      expect(calls[0].method).toBe("previewInsert");
      expect(calls[0].args[0]).toBe(runtime);
      expect(calls[0].args[1]).toEqual(mockGenerationInput);
      expect(result).toEqual(mockGenerationResult);
    });
  });

  describe("execute", () => {
    it("delegates to api.executeInsert and returns taskId", async () => {
      const { api, calls } = createMockApi();
      const controller = new PrepareDbDataController(api);
      const runtime = createMockRuntime();

      const result = await controller.execute(runtime, mockGenerationInput);

      expect(calls).toHaveLength(1);
      expect(calls[0].method).toBe("executeInsert");
      expect(calls[0].args[0]).toBe(runtime);
      expect(calls[0].args[1]).toEqual(mockGenerationInput);
      expect(result.taskId).toBe("task-123");
    });
  });

  describe("subscribeProgress", () => {
    it("delegates to api.connectProgressSocket with onEvent callback", () => {
      const { api, calls } = createMockApi();
      const controller = new PrepareDbDataController(api);
      const runtime = createMockRuntime();
      const onEvent = vi.fn();

      const unsubscribe = controller.subscribeProgress(runtime, onEvent);

      expect(calls).toHaveLength(1);
      expect(calls[0].method).toBe("connectProgressSocket");
      expect(calls[0].args[0]).toBe(runtime);
      expect(calls[0].args[1]).toBe(onEvent);
      expect(typeof unsubscribe).toBe("function");
    });

    it("returns unsubscribe function from api", () => {
      const mockUnsubscribe = vi.fn();
      const api = createMockApi().api;
      (api.connectProgressSocket as any).mockReturnValue(mockUnsubscribe);

      const controller = new PrepareDbDataController(api);
      const runtime = createMockRuntime();

      const unsubscribe = controller.subscribeProgress(runtime, () => {});

      expect(unsubscribe).toBe(mockUnsubscribe);
    });
  });
});
