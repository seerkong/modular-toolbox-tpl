import mysql from "mysql2/promise";
import { DataSource, In, Repository } from "typeorm";
import {
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
import {
  PrepareDbDataService,
  classifyMySqlType,
  validateGenerationInput,
  generatePreviewStatements,
  buildBatchStatements,
  DbProfileEntity,
  TableProfileEntity,
  FieldMockEntity,
  CustomValueListEntity
} from "@backend/core";
import { ensureSqliteDataSource } from "@backend/mediator/infra/sqlite";
import { cancelTask, createTask, getTask, updateTask } from "./taskStore";
import { emitTaskEvent } from "./wsHub";

export class PrepareDbDataServiceImpl implements PrepareDbDataService {
  private readonly dataSource: DataSource;

  constructor(dataSource: DataSource) {
    this.dataSource = dataSource;
  }

  private async repo<T>(entity: { new (): T }): Promise<Repository<T>> {
    await ensureSqliteDataSource(this.dataSource);
    return this.dataSource.getRepository(entity);
  }

  async listProfiles(): Promise<PrepareDbProfileDTO[]> {
    const repo = await this.repo(DbProfileEntity);
    return repo.find();
  }

  async createProfile(input: Partial<PrepareDbProfileDTO>): Promise<PrepareDbProfileDTO> {
    const repo = await this.repo(DbProfileEntity);
    const profile = repo.create({
      name: input.name ?? "mysql-profile",
      host: input.host ?? "",
      port: input.port ?? 3306,
      username: input.username ?? "root",
      password: input.password ?? "",
      database: input.database ?? "",
      active: false,
    });
    await repo.save(profile);
    return profile;
  }

  async updateProfile(id: number, input: Partial<PrepareDbProfileDTO>): Promise<PrepareDbProfileDTO> {
    const repo = await this.repo(DbProfileEntity);
    const existing = await repo.findOne({ where: { id } });
    if (!existing) throw new Error("Profile not found");
    Object.assign(existing, input);
    await repo.save(existing);
    return existing;
  }

  async deleteProfile(id: number): Promise<void> {
    const repo = await this.repo(DbProfileEntity);
    await repo.delete({ id });
  }

  async setActiveProfile(id: number): Promise<PrepareDbProfileDTO> {
    const repo = await this.repo(DbProfileEntity);
    const profiles = await repo.find();
    await repo.save(profiles.map((p) => ({ ...p, active: p.id === id })));
    const active = await repo.findOne({ where: { id } });
    if (!active) throw new Error("Profile not found");
    return active;
  }

  async testConnection(input: Partial<PrepareDbProfileDTO>): Promise<void> {
    const profile = this.buildProfileFromInput(input);
    const pool = this.createMysqlPool(profile);
    try {
      const conn = await pool.getConnection();
      await conn.ping();
      conn.release();
    } finally {
      await pool.end();
    }
  }

  async fetchSchema(options: { tableName: string | null; databaseOverride?: string; dbProfileId?: number; tableProfileId?: number }): Promise<PrepareColumnInfo[]> {
    let resolvedTableName = options.tableName;
    let resolvedDbProfileId = options.dbProfileId;
    if (options.tableProfileId) {
      const tp = await this.getTableProfileById(options.tableProfileId);
      if (!tp) throw new Error("Table profile not found");
      resolvedTableName = tp.tableName;
      resolvedDbProfileId = tp.dbProfileId;
    }
    if (!resolvedTableName) throw new Error("Table name required");

    const profile = (resolvedDbProfileId ? await this.getProfileById(resolvedDbProfileId) : null) || (await this.getActiveProfile());
    if (!profile) throw new Error("No active database profile");
    const dbToUse = options.databaseOverride || profile.database;
    if (!dbToUse) throw new Error("Database name is required for schema lookup");

    const pool = this.createMysqlPool(profile, dbToUse);
    const conn = await pool.getConnection();
    try {
      const schema = await this.resolveSchema(conn, resolvedTableName, dbToUse);
      const [columns] = await conn.query(
        "SELECT COLUMN_NAME, DATA_TYPE, COLUMN_KEY FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? ORDER BY ORDINAL_POSITION",
        [schema, resolvedTableName]
      );
      if (!Array.isArray(columns) || columns.length === 0) {
        throw new Error("Table not found or has no columns");
      }
      return (columns as any[]).map((col) => {
        const rawType = String(col.DATA_TYPE).toLowerCase();
        const classification = classifyMySqlType(rawType);
        const isPrimary = col.COLUMN_KEY === "PRI";
        return { name: col.COLUMN_NAME, rawType, classification, isPrimary };
      });
    } finally {
      await conn.release();
      await pool.end();
    }
  }

  async listTableProfiles(dbProfileId?: number): Promise<PrepareTableProfileSummary[]> {
    const repo = await this.repo(TableProfileEntity);
    if (dbProfileId) {
      return repo.find({ where: { dbProfileId } });
    }
    return repo.find();
  }

  async getTableProfileById(id: number): Promise<PrepareTableProfileDetail | null> {
    const repo = await this.repo(TableProfileEntity);
    const profile = await repo.findOne({ where: { id }, relations: ["fields"] });
    if (!profile) return null;
    return this.toProfileDetail(profile);
  }

  async saveTableProfile(options: {
    profileName?: string;
    profileId?: number;
    tableName: string;
    columns: PrepareColumnInfo[];
    fields: PrepareFieldConfig[];
    dbProfileId?: number;
  }): Promise<PrepareTableProfileDetail> {
    const active = options.dbProfileId ? await this.getProfileById(options.dbProfileId) : await this.getActiveProfile();
    if (!active) throw new Error("No active database profile");
    await ensureSqliteDataSource(this.dataSource);
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(TableProfileEntity);
      const fieldRepo = manager.getRepository(FieldMockEntity);
      let profile = options.profileId ? await repo.findOne({ where: { id: options.profileId, dbProfileId: active.id } }) : null;

      if (!profile) {
        profile = repo.create({
          profileName: options.profileName || options.tableName,
          tableName: options.tableName,
          dbProfileId: active.id,
          columnSummaries: {},
          isComplete: false,
        });
      }

      profile.columnSummaries = Object.fromEntries(
        options.columns.map((c) => [c.name, c.classification === "number" ? "number" : "string"])
      );
      profile.profileName = options.profileName || profile.profileName || options.tableName;
      profile.isComplete = this.computeCompletion(options.columns, options.fields);
      profile = await repo.save(profile);

      await fieldRepo.delete({ tableProfileId: profile.id });
      const newFields = options.fields.map((f, idx) =>
        fieldRepo.create({
          columnName: f.columnName,
          columnTypeKind: f.columnTypeKind,
          kind: f.kind,
          type: f.type,
          extraConfig: f.extraConfig,
          orderIndex: f.orderIndex ?? idx,
          tableProfileId: profile.id,
        })
      );
      if (newFields.length) {
        await fieldRepo.save(newFields);
      }
      profile.fields = newFields;
      return this.toProfileDetail(profile);
    });
  }

  async applySavedProfile(profileId: number, columns: PrepareColumnInfo[]): Promise<PrepareFieldConfig[]> {
    if (!profileId || Number.isNaN(profileId)) {
      throw new Error("Invalid profileId");
    }
    const repo = await this.repo(TableProfileEntity);
    const profile = await repo.findOne({ where: { id: profileId }, relations: ["fields"] });
    if (!profile) throw new Error("Profile not found");
    const reusable = profile.fields.filter((f) => {
      const targetColumn = columns.find((c) => c.name === f.columnName);
      if (!targetColumn) return false;
      const targetKind = targetColumn.classification === "number" ? "number" : "string";
      return targetKind === f.columnTypeKind;
    });
    return reusable.map((f) => ({
      columnName: f.columnName,
      columnTypeKind: f.columnTypeKind,
      kind: f.kind,
      type: f.type,
      extraConfig: f.extraConfig ?? {},
      orderIndex: f.orderIndex,
    }));
  }

  async previewInsert(input: PrepareGenerationInput): Promise<PrepareGenerationResult> {
    const enriched = await this.enrichGenerationInput(input);
    validateGenerationInput(enriched);
    const { statements, events } = generatePreviewStatements(enriched, 1);
    return { statements, events };
  }

  async deleteTableProfile(id: number): Promise<void> {
    const repo = await this.repo(TableProfileEntity);
    await repo.delete({ id });
  }

  async startInsert(input: PrepareGenerationInput, externalEmit?: (event: PrepareTaskEvent) => void): Promise<{ taskId: string }> {
    const enriched = await this.enrichGenerationInput(input);
    validateGenerationInput(enriched);
    const task = createTask(enriched.totalRows);
    const emit = externalEmit ?? emitTaskEvent;
    emit({ taskId: task.id, type: "status", message: "Task created", progress: task });
    this.runInsertTask(task.id, enriched, emit);
    return { taskId: task.id };
  }

  async cancelTask(id: string): Promise<boolean> {
    const t = cancelTask(id);
    if (t) {
      emitTaskEvent({ taskId: id, type: "status", message: "Task cancelled", progress: { ...t, status: "cancelled" } });
      return true;
    }
    return false;
  }

  async getTask(id: string): Promise<PrepareTaskState | null> {
    return getTask(id);
  }

  // helpers
  private async getProfileById(id: number) {
    const repo = await this.repo(DbProfileEntity);
    return repo.findOne({ where: { id } });
  }

  private async getActiveProfile() {
    const repo = await this.repo(DbProfileEntity);
    const active = await repo.findOne({ where: { active: true } });
    return active ?? null;
  }

  async listCustomValueLists(valueType?: PrepareValueListType): Promise<PrepareCustomValueListDTO[]> {
    const repo = await this.repo(CustomValueListEntity);
    const lists = valueType ? await repo.find({ where: { valueType } }) : await repo.find();
    return lists.map((l) => this.toCustomListDTO(l));
  }

  async createCustomValueListFromCsv(payload: { name: string; valueType: PrepareValueListType; csvText: string }): Promise<PrepareCustomValueListDTO> {
    const repo = await this.repo(CustomValueListEntity);
    const values = this.parseCsv(payload.csvText, payload.valueType);
    if (values.length === 0) throw new Error("没有有效的列表内容");
    const list = repo.create({
      name: payload.name || "custom-list",
      valueType: payload.valueType,
      values,
      itemCount: values.length,
    });
    const saved = await repo.save(list);
    return this.toCustomListDTO(saved);
  }

  async deleteCustomValueList(id: number): Promise<void> {
    const repo = await this.repo(CustomValueListEntity);
    await repo.delete({ id });
  }

  private buildProfileFromInput(input: Partial<PrepareDbProfileDTO>): PrepareDbProfileDTO {
    return {
      id: input.id ?? 0,
      name: input.name ?? input.host ?? "",
      host: input.host ?? "",
      port: input.port ?? 3306,
      username: input.username ?? "",
      password: input.password ?? "",
      database: input.database ?? "",
      active: false,
    };
  }

  private createMysqlPool(profile: PrepareDbProfileDTO, databaseOverride?: string) {
    return mysql.createPool({
      host: profile.host,
      port: profile.port,
      user: profile.username,
      password: profile.password,
      database: databaseOverride || profile.database || undefined,
      waitForConnections: true,
      connectionLimit: 10,
    });
  }

  private async resolveSchema(conn: any, tableName: string, explicit?: string): Promise<string> {
    if (explicit) return explicit;
    const [rows] = await conn.query("SELECT DATABASE() AS db");
    const db = Array.isArray(rows) && (rows as any[])[0]?.db;
    if (db) return db as string;
    const [tableRows] = await conn.query("SELECT TABLE_SCHEMA FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = ? LIMIT 1", [tableName]);
    const inferred = Array.isArray(tableRows) && (tableRows as any[])[0]?.TABLE_SCHEMA;
    if (inferred) return inferred as string;
    throw new Error("No database resolved: set database in profile or request payload");
  }

  private computeCompletion(columns: PrepareColumnInfo[], fields: PrepareFieldConfig[]) {
    return columns.every((c) => {
      if (c.classification === "unsupported") return false;
      const cfg = fields.find((f) => f.columnName === c.name);
      return cfg && !!cfg.kind && !!cfg.type;
    });
  }

  private toProfileDetail(profile: TableProfileEntity): PrepareTableProfileDetail {
    return {
      id: profile.id,
      profileName: profile.profileName,
      tableName: profile.tableName,
      columnSummaries: profile.columnSummaries,
      dbProfileId: profile.dbProfileId,
      isComplete: profile.isComplete,
      createdAt: profile.createdAt?.toISOString?.() ?? undefined,
      updatedAt: profile.updatedAt?.toISOString?.() ?? undefined,
      fields: (profile.fields || []).map((f) => ({
        columnName: f.columnName,
        columnTypeKind: f.columnTypeKind,
        kind: f.kind,
        type: f.type,
        extraConfig: f.extraConfig ?? {},
        orderIndex: f.orderIndex,
      })),
    };
  }

  private toCustomListDTO(entity: CustomValueListEntity): PrepareCustomValueListDTO {
    return {
      id: entity.id,
      name: entity.name,
      valueType: entity.valueType,
      values: entity.values,
      itemCount: entity.itemCount,
      createdAt: entity.createdAt?.toISOString?.(),
      updatedAt: entity.updatedAt?.toISOString?.(),
    };
  }

  private parseCsv(csvText: string, valueType: PrepareValueListType): Array<string | number> {
    const lines = (csvText || "").split(/\r?\n/);
    const values: Array<string | number> = [];
    const limit = 5000;
    const normalize = (line: string) => line.split(",")[0]?.trim() ?? "";
    const headerPattern = /^(value|values|name|header)$/i;
    for (let i = 0; i < lines.length; i++) {
      // Always skip the first line as header
      if (i === 0) continue;
      const line = lines[i];
      if (!line.trim()) continue;
      const first = normalize(line);
      if (!first) continue;
      if (values.length === 0 && headerPattern.test(first)) continue;
      if (valueType === "number") {
        const num = Number(first);
        if (!Number.isFinite(num)) {
          if (values.length === 0) continue;
          throw new Error("数值列表包含非数字内容");
        }
        values.push(num);
      } else {
        values.push(first);
      }
      if (values.length > limit) {
        throw new Error(`列表条目过多，最多支持 ${limit} 行`);
      }
    }
    return values;
  }

  private async enrichGenerationInput(input: PrepareGenerationInput): Promise<PrepareGenerationInput> {
    const needs = input.fieldConfigs.filter(
      (f) => (f.kind === "SequenceIn" || f.kind === "RandomIn") && f.type === "CustomList"
    );
    if (!needs.length) return input;
    const ids = Array.from(
      new Set(
        needs
          .map((f) => f.extraConfig?.listId)
          .filter((id): id is number => typeof id === "number" && !Number.isNaN(id))
      )
    );
    if (!ids.length) throw new Error("CustomList 配置缺少 listId");
    const repo = await this.repo(CustomValueListEntity);
    const lists = await repo.findBy({ id: In(ids) });
    const map = new Map<number, CustomValueListEntity>();
    lists.forEach((l) => map.set(l.id, l));
    const resolvedFields = input.fieldConfigs.map((f) => {
      if (!((f.kind === "SequenceIn" || f.kind === "RandomIn") && f.type === "CustomList")) return f;
      const listId = f.extraConfig?.listId;
      const list = listId ? map.get(listId) : undefined;
      if (!list || !Array.isArray(list.values) || list.values.length === 0) {
        throw new Error("CustomList 未找到或为空");
      }
      if (list.valueType === "number" && f.columnTypeKind !== "number") {
        throw new Error("数值类型列表只能应用于数字字段");
      }
      if (list.valueType === "string" && f.columnTypeKind !== "string") {
        throw new Error("字符串类型列表只能应用于字符串字段");
      }
      return {
        ...f,
        extraConfig: {
          ...f.extraConfig,
          listName: list.name,
          listValues: list.values,
          valueType: list.valueType,
        },
      };
    });
    return { ...input, fieldConfigs: resolvedFields };
  }

  private async runInsertTask(taskId: string, input: PrepareGenerationInput, emit: (event: PrepareTaskEvent) => void) {
    const profile = input.dbProfileId ? await this.getProfileById(input.dbProfileId) : await this.getActiveProfile();
    if (!profile) {
      updateTask(taskId, { status: "failed", error: "No active database profile" });
      emit({ taskId, type: "status", message: "No active database profile", progress: getTask(taskId) ?? undefined });
      return;
    }
    const dbToUse = input.database || profile.database;
    if (!dbToUse) {
      updateTask(taskId, { status: "failed", error: "No database selected" });
      emit({ taskId, type: "status", message: "No database selected", progress: getTask(taskId) ?? undefined });
      return;
    }

    const pool = this.createMysqlPool(profile, dbToUse);
    let generatedCount = 0;
    let failed = 0;
    updateTask(taskId, { status: "running", completed: 0, failed: 0 });
    emit({ taskId, type: "status", message: "Task started", progress: getTask(taskId) ?? undefined });
    try {
      while (generatedCount < input.totalRows) {
        const task = getTask(taskId);
        if (task?.cancelRequested) {
          updateTask(taskId, { status: "cancelled" });
          emit({ taskId, type: "status", message: "Task cancelled", progress: getTask(taskId) ?? undefined });
          return;
        }
        const remaining = input.totalRows - generatedCount;
        const currentBatch = Math.min(remaining, input.batchSize);
        const { statements, rowCount } = buildBatchStatements(input, generatedCount, currentBatch);
        const fullSql = statements.join("\n");
        emit({ taskId, type: "log", message: `Inserting batch starting at row ${generatedCount + 1} (${currentBatch} rows)` });
        await pool.query(fullSql);
        generatedCount += rowCount;
        updateTask(taskId, { completed: generatedCount, failed });
        const progressMsg = `Inserted ${generatedCount}/${input.totalRows}`;
        emit({ taskId, type: "progress", message: progressMsg, progress: getTask(taskId) ?? undefined });
      }
      updateTask(taskId, { status: "completed", completed: generatedCount, failed });
      emit({ taskId, type: "status", message: "Task completed", progress: getTask(taskId) ?? undefined });
    } catch (err: any) {
      failed += 1;
      updateTask(taskId, { status: "failed", failed, error: err?.message });
      emit({ taskId, type: "status", message: `Task failed: ${err?.message || "unknown error"}`, progress: getTask(taskId) ?? undefined });
    } finally {
      await pool.end();
    }
  }
}
