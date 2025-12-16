<template>
  <div class="card">
    <h3 class="section-title">Schema管理</h3>
    <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:8px;">
      <div class="section-title" style="margin:0;">已保存的 Profile</div>
      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        <button @click="startNewProfile">新建</button>
        <button @click="loadSavedProfiles">刷新列表</button>
      </div>
    </div>
    <div class="table-wrapper" v-if="savedProfiles.length">
      <table class="table">
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
          <tr v-for="p in savedProfiles" :key="p.id">
            <td>{{ p.profileName }}</td>
            <td>{{ p.tableName }}</td>
            <td>
              <span class="badge muted">{{ dbLabel(p.dbProfileId) }}</span>
            </td>
            <td>
              <span class="badge" :class="p.isComplete ? 'accent' : 'muted'">{{ p.isComplete ? '已完成' : '未完成' }}</span>
            </td>
            <td style="display:flex; gap:6px; flex-wrap:nowrap;">
              <button @click="editProfile(p)">编辑</button>
              <button class="danger" @click="deleteProfile(p.id)">删除</button>
              <button @click="configureFields(p)">配置fields</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="badge muted">暂无</div>

    <div class="section-title" style="margin-top:16px;">Profile表单</div>
    <div v-if="error" class="alert error" style="margin-bottom:10px;">{{ error }}</div>
    <div style="display:flex; justify-content:flex-end; gap:8px; margin-bottom:8px;">
      <button @click="saveProfile">保存Profile</button>
      <button @click="pullSchema" :disabled="!tableName || !selectedDb">重置fields（拉取结构）</button>
    </div>
    <div class="grid two">
      <div>
        <label>选择数据库</label>
        <select v-model.number="selectedDb">
          <option :value="null">请选择数据库</option>
          <option v-for="p in allProfiles" :key="p.id" :value="p.id">
            {{ p.name }} ({{ p.host }}:{{ p.port }} / {{ p.database || '默认DB' }})
          </option>
        </select>
      </div>
      <div>
        <label>表名 (支持$)</label>
        <input v-model="tableName" placeholder="my_table" />
      </div>
      <div>
        <label>Profile 名称</label>
        <input v-model="profileName" placeholder="例如: my_table 默认规则" />
      </div>
      <div>
        <label>完成状态</label>
        <div class="badge" :class="completion ? 'accent' : 'muted'">
          {{ completion ? '已配置完成' : '未完成，可先保存草稿' }}
        </div>
      </div>
    </div>

    <div v-if="columns.length" style="margin-top:16px;">
      <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:8px;">
        <div class="section-title" style="margin:0;">字段配置</div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <select v-model.number="reuseProfileId">
            <option :value="null">选择其他profile</option>
            <option v-for="p in savedProfiles.filter(sp => !editingProfile || sp.id !== editingProfile.id)" :key="p.id" :value="p.id">
              {{ p.profileName }} ({{ p.tableName }})
            </option>
          </select>
          <button @click="reuseFromProfile" :disabled="reuseProfileId === null">复用其他profile</button>
          <button @click="loadCustomLists">刷新自定义列表</button>
        </div>
      </div>
      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>字段</th>
              <th>类型</th>
              <th>Kind</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="col in columns" :key="col.name">
              <td>{{ col.name }}</td>
              <td>
                <span class="badge" :class="col.classification === 'string' ? 'accent' : col.classification === 'number' ? 'muted' : ''">
                  {{ col.rawType }}
                </span>
              </td>
              <td>
                <select v-model="fieldConfigs[col.name].kind" @change="updateType(col)">
                  <option value="">选择</option>
                  <option v-for="k in kinds(col)" :key="k" :value="k">{{ k }}</option>
                </select>
              </td>
              <td>
                <select :value="typeValueFor(col)" @change="(e: any) => updateTypeSelection(col, e.target.value)">
                  <option value="">选择</option>
                  <option v-for="t in types(col, fieldConfigs[col.name].kind)" :key="t.value" :value="t.value">{{ t.label }}</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-if="columns.length" style="display:flex; gap:8px; margin-top:12px;">
      <button @click="saveProfile">保存Profile</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from "vue";
