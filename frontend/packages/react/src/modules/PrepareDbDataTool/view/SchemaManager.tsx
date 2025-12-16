import React, { useEffect, useState } from "react";
import type {
  PrepareColumnInfo,
  PrepareFieldConfig,
  PrepareTableProfileSummary,
  PrepareDbProfileDTO,
  PrepareCustomValueListDTO,
} from "@frontend/core/modules/PrepareDbDataTool/contract";
import { useFrontendRuntime } from "../../../runtime";

type FieldConfig = PrepareFieldConfig & { kind: string; type: string };

export default function SchemaManager() {
  const runtime = useFrontendRuntime();
  const api = runtime.actorMesh.modules.PrepareDbDataTool.prepareDbDataApi;

  const [tableName, setTableName] = useState("");
  const [columns, setColumns] = useState<PrepareColumnInfo[]>([]);
  const [fieldConfigs, setFieldConfigs] = useState<Record<string, FieldConfig>>({});
  const [error, setError] = useState("");
  const [profileName, setProfileName] = useState("");
  const [savedProfiles, setSavedProfiles] = useState<PrepareTableProfileSummary[]>([]);
  const [editingProfile, setEditingProfile] = useState<{ id: number; profileName: string } | null>(null);
  const [selectedDb, setSelectedDb] = useState<number | null>(null);
  const [reuseProfileId, setReuseProfileId] = useState<number | null>(null);
  const [allProfiles, setAllProfiles] = useState<PrepareDbProfileDTO[]>([]);
  const [customStringLists, setCustomStringLists] = useState<PrepareCustomValueListDTO[]>([]);
  const [customNumberLists, setCustomNumberLists] = useState<PrepareCustomValueListDTO[]>([]);

  const stringOptions = {
    IdGenerator: ["ULID", "UUID", "SnowflakeId"],
    SequenceIn: ["BuiltinPersonList", "BuiltinDepartmentList"],
    RandomIn: ["BuiltinPersonList", "BuiltinDepartmentList"],
    Default: ["DbDefault", "Null"],
  };
  const numberOptions = {
    IdGenerator: ["AutoIncrement", "SnowflakeId"],
    SequenceIn: ["BuiltinNumIdList"],
    RandomIn: ["BuiltinNumIdList"],
    TimeGenerator: ["TimestampSeconds", "TimestampMillis"],
    Default: ["DbDefault", "Null", "const_0", "const_1"],
  };

  const completion =
    columns.length > 0 &&
    columns.every((c) => {
      const cfg = fieldConfigs[c.name];
      return c.classification !== "unsupported" && cfg && cfg.kind && cfg.type;
    });

  useEffect(() => {
    loadDbProfiles();
    loadSavedProfiles();
    loadCustomLists();
  }, []);

  const dbLabel = (id: number) => {
    const p = allProfiles.find((x) => x.id === id);
    if (!p) return `#${id}`;
    return `${p.name} (${p.host}:${p.port}/${p.database || "默认DB"})`;
  };

  const kinds = (col: PrepareColumnInfo) => {
    if (col.classification === "string") return Object.keys(stringOptions);
    if (col.classification === "number") return Object.keys(numberOptions);
    return [];
  };

  type SelectOption = { value: string; label: string };

  const typeOptions = (col: PrepareColumnInfo, kind: string): SelectOption[] => {
    const base =
      col.classification === "string" ? (stringOptions as any)[kind] || [] : (col.classification === "number" ? (numberOptions as any)[kind] || [] : []);
    const builtins = (base as string[]).map((b) => ({ value: b, label: b }));
    const allowCustom = kind === "SequenceIn" || kind === "RandomIn";
    const customLists = col.classification === "string" ? customStringLists : customNumberLists;
    const customs = allowCustom ? customLists.map((l) => ({ value: `custom:${l.id}`, label: `自定义:${l.name}` })) : [];
    return [...builtins, ...customs];
  };

  const typeValueFor = (colName: string) => {
    const cfg = fieldConfigs[colName];
    if (!cfg) return "";
    if ((cfg.kind === "SequenceIn" || cfg.kind === "RandomIn") && cfg.type === "CustomList" && cfg.extraConfig?.listId) {
      return `custom:${cfg.extraConfig.listId}`;
    }
    return cfg.type || "";
  };

  const updateTypeSelection = (col: PrepareColumnInfo, rawValue: string) => {
    const next = { ...fieldConfigs };
    ensureFieldConfig(col, next);
    const cfg = next[col.name];
    if (rawValue.startsWith("custom:")) {
      const id = Number(rawValue.replace("custom:", ""));
      const list = (col.classification === "string" ? customStringLists : customNumberLists).find((l) => l.id === id);
      cfg.type = "CustomList";
      cfg.extraConfig = { ...(cfg.extraConfig || {}), listId: id, listName: list?.name };
    } else {
      cfg.type = rawValue;
      if (cfg.extraConfig) {
        delete cfg.extraConfig.listId;
        delete cfg.extraConfig.listName;
        delete cfg.extraConfig.listValues;
        delete cfg.extraConfig.valueType;
      }
    }
    setFieldConfigs(next);
  };

  const ensureFieldConfig = (col: PrepareColumnInfo, map: Record<string, FieldConfig>) => {
    if (!map[col.name]) {
      map[col.name] = {
        columnName: col.name,
        columnTypeKind: col.classification === "number" ? "number" : "string",
        kind: "",
        type: "",
        extraConfig: {},
        orderIndex: 0,
      };
    }
  };

  const resetFieldConfigs = () => {
    setColumns([]);
    setFieldConfigs({});
  };

  const startNewProfile = () => {
    setTableName("");
    setProfileName("");
    setSelectedDb(null);
    setEditingProfile(null);
    setReuseProfileId(null);
    setError("");
    resetFieldConfigs();
  };

  const loadDbProfiles = async () => {
    setAllProfiles(await api.listProfiles(runtime));
  };

  const loadCustomLists = async () => {
    setCustomStringLists(await api.listCustomValueLists(runtime, "string"));
    setCustomNumberLists(await api.listCustomValueLists(runtime, "number"));
  };

  const pullSchema = async () => {
    setError("");
    const db = allProfiles.find((p) => p.id === selectedDb);
    if (!db) {
      setError("请先选择数据库");
      return;
    }
    if (!db.database) {
      setError("所选数据库配置缺少数据库名");
      return;
    }
    try {
      resetFieldConfigs();
      const cols = await api.fetchSchema(runtime, { tableName, dbProfileId: selectedDb ?? undefined });
      const map: Record<string, FieldConfig> = {};
      cols.forEach((c) => ensureFieldConfig(c, map));
      setColumns(cols);
      setFieldConfigs(map);
      await loadSavedProfiles();
    } catch (err: any) {
      setError(err.message || "拉取失败");
    }
  };

  const saveProfile = async () => {
    if (!selectedDb) {
      setError("请先选择数据库");
      return;
    }
    const fields = columns.map((c) => fieldConfigs[c.name] || {
      columnName: c.name,
      columnTypeKind: c.classification === "number" ? "number" : "string",
      kind: "",
      type: "",
      extraConfig: {},
      orderIndex: 0,
    });
    const payload = {
      profileName: profileName || tableName,
      profileId: editingProfile?.id,
      tableName,
      columns,
      fields,
      dbProfileId: selectedDb,
    };
    const res = await api.saveTableProfile(runtime, payload);
    setEditingProfile({ id: res.id, profileName: res.profileName });
    setProfileName(res.profileName);
    await loadSavedProfiles();
  };

  const loadSavedProfiles = async () => {
    const list = await api.listTableProfiles(runtime);
    setSavedProfiles(list);
  };

  const deleteProfile = async (id: number) => {
    await api.deleteTableProfile(runtime, id);
    if (editingProfile?.id === id) {
      startNewProfile();
    }
    await loadSavedProfiles();
  };

  const applyProfileFields = async (profileId: number, opts: { setMeta?: boolean } = {}) => {
    const prof = savedProfiles.find((p) => p.id === profileId);
    if (!prof || !columns.length) return;
    const reusable = await api.applyTableProfile(runtime, profileId, columns);
    const map: Record<string, FieldConfig> = {};
    reusable.forEach((f: any) => {
      map[f.columnName] = {
        columnName: f.columnName,
        columnTypeKind: f.columnTypeKind,
        kind: f.kind,
        type: f.type,
        extraConfig: f.extraConfig || {},
        orderIndex: f.orderIndex,
      };
    });
    columns.forEach((c) => {
      map[c.name] = map[c.name] || {
        columnName: c.name,
        columnTypeKind: c.classification === "number" ? "number" : "string",
        kind: "",
        type: "",
        extraConfig: {},
        orderIndex: 0,
      };
    });
    setFieldConfigs(map);
    if (opts.setMeta) {
      setProfileName(prof.profileName);
      setEditingProfile({ id: prof.id, profileName: prof.profileName });
    }
  };

  const editProfile = (p: PrepareTableProfileSummary) => {
    setEditingProfile({ id: p.id, profileName: p.profileName });
    setTableName(p.tableName);
    setProfileName(p.profileName);
    setSelectedDb(p.dbProfileId);
    setReuseProfileId(null);
    setError("");
    resetFieldConfigs();
  };

  const configureFields = async (p: PrepareTableProfileSummary) => {
    editProfile(p);
    await pullSchema();
    if (error || !columns.length) return;
    await applyProfileFields(p.id, { setMeta: true });
  };

  const reuseFromProfile = async () => {
    if (reuseProfileId === null) {
      setError("请选择要复用的profile");
      return;
    }
    if (!columns.length) {
      setError("请先拉取结构");
      return;
    }
    setError("");
    await applyProfileFields(reuseProfileId, { setMeta: false });
  };

  return (
    <div className="card">
      <h3 className="section-title">Schema管理</h3>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <div className="section-title" style={{ margin: 0 }}>
          已保存的 Profile
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={startNewProfile}>新建</button>
          <button onClick={loadSavedProfiles}>刷新列表</button>
        </div>
      </div>
      {savedProfiles.length ? (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>名称</th>
                <th>表名</th>
                <th>数据库</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {savedProfiles.map((p) => (
                <tr key={p.id}>
                  <td>{p.profileName}</td>
                  <td>{p.tableName}</td>
                  <td>
                    <span className="badge muted">{dbLabel(p.dbProfileId)}</span>
                  </td>
                  <td>
                    <span className={`badge ${p.isComplete ? "accent" : "muted"}`}>{p.isComplete ? "已完成" : "未完成"}</span>
                  </td>
                  <td style={{ display: "flex", gap: 6, flexWrap: "nowrap" }}>
                    <button onClick={() => editProfile(p)}>编辑</button>
                    <button className="danger" onClick={() => deleteProfile(p.id)}>
                      删除
                    </button>
                    <button onClick={() => configureFields(p)}>配置fields</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="badge muted">暂无</div>
      )}

      <div className="section-title" style={{ marginTop: 16 }}>
        Profile表单
      </div>
      {error && (
        <div className="alert error" style={{ marginBottom: 10 }}>
          {error}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 8 }}>
        <button onClick={saveProfile}>保存Profile</button>
        <button onClick={pullSchema} disabled={!tableName || !selectedDb}>
          重置fields（拉取结构）
        </button>
      </div>
      <div className="grid two">
        <div>
          <label>选择数据库</label>
          <select value={selectedDb ?? ""} onChange={(e) => setSelectedDb(e.target.value ? Number(e.target.value) : null)}>
            <option value="">请选择数据库</option>
            {allProfiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.host}:{p.port} / {p.database || "默认DB"})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>表名 (支持$)</label>
          <input value={tableName} onChange={(e) => setTableName(e.target.value)} placeholder="my_table" />
        </div>
        <div>
          <label>Profile 名称</label>
          <input value={profileName} onChange={(e) => setProfileName(e.target.value)} placeholder="例如: my_table 默认规则" />
        </div>
        <div>
          <label>完成状态</label>
          <div className={`badge ${completion ? "accent" : "muted"}`}>{completion ? "已配置完成" : "未完成，可先保存草稿"}</div>
        </div>
      </div>

      {columns.length > 0 && (
        <>
          <div style={{ marginTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <div className="section-title" style={{ margin: 0 }}>
                字段配置
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <select value={reuseProfileId ?? ""} onChange={(e) => setReuseProfileId(e.target.value ? Number(e.target.value) : null)}>
                  <option value="">选择其他profile</option>
                  {savedProfiles
                    .filter((sp) => !editingProfile || sp.id !== editingProfile.id)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.profileName} ({p.tableName})
                      </option>
                    ))}
                </select>
                <button onClick={reuseFromProfile} disabled={reuseProfileId === null}>
                  复用其他profile
                </button>
                <button onClick={loadCustomLists}>刷新自定义列表</button>
              </div>
            </div>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>字段</th>
                    <th>类型</th>
                    <th>Kind</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {columns.map((col) => (
                    <tr key={col.name}>
                      <td>{col.name}</td>
                      <td>
                        <span className={`badge ${col.classification === "string" ? "accent" : col.classification === "number" ? "muted" : ""}`}>
                          {col.rawType}
                        </span>
                      </td>
                      <td>
                        <select
                          value={fieldConfigs[col.name]?.kind || ""}
                          onChange={(e) => {
                            const next = { ...fieldConfigs };
                            ensureFieldConfig(col, next);
                            next[col.name].kind = e.target.value;
                            next[col.name].type = "";
                            if (next[col.name].extraConfig) {
                              delete next[col.name].extraConfig?.listId;
                              delete next[col.name].extraConfig?.listName;
                              delete next[col.name].extraConfig?.listValues;
                              delete next[col.name].extraConfig?.valueType;
                            }
                            setFieldConfigs(next);
                          }}
                        >
                          <option value="">选择</option>
                          {kinds(col).map((k) => (
                            <option key={k} value={k}>
                              {k}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select
                          value={typeValueFor(col.name)}
                          onChange={(e) => updateTypeSelection(col, e.target.value)}
                        >
                          <option value="">选择</option>
                          {typeOptions(col, fieldConfigs[col.name]?.kind || "").map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button onClick={saveProfile}>保存Profile</button>
          </div>
        </>
      )}
    </div>
  );
}
