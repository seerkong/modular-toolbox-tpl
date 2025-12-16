<template>
  <div class="card">
    <h3 class="section-title">自定义列表</h3>
    <div class="grid two" style="gap:12px;">
      <div>
        <label>列表类型</label>
        <select v-model="valueType">
          <option value="string">字符串</option>
          <option value="number">数字</option>
        </select>
      </div>
      <div>
        <label>列表名称</label>
        <input v-model="name" placeholder="例如: 用户昵称列表" />
      </div>
      <div>
        <label>CSV 文件</label>
        <input type="file" accept=".csv" @change="onFileChange" />
        <div class="badge muted" style="margin-top:6px;">{{ fileName || '未选择文件' }}</div>
      </div>
      <div>
        <label>CSV 预览 (前几行)</label>
        <textarea v-model="csvText" rows="4" placeholder="也可直接粘贴单列CSV内容"></textarea>
      </div>
    </div>
    <div style="display:flex; gap:8px; margin-top:10px; flex-wrap:wrap;">
      <button @click="saveList" :disabled="uploading">上传并保存</button>
      <button @click="loadLists">刷新列表</button>
    </div>
    <div v-if="error" class="alert error" style="margin-top:10px;">{{ error }}</div>

    <div class="section-title" style="margin-top:16px;">已保存的列表</div>
    <div class="table-wrapper" v-if="lists.length">
      <table class="table">
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
          <tr v-for="l in lists" :key="l.id">
            <td>{{ l.name }}</td>
            <td><span class="badge muted">{{ l.valueType === 'string' ? '字符串' : '数字' }}</span></td>
            <td>{{ l.itemCount }}</td>
            <td>{{ l.updatedAt ? formatTime(l.updatedAt) : '-' }}</td>
            <td>
              <button class="danger" @click="deleteList(l.id)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="badge muted">暂无</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { PrepareCustomValueListDTO } from "@frontend/core/modules/PrepareDbDataTool/contract";
import { useFrontendRuntime } from "@frontend/vue/hooks/use-runtime";

const runtime = useFrontendRuntime();
const api = runtime.actorMesh.modules.PrepareDbDataTool.prepareDbDataApi;

const lists = ref<PrepareCustomValueListDTO[]>([]);
const valueType = ref<"string" | "number">("string");
const name = ref("");
const csvText = ref("");
const fileName = ref("");
const uploading = ref(false);
const error = ref("");

async function loadLists() {
  error.value = "";
  lists.value = await api.listCustomValueLists(runtime);
}

async function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  fileName.value = file.name;
  const text = await file.text();
  csvText.value = text;
  target.value = "";
}

async function saveList() {
  if (!csvText.value.trim()) {
    error.value = "请先选择或粘贴CSV内容";
    return;
  }
  uploading.value = true;
  error.value = "";
  try {
    await api.createCustomValueList(runtime, {
      name: name.value || "custom-list",
      valueType: valueType.value,
      csvText: csvText.value,
    });
    name.value = "";
    csvText.value = "";
    fileName.value = "";
    await loadLists();
  } catch (err: any) {
    error.value = err.message || "保存失败";
  } finally {
    uploading.value = false;
  }
}

async function deleteList(id: number) {
  await api.deleteCustomValueList(runtime, id);
  await loadLists();
}

function formatTime(ts: string) {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return ts;
  }
}

onMounted(loadLists);
</script>