import type {
  PrepareColumnInfo,
  PrepareFieldConfig,
  PrepareTableProfileSummary,
  PrepareDbProfileDTO,
  PrepareCustomValueListDTO,
} from "@frontend/core/modules/PrepareDbDataTool/contract";
import { useFrontendRuntime } from "@frontend/vue/hooks/use-runtime";

const runtime = useFrontendRuntime();
const api = runtime.actorMesh.modules.PrepareDbDataTool.prepareDbDataApi;

const tableName = ref("");
const columns = ref<PrepareColumnInfo[]>([]);
const fieldConfigs = reactive<Record<string, FieldConfig>>({});
const error = ref("");
const profileName = ref("");
const savedProfiles = ref<PrepareTableProfileSummary[]>([]);
const editingProfile = ref<{ id: number; profileName: string } | null>(null);
const selectedDb = ref<number | null>(null);
const reuseProfileId = ref<number | null>(null);
const allProfiles = ref<PrepareDbProfileDTO[]>([]);
const customStringLists = ref<PrepareCustomValueListDTO[]>([]);
const customNumberLists = ref<PrepareCustomValueListDTO[]>([]);

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

type FieldConfig = PrepareFieldConfig & { kind: string; type: string };

const completion = computed(() => {
  return columns.value.length > 0 && columns.value.every((c) => {
    const cfg = fieldConfigs[c.name];
    return c.classification !== "unsupported" && cfg && cfg.kind && cfg.type;
  });
});

function dbLabel(id: number) {
  const p = allProfiles.value.find((x) => x.id === id);
  if (!p) return `#${id}`;
  return `${p.name} (${p.host}:${p.port}/${p.database || "默认DB"})`;
}

function kinds(col: PrepareColumnInfo) {
  if (col.classification === "string") return Object.keys(stringOptions);
  if (col.classification === "number") return Object.keys(numberOptions);
  return [];
}

type SelectOption = { value: string; label: string };

function types(col: PrepareColumnInfo, kind: string): SelectOption[] {
  const base =
    col.classification === "string" ? (stringOptions as any)[kind] || [] : (col.classification === "number" ? (numberOptions as any)[kind] || [] : []);
  const builtins = (base as string[]).map((b) => ({ value: b, label: b }));
  const allowCustom = kind === "SequenceIn" || kind === "RandomIn";
  const customLists = col.classification === "string" ? customStringLists.value : customNumberLists.value;
  const customs = allowCustom
    ? customLists.map((l) => ({ value: `custom:${l.id}`, label: `自定义:${l.name}` }))
    : [];
  return [...builtins, ...customs];
}

function ensureFieldConfig(col: PrepareColumnInfo) {
  if (!fieldConfigs[col.name]) {
    fieldConfigs[col.name] = {
      columnName: col.name,
      columnTypeKind: col.classification === "number" ? "number" : "string",
      kind: "",
      type: "",
      extraConfig: {},
      orderIndex: 0,
    };
  }
}

function updateType(col: PrepareColumnInfo) {
  const cfg = fieldConfigs[col.name];
  if (cfg) {
    cfg.type = "";
    if (cfg.extraConfig) {
      delete cfg.extraConfig.listId;
      delete cfg.extraConfig.listName;
      delete cfg.extraConfig.listValues;
      delete cfg.extraConfig.valueType;
    }
  }
}

function resetFieldConfigs() {
  columns.value = [];
  Object.keys(fieldConfigs).forEach((k) => delete fieldConfigs[k]);
}

function typeValueFor(col: PrepareColumnInfo) {
  const cfg = fieldConfigs[col.name];
  if (!cfg) return "";
  if ((cfg.kind === "SequenceIn" || cfg.kind === "RandomIn") && cfg.type === "CustomList" && cfg.extraConfig?.listId) {
    return `custom:${cfg.extraConfig.listId}`;
  }
  return cfg.type || "";
}

