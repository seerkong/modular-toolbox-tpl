import type { PrepareColumnInfo, PrepareFieldConfig, PrepareGenerationInput } from "@app/shared";
import { generateMockValue, validateCounts, ensureFieldConfigs } from "./mockRegistry";

const quoteIdentifier = (name: string) => `\`${name}\``;

const formatValue = (val: any) => {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "number") return `${val}`;
  return `'${String(val).replace(/'/g, "''")}'`;
};

export type BuildResult = { statements: string[]; rowCount: number };

export const buildBatchStatements = (input: PrepareGenerationInput, startIndex: number, batchSize: number): BuildResult => {
  const validConfigs = ensureFieldConfigs(input.columns, input.fieldConfigs);
  const columnList = input.columns.filter((col) => validConfigs.has(col.name));

  const includeColumns = columnList.filter((col) => {
    const cfg = validConfigs.get(col.name)!;
    const { skipInsert } = generateMockValue(cfg.columnTypeKind, cfg.kind, cfg.type, startIndex, col, cfg.extraConfig);
    return !(skipInsert && col.isPrimary);
  });

  if (includeColumns.length === 0) {
    throw new Error("No columns available for insert");
  }

  const valueRows: string[] = [];
  for (let i = 0; i < batchSize; i++) {
    const rowValues: string[] = [];
    for (const col of includeColumns) {
      const cfg = validConfigs.get(col.name)!;
      const { value, skipInsert } = generateMockValue(cfg.columnTypeKind, cfg.kind, cfg.type, startIndex + i, col, cfg.extraConfig);
      rowValues.push(formatValue(skipInsert ? null : value));
    }
    valueRows.push(`(${rowValues.join(", ")})`);
  }

  const colsSql = includeColumns.map((c) => quoteIdentifier(c.name)).join(", ");
  const statement = `INSERT INTO ${quoteIdentifier(input.tableName)} (${colsSql}) VALUES ${valueRows.join(", ")};`;

  return { statements: [statement], rowCount: batchSize };
};

export const generatePreviewStatements = (input: PrepareGenerationInput, maxRows: number) => {
  validateCounts(input);
  const statements: string[] = [];
  const events: string[] = [];
  let generated = 0;
  while (generated < input.totalRows && statements.length < maxRows) {
    const currentBatch = Math.min(input.batchSize, input.totalRows - generated);
    const { statements: batchStatements, rowCount } = buildBatchStatements(input, generated, currentBatch);
    for (const stmt of batchStatements) {
      if (statements.length < maxRows) statements.push(stmt);
    }
    generated += rowCount;
    events.push(`Prepared rows ${generated}/${input.totalRows}`);
  }
  return { statements, events };
};

export const validateGenerationInput = (input: PrepareGenerationInput) => validateCounts(input);
