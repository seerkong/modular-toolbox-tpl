import fs from "fs/promises";
import path from "path";
import { describe, expect, test } from "bun:test";
import type { PrepareColumnInfo, PrepareFieldConfig } from "@app/shared";
import type { BackendConfig } from "../src/index";
import { createPrepareDbDataDataSource } from "../src/modules/PrepareDbDataTool/datasource";
import { PrepareDbDataServiceImpl } from "../src/modules/PrepareDbDataTool/service/PrepareDbDataService";

const dataDir = path.join(process.cwd(), "testdata");
const bootstrapConfig: BackendConfig = {
  dataDir,
  modules: {
    PrepareDbDataTool: { sqliteFileName: "prepare-db-data-test.sqlite" },
  },
};

const prepareDbPath = path.join(
  bootstrapConfig.dataDir,
  bootstrapConfig.modules.PrepareDbDataTool.sqliteFileName
);

async function resetDbFile() {
  await fs.rm(prepareDbPath, { force: true });
}

describe("PrepareDbDataServiceImpl", () => {
  test("creates and activates profiles", async () => {
    await resetDbFile();
    const dataSource = createPrepareDbDataDataSource(prepareDbPath);
    const service = new PrepareDbDataServiceImpl(dataSource);

    try {
      const created = await service.createProfile({
        name: "local-db",
        host: "127.0.0.1",
        database: "demo",
      });
      expect(created.id).toBeTruthy();

      const list = await service.listProfiles();
      expect(list).toHaveLength(1);
      expect(list[0].name).toBe("local-db");

      const active = await service.setActiveProfile(created.id);
      expect(active.active).toBe(true);

      const updated = await service.listProfiles();
      expect(updated[0].active).toBe(true);

      await expect(fs.stat(prepareDbPath)).resolves.toBeDefined();
    } finally {
      await dataSource.destroy();
    }
  });

  test("saves and reuses table profiles", async () => {
    await resetDbFile();
    const dataSource = createPrepareDbDataDataSource(prepareDbPath);
    const service = new PrepareDbDataServiceImpl(dataSource);

    try {
      const profile = await service.createProfile({ name: "local-db", host: "127.0.0.1" });
      await service.setActiveProfile(profile.id);

      const columns: PrepareColumnInfo[] = [
        { name: "id", rawType: "int", classification: "number", isPrimary: true },
        { name: "name", rawType: "varchar", classification: "string", isPrimary: false },
        { name: "dept", rawType: "varchar", classification: "string", isPrimary: false },
      ];
      const fields: PrepareFieldConfig[] = [
        { columnName: "id", columnTypeKind: "number", kind: "IdGenerator", type: "AutoIncrement", extraConfig: {}, orderIndex: 0 },
        { columnName: "name", columnTypeKind: "string", kind: "SequenceIn", type: "BuiltinPersonList", extraConfig: {}, orderIndex: 1 },
        { columnName: "dept", columnTypeKind: "string", kind: "SequenceIn", type: "BuiltinDepartmentList", extraConfig: {}, orderIndex: 2 },
      ];

      const detail = await service.saveTableProfile({
        profileName: "users",
        tableName: "users",
        columns,
        fields,
        dbProfileId: profile.id,
      });
      expect(detail.isComplete).toBe(true);

      const reused = await service.applySavedProfile(detail.id, columns);
      expect(reused).toHaveLength(3);
      expect(reused[0].columnName).toBe("id");
    } finally {
      await dataSource.destroy();
    }
  });

  test("imports custom lists and generates preview from them", async () => {
    await resetDbFile();
    const dataSource = createPrepareDbDataDataSource(prepareDbPath);
    const service = new PrepareDbDataServiceImpl(dataSource);

    try {
      const profile = await service.createProfile({ name: "local-db", host: "127.0.0.1" });
      await service.setActiveProfile(profile.id);

      const createdList = await service.createCustomValueListFromCsv({
        name: "names",
        valueType: "string",
        csvText: "header\nalice\nbob\ncathy",
      });
      const lists = await service.listCustomValueLists();
      expect(lists.find((l) => l.id === createdList.id)?.itemCount).toBe(3);

      const columns: PrepareColumnInfo[] = [
        { name: "name", rawType: "varchar", classification: "string", isPrimary: false },
      ];
      const fields: PrepareFieldConfig[] = [
        { columnName: "name", columnTypeKind: "string", kind: "SequenceIn", type: "CustomList", extraConfig: { listId: createdList.id }, orderIndex: 0 },
      ];
      const preview = await service.previewInsert({
        tableName: "users",
        totalRows: 2,
        batchSize: 2,
        columns,
        fieldConfigs: fields,
      });
      expect(preview.statements[0]).toContain("alice");
      expect(preview.statements[0]).toContain("bob");

      await service.deleteCustomValueList(createdList.id);
      const afterDelete = await service.listCustomValueLists();
      expect(afterDelete.find((l) => l.id === createdList.id)).toBeUndefined();
    } finally {
      await dataSource.destroy();
    }
  });
});
