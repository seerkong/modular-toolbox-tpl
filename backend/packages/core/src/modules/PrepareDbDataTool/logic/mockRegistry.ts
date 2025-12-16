import crypto from "crypto";
import type { PrepareColumnInfo, PrepareFieldConfig, PrepareGenerationInput, PrepareMockKind } from "@app/shared";

export type ColumnKind = "string" | "number";

type MockGenerator = (args: { rowIndex: number; column: PrepareColumnInfo }) => any;

type RegistryEntry = {
  kind: PrepareMockKind;
  type: string;
  columnKind: ColumnKind;
  generate: MockGenerator;
  skipInsert?: boolean;
};

class MockRegistry {
  private entries: RegistryEntry[] = [];

  register(entry: RegistryEntry) {
    this.entries.push(entry);
  }

  find(columnKind: ColumnKind, kind: PrepareMockKind, type: string): RegistryEntry | undefined {
    return this.entries.find((e) => e.columnKind === columnKind && e.kind === kind && e.type === type);
  }
}

export const registry = new MockRegistry();

const builtInPeople = [
  "zhangsan",
  "lisi",
  "wangwu",
  "zhaoliu"
];
const builtInDepartments = [
  "dept_1",
  "dept_2",
  "dept_3",
  "dept_4",
  "dept_5",
];
const builtInNumIds = [101, 202, 303, 404, 505, 606];

const pad = (value: number, size: number) => value.toString().padStart(size, "0");

function snowflakeId(): string {
  const time = BigInt(Date.now());
  const random = BigInt(crypto.randomInt(0, 1023));
  return (time << 10n | random).toString();
}

function ulid(): string {
  // lightweight ULID-like generator to avoid extra deps
  const now = Date.now();
  const timePart = pad(now, 12);
  const randomPart = crypto.randomBytes(8).toString("hex").slice(0, 12);
  return `${timePart}${randomPart}`.slice(0, 26);
}

function pickSequential<T>(list: T[], index: number): T {
  if (list.length === 0) throw new Error("List is empty");
  return list[index % list.length];
}

function pickRandom<T>(list: T[]): T {
  if (list.length === 0) throw new Error("List is empty");
  const i = Math.floor(Math.random() * list.length);
  return list[i];
}

// String generators
registry.register({
  columnKind: "string",
  kind: "IdGenerator",
  type: "ULID",
  generate: () => ulid(),
});
registry.register({
  columnKind: "string",
  kind: "IdGenerator",
  type: "UUID",
  generate: () => crypto.randomUUID(),
});
registry.register({
  columnKind: "string",
  kind: "IdGenerator",
  type: "SnowflakeId",
  generate: () => snowflakeId(),
});
registry.register({
  columnKind: "string",
  kind: "SequenceIn",
  type: "BuiltinPersonList",
  generate: ({ rowIndex }) => pickSequential(builtInPeople, rowIndex),
});
registry.register({
  columnKind: "string",
  kind: "SequenceIn",
  type: "BuiltinDepartmentList",
  generate: ({ rowIndex }) => pickSequential(builtInDepartments, rowIndex),
});
registry.register({
  columnKind: "string",
  kind: "RandomIn",
  type: "BuiltinPersonList",
  generate: () => pickRandom(builtInPeople),
});
registry.register({
  columnKind: "string",
  kind: "RandomIn",
  type: "BuiltinDepartmentList",
  generate: () => pickRandom(builtInDepartments),
});
registry.register({
  columnKind: "string",
  kind: "Default",
  type: "DbDefault",
  generate: () => null,
  skipInsert: true,
});
registry.register({
  columnKind: "string",
  kind: "Default",
  type: "Null",
  generate: () => null,
});

// Number generators
registry.register({
  columnKind: "number",
  kind: "IdGenerator",
  type: "AutoIncrement",
  generate: () => null,
  skipInsert: true,
});
registry.register({
  columnKind: "number",
  kind: "IdGenerator",
  type: "SnowflakeId",
  generate: () => Number(snowflakeId()),
});
registry.register({
  columnKind: "number",
  kind: "SequenceIn",
  type: "BuiltinNumIdList",
  generate: ({ rowIndex }) => pickSequential(builtInNumIds, rowIndex),
});
registry.register({
  columnKind: "number",
  kind: "RandomIn",
  type: "BuiltinNumIdList",
  generate: () => pickRandom(builtInNumIds),
});
registry.register({
  columnKind: "number",
  kind: "TimeGenerator",
  type: "TimestampSeconds",
  generate: () => Math.floor(Date.now() / 1000),
});
registry.register({
  columnKind: "number",
  kind: "TimeGenerator",
  type: "TimestampMillis",
  generate: () => Date.now(),
});
registry.register({
  columnKind: "number",
  kind: "Default",
  type: "DbDefault",
  generate: () => null,
  skipInsert: true,
});
registry.register({
  columnKind: "number",
  kind: "Default",
  type: "Null",
  generate: () => null,
});
registry.register({
  columnKind: "number",
  kind: "Default",
  type: "const_0",
  generate: () => 0,
});
registry.register({
  columnKind: "number",
  kind: "Default",
  type: "const_1",
  generate: () => 1,
});

export const generateMockValue = (
  columnKind: ColumnKind,
  kind: PrepareMockKind,
  type: string,
  rowIndex: number,
  column: PrepareColumnInfo,
  extraConfig?: PrepareFieldConfig["extraConfig"]
) => {
  if ((kind === "SequenceIn" || kind === "RandomIn") && type === "CustomList") {
    const values = (extraConfig?.listValues ?? []) as Array<string | number>;
    if (!Array.isArray(values) || values.length === 0) {
      throw new Error("CustomList has no values");
    }
    const val = kind === "SequenceIn" ? pickSequential(values, rowIndex) : pickRandom(values);
    return { value: val, skipInsert: false };
  }
  const entry = registry.find(columnKind, kind, type);
  if (!entry) throw new Error(`No generator for ${columnKind}:${kind}:${type}`);
  return {
    value: entry.generate({ rowIndex, column }),
    skipInsert: entry.skipInsert === true,
  };
};

export const validateCounts = (input: PrepareGenerationInput) => {
  if (input.totalRows <= 0) throw new Error("Total rows must be positive");
  if (input.totalRows > 1_000_000) throw new Error("Total rows limit is 1,000,000");
  if (input.batchSize <= 0) throw new Error("Batch size must be positive");
};

export const ensureFieldConfigs = (
  columns: PrepareColumnInfo[],
  fieldConfigs: PrepareFieldConfig[]
): Map<string, PrepareFieldConfig> => {
  const map = new Map<string, PrepareFieldConfig>();
  for (const cfg of fieldConfigs) {
    map.set(cfg.columnName, cfg);
  }
  // ensure entries for every column
  columns.forEach((c) => {
    if (!map.has(c.name)) {
      map.set(c.name, {
        columnName: c.name,
        columnTypeKind: c.classification === "number" ? "number" : "string",
        kind: "" as any,
        type: "",
        orderIndex: 0,
      });
    }
  });
  return map;
};
