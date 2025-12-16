<template>
  <div class="card">
    <h3 class="section-title">数据插入执行</h3>
    <div class="grid two">
      <div>
        <label>选择数据库</label>
        <select v-model.number="selectedDbId" @change="loadProfiles">
          <option :value="null">请选择数据库</option>
          <option v-for="p in dbProfiles" :key="p.id" :value="p.id">
            {{ p.name }} ({{ p.host }}:{{ p.port }} / {{ p.database || '默认DB' }})
          </option>
        </select>
      </div>
      <div>
        <label>选择已完成的 Profile</label>
        <select v-model.number="selectedProfileId" @change="onSelectProfile">
          <option :value="0">请选择</option>
          <option v-for="p in profiles" :key="p.id" :value="p.id">
            {{ p.profileName }} ({{ p.tableName }})
          </option>
        </select>
      </div>
      <div>
        <label>Profile 信息</label>
        <div
          class="badge"
          :class="selectedProfile ? 'accent' : 'muted'"
          style="background:color-mix(in srgb, var(--card) 80%, transparent); border:1px solid var(--border); color:var(--text);"
        >
          <template v-if="selectedProfile">
            名称: {{ selectedProfile.profileName }} | 数据库: {{ selectedDb?.database || '未设置' }} | 表: {{ selectedProfile.tableName }}
          </template>
          <template v-else>请选择已完成的 Profile</template>
        </div>
      </div>
    </div>
    <div class="grid two" style="margin-top:12px;">
      <div>
        <label>插入总条目数</label>
        <input type="number" v-model.number="totalRows" />
      </div>
      <div>
        <label>每批次条目数</label>
        <input type="number" v-model.number="batchSize" />
      </div>
    </div>
    <div style="display:flex; gap:8px; margin-top:12px;">
      <button @click="preview" :disabled="!ready || !!currentTaskId">预览</button>
      <button @click="execute" :disabled="!ready || !!currentTaskId">执行插入</button>
      <button @click="cancelTask" :disabled="!currentTaskId">终止任务</button>
    </div>
    <div v-if="error" class="alert error" style="margin-top:10px;">{{ error }}</div>
    <div v-if="previewSql.length" style="margin-top:12px;" class="card">
      <div class="section-title" style="display:flex; justify-content:space-between; align-items:center;">
        <span>预览SQL</span>
        <div style="display:flex; gap:8px; align-items:center;">
          <button @click="togglePreview" style="padding:6px 10px;">{{ previewCollapsed ? '展开' : '收起' }}</button>
          <button @click="copyPreview" style="padding:6px 10px;">复制</button>
        </div>
      </div>
      <pre
        v-show="!previewCollapsed"
        style="white-space:pre-wrap; font-size:13px; background:var(--code-bg); color:var(--code-text); padding:10px; border-radius:8px; border:1px solid var(--code-border);"
      >{{ previewSql.join("\n") }}</pre>
    </div>
    <div style="margin-top:12px; display:flex; flex-direction:column; gap:8px;">
      <div
        style="border:1px solid var(--border); border-radius:10px; padding:12px 14px; background:color-mix(in srgb, var(--card) 85%, var(--bg-2) 15%); display:flex; justify-content:space-between; align-items:center; gap:12px;"
      >
        <div style="font-weight:600; color:var(--text);">任务进度</div>
        <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap; justify-content:flex-end;">
          <span style="color:var(--text-secondary);">{{ progress }}</span>
          <span
            :style="{
              border: `1px solid ${statusTone.border}`,
              background: statusTone.bg,
              color: statusTone.color,
              padding: '6px 10px',
              borderRadius: '999px',
              fontWeight: 600,
              minWidth: '96px',
              textAlign: 'center',
            }"
          >
            状态: {{ statusText }}
          </span>
        </div>
      </div>

      <div
        class="debug-panel"
        style="max-height:220px; overflow-y:auto; border:1px dashed var(--border); border-radius:10px; padding:10px 12px; background:color-mix(in srgb, var(--card) 82%, var(--bg-3) 18%);"
      >
        <div style="margin-bottom:6px; color:var(--muted); font-size:13px;">任务日志</div>
        <div style="display:flex; flex-direction:column; gap:4px;">
          <div
            v-for="(evt, idx) in events"
            :key="idx"
            class="badge muted"
            style="color:var(--log-text, var(--text)); background:color-mix(in srgb, var(--bg-2) 70%, transparent); border:1px solid color-mix(in srgb, var(--border) 70%, transparent);"
          >
            {{ evt }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, nextTick } from "vue";
import type {
  PrepareColumnInfo,
  PrepareFieldConfig,
  PrepareTableProfileSummary,
  PrepareDbProfileDTO,
  PrepareTaskEvent,
} from "@frontend/core/modules/PrepareDbDataTool/contract";
import { useFrontendRuntime } from "@frontend/vue/hooks/use-runtime";

const runtime = useFrontendRuntime();
const api = runtime.actorMesh.modules.PrepareDbDataTool.prepareDbDataApi;

