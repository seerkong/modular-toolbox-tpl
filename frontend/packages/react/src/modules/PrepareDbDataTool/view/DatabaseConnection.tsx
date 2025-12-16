import React, { useEffect, useState } from "react";
import type { PrepareDbProfileDTO } from "@frontend/core/modules/PrepareDbDataTool/contract";
import { useFrontendRuntime } from "../../../runtime";

export default function DatabaseConnection() {
  const runtime = useFrontendRuntime();
  const api = runtime.actorMesh.modules.PrepareDbDataTool.prepareDbDataApi;

  const [profiles, setProfiles] = useState<PrepareDbProfileDTO[]>([]);
  const [error, setError] = useState("");
  const [testing, setTesting] = useState(false);
  const [testMessage, setTestMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    host: "",
    port: 3306,
    username: "root",
    password: "",
    database: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    const list = await api.listProfiles(runtime);
    setProfiles(list ?? []);
  };

  const startNew = () => {
    setEditingId(null);
    setError("");
    setTestMessage("");
    setForm({ name: "", host: "", port: 3306, username: "root", password: "", database: "" });
  };

  const saveProfile = async () => {
    setError("");
    setTestMessage("");
    try {
      if (editingId) {
        await api.updateProfile(runtime, editingId, form);
      } else {
        await api.createProfile(runtime, form);
      }
      setEditingId(null);
      await loadProfiles();
    } catch (err: any) {
      setError(err.message || "保存失败");
    }
  };

  const testProfile = async () => {
    setError("");
    setTesting(true);
    setTestMessage("");
    try {
      await api.testConnection(runtime, form);
      setTestMessage("连接成功");
    } catch (err: any) {
      setError(err.message || "连接失败");
    } finally {
      setTesting(false);
    }
  };

  const activate = async (id: number) => {
    await api.activateProfile(runtime, id);
    await loadProfiles();
  };

  const remove = async (id: number) => {
    await api.deleteProfile(runtime, id);
    await loadProfiles();
  };

  const edit = (p: PrepareDbProfileDTO) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      host: p.host,
      port: p.port,
      username: p.username,
      password: p.password ?? "",
      database: p.database || "",
    });
  };

  return (
    <div className="card">
      <h3 className="section-title">数据库连接</h3>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <div className="section-title" style={{ margin: 0 }}>
          已保存
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={startNew}>新建</button>
          <button onClick={loadProfiles}>刷新列表</button>
        </div>
      </div>
      {error && <div className="alert error">{error}</div>}
      {profiles.length ? (
        <table className="table">
          <thead>
            <tr>
              <th>名称</th>
              <th>连接</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>
                  {p.host}:{p.port} / {p.database || "(默认)"}
                </td>
                <td style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <button onClick={() => edit(p)}>编辑</button>
                  <button className="danger" onClick={() => remove(p.id)}>
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="badge muted">暂无配置</div>
      )}

      <div className="section-title" style={{ marginTop: 16 }}>
        配置表单
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 8 }}>
        <button onClick={saveProfile}>保存配置</button>
      </div>
      <div className="grid two">
        <div>
          <label>名称</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="dev-mysql" />
        </div>
        <div>
          <label>Host</label>
          <input value={form.host} onChange={(e) => setForm({ ...form, host: e.target.value })} placeholder="127.0.0.1" />
        </div>
        <div>
          <label>Port</label>
          <input type="number" value={form.port} onChange={(e) => setForm({ ...form, port: Number(e.target.value) })} placeholder="3306" />
        </div>
        <div>
          <label>用户名</label>
          <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="root" />
        </div>
        <div>
          <label>密码</label>
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <div>
          <label>数据库名 (必填，用于 schema/插入)</label>
          <input value={form.database} onChange={(e) => setForm({ ...form, database: e.target.value })} placeholder="your_db_name" />
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "center" }}>
        <button onClick={saveProfile}>保存配置</button>
        <button onClick={testProfile} disabled={testing}>
          {testing ? "测试中..." : "测试连接"}
        </button>
        {testMessage && <span className="badge muted">{testMessage}</span>}
      </div>
    </div>
  );
}
