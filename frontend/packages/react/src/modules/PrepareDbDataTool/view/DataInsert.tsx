import React, { useEffect, useRef, useState } from "react";
import type {
  PrepareColumnInfo,
  PrepareFieldConfig,
  PrepareTableProfileSummary,
  PrepareDbProfileDTO,
  PrepareTaskEvent,
} from "@frontend/core/modules/PrepareDbDataTool/contract";
import { useFrontendRuntime } from "../../../runtime";

export default function DataInsert() {
  const runtime = useFrontendRuntime();
  const api = runtime.actorMesh.modules.PrepareDbDataTool.prepareDbDataApi;

  const [totalRows, setTotalRows] = useState(20);
  const [batchSize, setBatchSize] = useState(10);
  const [events, setEvents] = useState<string[]>([]);
  const [previewSql, setPreviewSql] = useState<string[]>([]);
  const [progress, setProgress] = useState("等待");
  const [error, setError] = useState("");
  const [previewCollapsed, setPreviewCollapsed] = useState(false);
  const [profiles, setProfiles] = useState<PrepareTableProfileSummary[]>([]);
  const [dbProfiles, setDbProfiles] = useState<PrepareDbProfileDTO[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState(0);
  const [selectedDbId, setSelectedDbId] = useState<number | null>(null);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [statusText, setStatusText] = useState("等待");
  const [columns, setColumns] = useState<PrepareColumnInfo[]>([]);
  const [fieldConfigs, setFieldConfigs] = useState<Record<string, PrepareFieldConfig>>({});

  const wsCleanup = useRef<() => void>();

  const selectedProfile = profiles.find((p) => p.id === selectedProfileId);
  const selectedDb = dbProfiles.find((p) => p.id === selectedDbId);

  const statusTone = (() => {
    const key = (statusText || "").toLowerCase();
    if (key.includes("fail")) return { color: "var(--status-failed)", bg: "var(--status-failed-bg)", border: "var(--status-failed-border)" };
    if (key.includes("complete")) return { color: "var(--status-done)", bg: "var(--status-done-bg)", border: "var(--status-done-border)" };
    if (key.includes("cancel")) return { color: "var(--status-init)", bg: "var(--status-init-bg)", border: "var(--status-init-border)" };
    return { color: "var(--status-init)", bg: "var(--status-init-bg)", border: "var(--status-init-border)" };
  })();

  const ready =
    !!selectedProfile &&
    !!selectedDbId &&
    !!selectedDb?.database &&
    columns.length > 0 &&
    columns.every((c) => {
      const cfg = fieldConfigs[c.name];
      return cfg && cfg.kind && cfg.type && c.classification !== "unsupported";
    });

  useEffect(() => {
    loadDbProfiles();
    loadProfiles();
    wsCleanup.current = api.connectProgressSocket(runtime, handleWsMessage);
    return () => {
      wsCleanup.current?.();
    };
  }, []);

  const loadDbProfiles = async () => {
    setDbProfiles(await api.listProfiles(runtime));
  };

  const loadProfiles = async () => {
    const list = await api.listTableProfiles(runtime, selectedDbId ?? undefined);
    setProfiles((list || []).filter((p) => p.isComplete));
  };

  const onSelectProfile = async (profileId?: number) => {
    setEvents([]);
    setPreviewSql([]);
    setProgress("等待");
    setError("");
    setFieldConfigs({});
    setColumns([]);
    const targetId = profileId ?? selectedProfileId;
    const profile = profiles.find((p) => p.id === targetId);
    if (!profile) return;
    const detail = await api.getTableProfile(runtime, targetId);
    if (detail?.dbProfileId) {
      setSelectedDbId(detail.dbProfileId);
    }
    const columnsRes = await api.fetchSchema(runtime, { tableProfileId: targetId, dbProfileId: selectedDbId ?? undefined, tableName: null });
    setColumns(columnsRes);
    const cfgs = detail?.fields || [];
    const map: Record<string, PrepareFieldConfig> = {};
    cfgs.forEach((f: any) => {
      map[f.columnName] = {
        columnName: f.columnName,
        columnTypeKind: f.columnTypeKind,
        kind: f.kind,
        type: f.type,
        extraConfig: f.extraConfig || {},
        orderIndex: f.orderIndex,
      };
    });
    const filtered: Record<string, PrepareFieldConfig> = {};
    columnsRes.forEach((c) => {
      const cfg = map[c.name];
      if (cfg && ((c.classification === "number" && cfg.columnTypeKind === "number") || (c.classification === "string" && cfg.columnTypeKind === "string"))) {
        filtered[c.name] = cfg;
      }
    });
    setFieldConfigs(filtered);
  };

  const buildPayload = () => ({
    tableName: selectedProfile?.tableName,
    totalRows,
    batchSize,
    columns,
    fieldConfigs: Object.values(fieldConfigs),
    dbProfileId: selectedDbId || undefined,
    database: selectedDb?.database || undefined,
  });

  const preview = async () => {
    setError("");
    setEvents([]);
    try {
      const res = await api.previewInsert(runtime, buildPayload());
      setPreviewSql(res.statements);
    } catch (err: any) {
      setError(err.message || "预览失败");
    }
  };

  const execute = async () => {
    setError("");
    setEvents([]);
    setProgress(`进度 -- 完成/失败/总数: 0/0/${totalRows}`);
    setStatusText("执行中");
    try {
      const res = await api.executeInsert(runtime, buildPayload());
      setCurrentTaskId(res.taskId);
    } catch (err: any) {
      setError(err.message || "执行失败");
      setProgress("失败");
    }
  };

  const cancelTask = async () => {
    if (!currentTaskId) return;
    await api.cancelTask(runtime, currentTaskId);
    setStatusText("已请求终止");
  };

  const copyPreview = async () => {
    try {
      await navigator.clipboard.writeText(previewSql.join("\n"));
      setProgress("已复制");
    } catch (err: any) {
      setError("复制失败: " + (err?.message || "未知错误"));
    }
  };

  const togglePreview = () => setPreviewCollapsed((prev) => !prev);

  const handleWsMessage = (msg: PrepareTaskEvent) => {
    if (!currentTaskId || msg.taskId !== currentTaskId) return;
    const appendLog = (message?: string) => {
      if (!message) return;
      setEvents((prev) => [...prev, message].slice(-200));
    };
    if (msg.type === "log") {
      appendLog(msg.message);
    }
    if (msg.type === "progress" || msg.type === "status") {
      const p = msg.progress;
      if (p) {
        setProgress(`进度 -- 完成/失败/总数: ${p.completed}/${p.failed}/${p.total}`);
        setStatusText(p.status);
        if (p.status === "completed" || p.status === "failed" || p.status === "cancelled") {
          setCurrentTaskId(null);
        }
      }
      appendLog(msg.message);
    }
  };

  useEffect(() => {
    const panel = document.querySelector(".debug-panel");
    if (panel) (panel as HTMLElement).scrollTop = (panel as HTMLElement).scrollHeight;
  }, [events]);

  return (
    <div className="card">
      <h3 className="section-title">数据插入执行</h3>
      <div className="grid two">
        <div>
          <label>选择数据库</label>
          <select
            value={selectedDbId ?? ""}
            onChange={(e) => {
              setSelectedDbId(e.target.value ? Number(e.target.value) : null);
              setSelectedProfileId(0);
              setColumns([]);
              setFieldConfigs({});
              loadProfiles();
            }}
          >
            <option value="">请选择数据库</option>
            {dbProfiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.host}:{p.port} / {p.database || "默认DB"})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>选择已完成的 Profile</label>
          <select
            value={selectedProfileId}
            onChange={(e) => {
              const val = Number(e.target.value);
              setSelectedProfileId(val);
              onSelectProfile(val);
            }}
          >
            <option value={0}>请选择</option>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.profileName} ({p.tableName})
              </option>
            ))}
          </select>
        </div>
      <div>
        <label>Profile 信息</label>
        <div
          className={`badge ${selectedProfile ? "accent" : "muted"}`}
          style={{
            background: "color-mix(in srgb, var(--card) 80%, transparent)",
            border: "1px solid var(--border)",
            color: "var(--text)",
          }}
        >
          {selectedProfile ? (
            <>
              名称: {selectedProfile.profileName} | 数据库: {selectedDb?.database || "未设置"} | 表: {selectedProfile.tableName}
            </>
          ) : (
              "请选择已完成的 Profile"
            )}
          </div>
        </div>
      </div>
      <div className="grid two" style={{ marginTop: 12 }}>
        <div>
          <label>插入总条目数</label>
          <input type="number" value={totalRows} onChange={(e) => setTotalRows(Number(e.target.value))} />
        </div>
        <div>
          <label>每批次条目数</label>
          <input type="number" value={batchSize} onChange={(e) => setBatchSize(Number(e.target.value))} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button onClick={preview} disabled={!ready || !!currentTaskId}>
          预览
        </button>
        <button onClick={execute} disabled={!ready || !!currentTaskId}>
          执行插入
        </button>
        <button onClick={cancelTask} disabled={!currentTaskId}>
          终止任务
        </button>
      </div>
      {error && (
        <div className="alert error" style={{ marginTop: 10 }}>
          {error}
        </div>
      )}
      {previewSql.length > 0 && (
        <div className="card" style={{ marginTop: 12 }}>
          <div className="section-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>预览SQL</span>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button onClick={togglePreview} style={{ padding: "6px 10px" }}>
                {previewCollapsed ? "展开" : "收起"}
              </button>
              <button onClick={copyPreview} style={{ padding: "6px 10px" }}>
                复制
              </button>
            </div>
          </div>
          {!previewCollapsed && (
            <pre
              style={{
                whiteSpace: "pre-wrap",
                fontSize: 13,
                background: "var(--code-bg)",
                color: "var(--code-text)",
                padding: 10,
                borderRadius: 8,
                border: "1px solid var(--code-border)",
              }}
            >
              {previewSql.join("\n")}
            </pre>
          )}
        </div>
      )}
      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "12px 14px",
            background: "color-mix(in srgb, var(--card) 85%, var(--bg-2) 15%)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div style={{ fontWeight: 600, color: "var(--text)" }}>任务进度</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <span style={{ color: "var(--text-secondary)" }}>{progress}</span>
            <span
              style={{
                border: `1px solid ${statusTone.border}`,
                background: statusTone.bg,
                color: statusTone.color,
                padding: "6px 10px",
                borderRadius: 999,
                fontWeight: 600,
                minWidth: 96,
                textAlign: "center",
              }}
            >
              状态: {statusText}
            </span>
          </div>
        </div>

        <div
          className="debug-panel"
          style={{
            maxHeight: 220,
            overflowY: "auto",
            border: "1px dashed var(--border)",
            borderRadius: 10,
            padding: "10px 12px",
            background: "color-mix(in srgb, var(--card) 82%, var(--bg-3) 18%)",
          }}
        >
          <div style={{ marginBottom: 6, color: "var(--muted)", fontSize: 13 }}>任务日志</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {events.map((evt, idx) => (
              <div
                key={idx}
                className="badge muted"
                style={{
                  color: "var(--log-text, var(--text))",
                  background: "color-mix(in srgb, var(--bg-2) 70%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--border) 70%, transparent)",
                }}
              >
                {evt}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