const totalRows = ref(20);
const batchSize = ref(10);
const events = ref<string[]>([]);
const previewSql = ref<string[]>([]);
const progress = ref("等待");
const error = ref("");
const previewCollapsed = ref(false);
const profiles = ref<PrepareTableProfileSummary[]>([]);
const dbProfiles = ref<PrepareDbProfileDTO[]>([]);
const selectedProfileId = ref(0);
const selectedProfile = computed(() => profiles.value.find((p) => p.id === selectedProfileId.value));
const selectedDbId = ref<number | null>(null);
const selectedDb = computed(() => dbProfiles.value.find((p) => p.id === selectedDbId.value));
const currentTaskId = ref<string | null>(null);
const statusText = ref("等待");
const statusTone = computed(() => {
  const key = (statusText.value || "").toLowerCase();
  if (key.includes("fail")) return { color: "var(--status-failed)", bg: "var(--status-failed-bg)", border: "var(--status-failed-border)" };
  if (key.includes("complete")) return { color: "var(--status-done)", bg: "var(--status-done-bg)", border: "var(--status-done-border)" };
  if (key.includes("cancel")) return { color: "var(--status-init)", bg: "var(--status-init-bg)", border: "var(--status-init-border)" };
  return { color: "var(--status-init)", bg: "var(--status-init-bg)", border: "var(--status-init-border)" };
});
const columns = ref<PrepareColumnInfo[]>([]);
const fieldConfigs = ref<Record<string, PrepareFieldConfig>>({});

const ready = computed(() => {
  if (!selectedProfile.value || !selectedDbId.value) return false;
  if (!selectedDb.value?.database) return false;
  const hasConfigs = columns.value.every((c) => {
    const cfg = fieldConfigs.value[c.name];
    return cfg && cfg.kind && cfg.type && c.classification !== "unsupported";
  });
  return Boolean(columns.value.length && hasConfigs);
});

let wsCleanup: (() => void) | null = null;

onMounted(async () => {
  await loadDbProfiles();
  await loadProfiles();
  wsCleanup = api.connectProgressSocket(runtime, handleWsMessage);
});

onUnmounted(() => {
  wsCleanup?.();
});

async function loadDbProfiles() {
  dbProfiles.value = await api.listProfiles(runtime);
}

async function loadProfiles() {
  const list = await api.listTableProfiles(runtime, selectedDbId.value ?? undefined);
  profiles.value = (list || []).filter((p: PrepareTableProfileSummary) => p.isComplete);
}

async function onSelectProfile() {
  events.value = [];
  previewSql.value = [];
  progress.value = "等待";
  error.value = "";
  fieldConfigs.value = {};
  columns.value = [];
  if (!selectedProfile.value) return;
  const detail = await api.getTableProfile(runtime, selectedProfileId.value);
  if (detail?.dbProfileId) {
    selectedDbId.value = detail.dbProfileId;
  }
  const columnsRes = await api.fetchSchema(runtime, { tableProfileId: selectedProfileId.value, dbProfileId: selectedDbId.value ?? undefined, tableName: null });
  columns.value = columnsRes;
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
  columns.value.forEach((c) => {
    const cfg = map[c.name];
    if (cfg && ((c.classification === "number" && cfg.columnTypeKind === "number") || (c.classification === "string" && cfg.columnTypeKind === "string"))) {
      filtered[c.name] = cfg;
    }
  });
  fieldConfigs.value = filtered;
}

function buildPayload() {
  return {
    tableName: selectedProfile.value?.tableName,
    totalRows: totalRows.value,
    batchSize: batchSize.value,
    columns: columns.value,
    fieldConfigs: Object.values(fieldConfigs.value),
    dbProfileId: selectedDbId.value || undefined,
    database: selectedDb.value?.database || undefined,
  };
}

async function preview() {
  error.value = "";
  events.value = [];
  try {
    const res = await api.previewInsert(runtime, buildPayload());
    previewSql.value = res.statements;
  } catch (err: any) {
    error.value = err.message || "预览失败";
  }
}

async function execute() {
  error.value = "";
  events.value = [];
  progress.value = `进度 -- 完成/失败/总数: 0/0/${totalRows.value}`;
  statusText.value = "执行中";
  try {
    const res = await api.executeInsert(runtime, buildPayload());
    currentTaskId.value = res.taskId;
  } catch (err: any) {
    error.value = err.message || "执行失败";
    progress.value = "失败";
  }
}

async function cancelTask() {
  if (!currentTaskId.value) return;
  await api.cancelTask(runtime, currentTaskId.value);
  statusText.value = "已请求终止";
}

async function copyPreview() {
  try {
    await navigator.clipboard.writeText(previewSql.value.join("\n"));
    progress.value = "已复制";
  } catch (err: any) {
    error.value = "复制失败: " + (err?.message || "未知错误");
  }
}

function togglePreview() {
  previewCollapsed.value = !previewCollapsed.value;
}

function handleWsMessage(msg: PrepareTaskEvent) {
  if (!currentTaskId.value || msg.taskId !== currentTaskId.value) return;
  const appendLog = (message?: string) => {
    if (!message) return;
    events.value = [...events.value, message].slice(-200);
  };
  if (msg.type === "log") {
    appendLog(msg.message);
  }
  if (msg.type === "progress" || msg.type === "status") {
    const p = msg.progress;
    if (p) {
      progress.value = `进度 -- 完成/失败/总数: ${p.completed}/${p.failed}/${p.total}`;
      statusText.value = p.status;
      if (p.status === "completed" || p.status === "failed" || p.status === "cancelled") {
        currentTaskId.value = null;
      }
    }
    appendLog(msg.message);
  }
  nextTick(() => {
    const panel = document.querySelector(".debug-panel");
    if (panel) (panel as HTMLElement).scrollTop = (panel as HTMLElement).scrollHeight;
  });
}
</script>
