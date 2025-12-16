import { describe, expect, test } from "bun:test";
import type { PrepareColumnInfo, PrepareFieldConfig, PrepareGenerationInput } from "@app/shared";
import { generatePreviewStatements } from "../src/modules/PrepareDbDataTool/logic/sqlBuilder";

describe("generatePreviewStatements", () => {
  test("builds deterministic insert previews from field configs", () => {
    const columns: PrepareColumnInfo[] = [
      { name: "id", rawType: "int", classification: "number", isPrimary: true },
      { name: "name", rawType: "varchar", classification: "string", isPrimary: false },
      { name: "dept", rawType: "varchar", classification: "string", isPrimary: false },
      { name: "flag", rawType: "int", classification: "number", isPrimary: false },
    ];
    const fieldConfigs: PrepareFieldConfig[] = [
      { columnName: "id", columnTypeKind: "number", kind: "IdGenerator", type: "AutoIncrement", extraConfig: {}, orderIndex: 0 },
      { columnName: "name", columnTypeKind: "string", kind: "SequenceIn", type: "BuiltinPersonList", extraConfig: {}, orderIndex: 1 },
      { columnName: "dept", columnTypeKind: "string", kind: "SequenceIn", type: "BuiltinDepartmentList", extraConfig: {}, orderIndex: 2 },
      { columnName: "flag", columnTypeKind: "number", kind: "Default", type: "const_1", extraConfig: {}, orderIndex: 3 },
    ];

    const input: PrepareGenerationInput = {
      tableName: "users",
      totalRows: 2,
      batchSize: 2,
      columns,
      fieldConfigs,
    };

    const { statements, events } = generatePreviewStatements(input, 1);
    expect(statements).toHaveLength(1);
    expect(statements[0]).toBe(
      "INSERT INTO `users` (`name`, `dept`, `flag`) VALUES ('zhangsan', 'dept_1', 1), ('lisi', 'dept_2', 1);"
    );
    expect(events[0]).toBe("Prepared rows 2/2");
  });
});
