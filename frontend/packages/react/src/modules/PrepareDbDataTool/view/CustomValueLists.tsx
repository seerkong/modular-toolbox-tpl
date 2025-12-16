import React, { useEffect, useState } from "react";
import type { PrepareCustomValueListDTO } from "@frontend/core/modules/PrepareDbDataTool/contract";
import { useFrontendRuntime } from "../../../runtime";

export default function CustomValueLists() {
  const runtime = useFrontendRuntime();
  const api = runtime.actorMesh.modules.PrepareDbDataTool.prepareDbDataApi;

  const [lists, setLists] = useState<PrepareCustomValueListDTO[]>([]);
  const [valueType, setValueType] = useState<"string" | "number">("string");
  const [name, setName] = useState("");
  const [csvText, setCsvText] = useState("");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = async () => {
    setError("");
    const res = await api.listCustomValueLists(runtime);
    setLists(res);
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const text = await file.text();
    setCsvText(text);
    e.target.value = "";
  };

  const saveList = async () => {
    if (!csvText.trim()) {
      setError("请先选择或粘贴CSV内容");
      return;
    }
    setUploading(true);
    setError("");
    try {
      await api.createCustomValueList(runtime, {
        name: name || "custom-list",
        valueType,
        csvText,
      });
      setName("");
      setCsvText("");
      setFileName("");
      await loadLists();
    } catch (err: any) {
      setError(err.message || "保存失败");
    } finally {
      setUploading(false);
    }
  };

  const deleteList = async (id: number) => {
    await api.deleteCustomValueList(runtime, id);
    await loadLists();
  };

  const formatTime = (ts?: string) => {
    if (!ts) return "-";
    try {
      return new Date(ts).toLocaleString();
    } catch {
      return ts;
    }
  };

  return (
    <div className="card">
      <h3 className="section-title">自定义列表</h3>
      <div className="grid two" style={{ gap: 12 }}>
        <div>
          <label>列表类型</label>
          <select value={valueType} onChange={(e) => setValueType(e.target.value as any)}>
            <option value="string">字符串</option>
            <option value="number">数字</option>
          </select>
        </div>
        <div>
          <label>列表名称</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="例如: 用户昵称列表" />
        </div>
        <div>
          <label>CSV 文件</label>
          <input type="file" accept=".csv" onChange={onFileChange} />
          <div className="badge muted" style={{ marginTop: 6 }}>
            {fileName || "未选择文件"}
          </div>
        </div>
        <div>
          <label>CSV 预览 (前几行)</label>
          <textarea
            rows={4}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder="也可直接粘贴单列CSV内容"
          />
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
        <button onClick={saveList} disabled={uploading}>
          上传并保存
        </button>
        <button onClick={loadLists}>刷新列表</button>
      </div>
      {error && (
        <div className="alert error" style={{ marginTop: 10 }}>
          {error}
        </div>
      )}

      <div className="section-title" style={{ marginTop: 16 }}>
        已保存的列表
      </div>
      {lists.length ? (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>名称</th>
                <th>类型</th>
                <th>条目数</th>
                <th>更新时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {lists.map((l) => (
                <tr key={l.id}>
                  <td>{l.name}</td>
                  <td>
                    <span className="badge muted">{l.valueType === "string" ? "字符串" : "数字"}</span>
                  </td>
                  <td>{l.itemCount}</td>
                  <td>{formatTime(l.updatedAt)}</td>
                  <td>
                    <button className="danger" onClick={() => deleteList(l.id)}>
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="badge muted">暂无</div>
      )}
    </div>
  );
}
