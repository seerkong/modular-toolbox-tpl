<template>
  <div class="card">
    <h3 class="section-title">数据库连接</h3>
    <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:8px;">
      <div class="section-title" style="margin:0;">已保存</div>
      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        <button @click="startNew">新建</button>
        <button @click="loadProfiles">刷新列表</button>
      </div>
    </div>
    <div v-if="error" class="alert error">{{ error }}</div>
    <table class="table" v-if="profiles.length">
      <thead>
        <tr>
          <th>名称</th>
          <th>连接</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in profiles" :key="p.id">
          <td>{{ p.name }}</td>
          <td>{{ p.host }}:{{ p.port }} / {{ p.database || '(默认)' }}</td>
          <td style="display:flex; gap:6px; flex-wrap:wrap;">
            <button @click="edit(p)">编辑</button>
            <button class="danger" @click="remove(p.id)">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-else class="badge muted">暂无配置</div>

    <div class="section-title" style="margin-top:16px;">配置表单</div>
    <div style="display:flex; justify-content:flex-end; gap:8px; margin-bottom:8px;">
      <button @click="saveProfile">保存配置</button>
    </div>
    <div class="grid two">
      <div>
        <label>名称</label>
        <input v-model="form.name" placeholder="dev-mysql" />
      </div>
      <div>
        <label>Host</label>
        <input v-model="form.host" placeholder="127.0.0.1" />
      </div>
      <div>
        <label>Port</label>
        <input v-model.number="form.port" type="number" placeholder="3306" />
      </div>
      <div>
        <label>用户名</label>
        <input v-model="form.username" placeholder="root" />
      </div>
      <div>
        <label>密码</label>
        <input v-model="form.password" type="password" />
      </div>
      <div>
        <label>数据库名 (必填，用于 schema/插入)</label>
        <input v-model="form.database" placeholder="your_db_name" />
      </div>
    </div>
    <div style="display:flex; gap:8px; margin-top:12px;">
      <button @click="saveProfile">保存配置</button>
      <button @click="testProfile" :disabled="testing">{{ testing ? '测试中...' : '测试连接' }}</button>
      <span v-if="testMessage" class="badge muted">{{ testMessage }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import type { PrepareDbProfileDTO } from "@frontend/core/modules/PrepareDbDataTool/contract";
import { useFrontendRuntime } from "@frontend/vue/hooks/use-runtime";

const runtime = useFrontendRuntime();
const api = runtime.actorMesh.modules.PrepareDbDataTool.prepareDbDataApi;

const profiles = ref<PrepareDbProfileDTO[]>([]);
const error = ref("");
const testing = ref(false);
const testMessage = ref("");
const form = reactive({
  name: "",
  host: "",
  port: 3306,
  username: "root",
  password: "",
  database: "",
});
let editingId: number | null = null;

function startNew() {
  editingId = null;
  error.value = "";
  testMessage.value = "";
  form.name = "";
  form.host = "";
  form.port = 3306;
  form.username = "root";
  form.password = "";
  form.database = "";
}

async function loadProfiles() {
  const list = await api.listProfiles(runtime);
  profiles.value = list ?? [];
}

async function saveProfile() {
  error.value = "";
  testMessage.value = "";
  try {
    if (editingId) {
      await api.updateProfile(runtime, editingId, form);
    } else {
      await api.createProfile(runtime, form);
    }
    editingId = null;
    await loadProfiles();
  } catch (err: any) {
    error.value = err.message || "保存失败";
  }
}

async function testProfile() {
  error.value = "";
  testing.value = true;
  testMessage.value = "";
  try {
    await api.testConnection(runtime, form);
    testMessage.value = "连接成功";
  } catch (err: any) {
    error.value = err.message || "连接失败";
  } finally {
    testing.value = false;
  }
}

async function activate(id: number) {
  await api.activateProfile(runtime, id);
  await loadProfiles();
}

async function remove(id: number) {
  await api.deleteProfile(runtime, id);
  await loadProfiles();
}

function edit(p: PrepareDbProfileDTO) {
  editingId = p.id;
  form.name = p.name;
  form.host = p.host;
  form.port = p.port;
  form.username = p.username;
  form.password = p.password;
  form.database = p.database || "";
}

onMounted(loadProfiles);
</script>
