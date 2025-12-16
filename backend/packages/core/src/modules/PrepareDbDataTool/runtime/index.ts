import type { PrepareColumnKind } from "@app/shared";

const stringTypes = new Set([
  "char",
  "varchar",
  "text",
  "tinytext",
  "mediumtext",
  "longtext",
  "enum",
  "set",
  "json",
]);

const numberTypes = new Set([
  "int",
  "integer",
  "tinyint",
  "smallint",
  "mediumint",
  "bigint",
  "decimal",
  "numeric",
  "float",
  "double",
]);

export const classifyMySqlType = (dataType: string): PrepareColumnKind => {
  const normalized = dataType.toLowerCase();
  if (stringTypes.has(normalized)) return "string";
  if (numberTypes.has(normalized)) return "number";
  return "unsupported";
};