function updateTypeSelection(col: PrepareColumnInfo, rawValue: string) {
  ensureFieldConfig(col);
  const cfg = fieldConfigs[col.name];
  if (rawValue.startsWith("custom:")) {
    const id = Number(rawValue.replace("custom:", ""));
    const list = (col.classification === "string" ? customStringLists.value : customNumberLists.value).find((l) => l.id === id);
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
}

function startNewProfile() {
  tableName.value = "";
  profileName.value = "";
  selectedDb.value = null;
  editingProfile.value = null;
  reuseProfileId.value = null;
  error.value = "";
  resetFieldConfigs();
}

async function loadDbProfiles() {
  allProfiles.value = await api.listProfiles(runtime);
}

async function loadCustomLists() {
  customStringLists.value = await api.listCustomValueLists(runtime, "string");
  customNumberLists.value = await api.listCustomValueLists(runtime, "number");
}

async function pullSchema() {
  error.value = "";
  const db = allProfiles.value.find((p) => p.id === selectedDb.value);
  if (!db) {
    error.value = "请先选择数据库";
    return;
  }
  if (!db.database) {
    error.value = "所选数据库配置缺少数据库名";
    return;
  }
  try {
    resetFieldConfigs();
    const columnsRes = await api.fetchSchema(runtime, { tableName: tableName.value, dbProfileId: selectedDb.value ?? undefined });
    columns.value = columnsRes;
    columns.value.forEach(ensureFieldConfig);
    await loadSavedProfiles();
  } catch (err: any) {
    error.value = err.message || "拉取失败";
  }
}

async function saveProfile() {
  if (!selectedDb.value) {
    error.value = "请先选择数据库";
    return;
  }
  const fields = columns.value.map((c) => fieldConfigs[c.name] || {
    columnName: c.name,
    columnTypeKind: c.classification === "number" ? "number" : "string",
    kind: "",
    type: "",
    extraConfig: {},
    orderIndex: 0,
  });
  const payload = {
    profileName: profileName.value || tableName.value,
    profileId: editingProfile.value ? editingProfile.value.id : undefined,
    tableName: tableName.value,
    columns: columns.value,
    fields,
    dbProfileId: selectedDb.value,
  };
  const res = await api.saveTableProfile(runtime, payload);
  editingProfile.value = { id: res.id, profileName: res.profileName };
  profileName.value = res.profileName;
  await loadSavedProfiles();
}

async function loadSavedProfiles() {
  savedProfiles.value = await api.listTableProfiles(runtime);
}

async function deleteProfile(id: number) {
  await api.deleteTableProfile(runtime, id);
  if (editingProfile.value?.id === id) {
    startNewProfile();
  }
  await loadSavedProfiles();
}

async function applyProfileFields(profileId: number, opts: { setMeta?: boolean } = {}) {
  const prof = savedProfiles.value.find((p) => p.id === profileId);
  if (!prof || !columns.value.length) return;
  const reusable = await api.applyTableProfile(runtime, profileId, columns.value);
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
  columns.value.forEach((c) => {
    fieldConfigs[c.name] = map[c.name] || {
      columnName: c.name,
      columnTypeKind: c.classification === "number" ? "number" : "string",
      kind: "",
      type: "",
      extraConfig: {},
      orderIndex: 0,
    };
  });
  if (opts.setMeta) {
    profileName.value = prof.profileName;
    editingProfile.value = { id: prof.id, profileName: prof.profileName };
  }
}

function editProfile(p: PrepareTableProfileSummary) {
  editingProfile.value = { id: p.id, profileName: p.profileName };
  tableName.value = p.tableName;
  profileName.value = p.profileName;
  selectedDb.value = p.dbProfileId;
  reuseProfileId.value = null;
  error.value = "";
  resetFieldConfigs();
}

async function configureFields(p: PrepareTableProfileSummary) {
  editProfile(p);
  await pullSchema();
  if (error.value || !columns.value.length) return;
  await applyProfileFields(p.id, { setMeta: true });
}

async function reuseFromProfile() {
  if (reuseProfileId.value === null) {
    error.value = "请选择要复用的profile";
    return;
  }
  if (!columns.value.length) {
    error.value = "请先拉取结构";
    return;
  }
  error.value = "";
  await applyProfileFields(reuseProfileId.value, { setMeta: false });
}

onMounted(async () => {
  await loadDbProfiles();
  await loadSavedProfiles();
  await loadCustomLists();
});
</script>
