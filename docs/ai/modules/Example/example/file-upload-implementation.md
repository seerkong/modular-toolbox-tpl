# 文件上传功能实现指南

本文档详细介绍了如何在本框架中实现文件上传功能。

## 概述

文件上传功能从 Shared 层到 Frontend Shell 层的完整实现，展示了框架的分层架构。

## 实现内容

### 1. Shared 层（跨端共享）

#### 文件：`shared/src/modules/Example/Api.ts`

```typescript
export enum ExampleApi {
  // ...其他 API
  FileUpload = "/api/example/upload",
}
```

#### 文件：`shared/src/modules/Example/DTO.ts`

```typescript
export interface ExampleFileUploadResponse {
  filename: string;
  size: number;
  contentType: string;
  content: string;       // 文件内容预览（前1000字符）
  uploadedAt: string;
}
```

### 2. Backend Core 层（业务契约）

#### 文件：`backend/packages/core/src/modules/Example/contract/index.ts`

```typescript
export interface ExampleService {
  // ...其他方法
  uploadFile(filename: string, content: string, contentType: string, size: number): ExampleFileUploadResponse;
}
```

### 3. Backend Mediator 层（技术实现）

#### 文件：`backend/packages/mediator/src/modules/Example/service/ExampleService.ts`

```typescript
uploadFile(filename: string, content: string, contentType: string, size: number): ExampleFileUploadResponse {
  return {
    filename,
    size,
    contentType,
    content: content.substring(0, 1000), // 只返回前1000字符作为预览
    uploadedAt: new Date().toISOString(),
  };
}
```

#### 目录结构

```
backend/packages/mediator/src/modules/Example/endpoint/PostFormData/
  ├── fileUpload.ts       # 文件上传 endpoint 实现
  └── index.ts           # 导出 handler 工厂函数
```

#### 核心实现逻辑（fileUpload.ts）

```typescript
import type { PostEndpoint } from '@backend/mediator/infra/types'
import { ExampleApi, ExampleFileUploadResponse } from '@app/shared'
import { ok, fail } from '@backend/mediator/infra/response'

const pickFileFromBody = (body: any): File | null => {
  if (!body) return null;
  if (body instanceof File) return body;
  if (body.file instanceof File) return body.file;
  return null;
};

const resolveFile = async (body: any, request: Request): Promise<File | null> => {
  // 1. 从 body 中提取（Elysia 自动解析）
  const candidate = pickFileFromBody(body);
  if (candidate) return candidate;

  // 2. 手动从 request 解析 FormData
  return await request
    .formData()
    .then((form) => (form?.get("file") as File | null))
    .catch(() => null);
};

const tryReadBuffer = async (file: File): Promise<ArrayBuffer | null> => {
  try {
    return await file.arrayBuffer();
  } catch {
    return null;
  }
};

export const createFileUploadEndpoint = (service: ExampleService): PostEndpoint => {
  return async ({ body, request, error, setHeader, log }) => {
    const file = await resolveFile(body, request);
    if (!file) {
      return error(400, fail("file is required"));
    }

    const buffer = await tryReadBuffer(file);
    if (!buffer) {
      return error(400, fail("Failed to read file content"));
    }

    const content = new TextDecoder().decode(buffer);
    const result = service.uploadFile(
      file.name,
      content,
      file.type || "application/octet-stream",
      file.size
    );

    setHeader("X-Uploaded-Filename", result.filename);
    setHeader("X-Uploaded-Size", String(result.size));

    log?.info(`File uploaded: ${result.filename} (${result.size} bytes)`);

    return ok(result);
  };
};
```

#### 文件：`backend/packages/mediator/src/modules/Example/manifest.ts`

```typescript
// 在 createEndpoints(runtime) 中注册 FormData handlers
import { createFileUploadEndpoint } from './endpoint/PostFormData/fileUpload'

export function createEndpoints(runtime: ExampleRuntime) {
  return {
    // ...其他端点
    [ExampleApi.FileUpload]: createFileUploadEndpoint(runtime.actorMesh.exampleService),
  }
}
```

### 4. Frontend Core 层（前端业务）

#### 文件：`frontend/packages/core/src/modules/Example/contract/Api.ts`

```typescript
export interface ExampleApi {
  // ...其他方法
  uploadFile(runtime: ExampleRuntime, file: File): Promise<ExampleFileUploadResponse>;
}
```

#### 文件：`frontend/packages/core/src/modules/Example/api/ApiImpl.ts`

```typescript
async uploadFile(runtime: ExampleRuntime, file: File): Promise<ExampleFileUploadResponse> {
  const form = new FormData();
  form.append("file", file);
  const res = await this.request<ApiResponse<ExampleFileUploadResponse>>(runtime, {
    url: ExampleApiType.FileUpload,
    method: "POST",
    body: form,  // FormData 自动设置 Content-Type
  });
  return this.unwrap(res);
}
```

### 5. Frontend Vue 组件

#### 文件：`frontend/packages/vue/src/modules/Example/view/ExampleFileUpload.vue`

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useFrontendRuntime } from '@frontend/vue/hooks/use-runtime'
import type { ExampleFileUploadResponse } from '@app/shared'

const { example } = useFrontendRuntime()
const selectedFile = ref<File | null>(null)
const uploading = ref(false)
const uploadResult = ref<ExampleFileUploadResponse | null>(null)
const errorMessage = ref('')

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  selectedFile.value = target.files?.[0] || null
  uploadResult.value = null
  errorMessage.value = ''
}

async function uploadFile() {
  if (!selectedFile.value) return

  uploading.value = true
  errorMessage.value = ''

  try {
    const result = await example.exampleApi.uploadFile(example.runtime, selectedFile.value)
    uploadResult.value = result
  } catch (err: any) {
    errorMessage.value = err.message || 'Upload failed'
  } finally {
    uploading.value = false
  }
}
</script>

<template>
  <div class="card">
    <div class="section-title">文件上传</div>

    <div style="margin-bottom: 12px;">
      <input type="file" @change="handleFileChange" />
    </div>

    <div v-if="selectedFile" style="margin-bottom: 12px; color: var(--muted);">
      已选择: {{ selectedFile.name }} ({{ selectedFile.size }} bytes)
    </div>

    <button
      class="button"
      :disabled="!selectedFile || uploading"
      @click="uploadFile"
    >
      {{ uploading ? '上传中...' : '上传' }}
    </button>

    <div v-if="errorMessage" class="alert error" style="margin-top: 12px;">
      {{ errorMessage }}
    </div>

    <div v-if="uploadResult" class="card" style="margin-top: 12px;">
      <div class="section-title">上传结果</div>
      <table class="table">
        <tr><td>文件名</td><td>{{ uploadResult.filename }}</td></tr>
        <tr><td>大小</td><td>{{ uploadResult.size }} bytes</td></tr>
        <tr><td>类型</td><td>{{ uploadResult.contentType }}</td></tr>
        <tr><td>上传时间</td><td>{{ uploadResult.uploadedAt }}</td></tr>
      </table>
      <div style="margin-top: 12px;">
        <div style="color: var(--muted); font-size: 12px; margin-bottom: 6px;">
          内容预览 (前1000字符)
        </div>
        <pre><code>{{ uploadResult.content }}</code></pre>
      </div>
    </div>
  </div>
</template>
```

### 6. Frontend React 组件

#### 文件：`frontend/packages/react/src/modules/Example/view/ExampleFileUpload.tsx`

```tsx
import { useState } from 'react'
import { useFrontendRuntime } from '@frontend/react/runtime'
import type { ExampleFileUploadResponse } from '@app/shared'

export function ExampleFileUpload() {
  const { example } = useFrontendRuntime()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<ExampleFileUploadResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSelectedFile(e.target.files?.[0] || null)
    setUploadResult(null)
    setErrorMessage('')
  }

  async function uploadFile() {
    if (!selectedFile) return

    setUploading(true)
    setErrorMessage('')

    try {
      const result = await example.exampleApi.uploadFile(example.runtime, selectedFile)
      setUploadResult(result)
    } catch (err: any) {
      setErrorMessage(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="card">
      <div className="section-title">文件上传</div>

      <div style={{ marginBottom: 12 }}>
        <input type="file" onChange={handleFileChange} />
      </div>

      {selectedFile && (
        <div style={{ marginBottom: 12, color: 'var(--muted)' }}>
          已选择: {selectedFile.name} ({selectedFile.size} bytes)
        </div>
      )}

      <button
        className="button"
        disabled={!selectedFile || uploading}
        onClick={uploadFile}
      >
        {uploading ? '上传中...' : '上传'}
      </button>

      {errorMessage && (
        <div className="alert error" style={{ marginTop: 12 }}>
          {errorMessage}
        </div>
      )}

      {uploadResult && (
        <div className="card" style={{ marginTop: 12 }}>
          <div className="section-title">上传结果</div>
          <table className="table">
            <tbody>
              <tr><td>文件名</td><td>{uploadResult.filename}</td></tr>
              <tr><td>大小</td><td>{uploadResult.size} bytes</td></tr>
              <tr><td>类型</td><td>{uploadResult.contentType}</td></tr>
              <tr><td>上传时间</td><td>{uploadResult.uploadedAt}</td></tr>
            </tbody>
          </table>
          <div style={{ marginTop: 12 }}>
            <div style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 6 }}>
              内容预览 (前1000字符)
            </div>
            <pre><code>{uploadResult.content}</code></pre>
          </div>
        </div>
      )}
    </div>
  )
}
```

## 关键技术细节

### 1. FormData 处理

**Backend**:
```typescript
// 多种方式解析文件
const resolveFile = async (body: any, request: Request): Promise<File | null> => {
  // 1. 从 body 中提取（Elysia 自动解析）
  const candidate = pickFileFromBody(body);
  if (candidate) return candidate;

  // 2. 手动从 request 解析 FormData
  return await request
    .formData()
    .then((form) => (form?.get("file") as File | null))
    .catch(() => null);
};
```

**Frontend**:
```typescript
// 创建 FormData 并附加文件
const form = new FormData();
form.append("file", file);  // file 是 HTMLInputElement.files[0]
```

### 2. 文件内容读取

```typescript
// Backend 读取 ArrayBuffer
const buffer = await file.arrayBuffer();
const content = new TextDecoder().decode(buffer);
```

### 3. 错误处理

- 文件为空检查
- JSON 解析错误处理
- 网络请求错误捕获
- 用户友好的错误提示

### 4. 响应头设置

```typescript
setHeader("X-Uploaded-Filename", filename);
setHeader("X-Uploaded-Size", String(size));
```

## 共享的核心模式

### 1. Backend endpoint 结构

```typescript
export const createFileUploadEndpoint = (service: Service): PostEndpoint => {
  return async ({ body, request, error, setHeader, log }) => {
    const file = await resolveFile(body, request);
    if (!file) return error(400, fail("file is required"));
    const buffer = await tryReadBuffer(file);
    // ...处理逻辑
    return ok(result);
  };
};
```

### 2. Frontend API 调用

```typescript
async uploadFile(runtime: Runtime, file: File): Promise<Response> {
  const form = new FormData();
  form.append("file", file);
  const res = await this.request({
    url: ApiType.FileUpload,
    method: "POST",
    body: form,
  });
  return this.unwrap(res);
}
```

### 3. UI 组件交互

```typescript
const handleFile = (e) => setSelectedFile(e.target.files?.[0]);
const uploadFile = async () => {
  setUploading(true);
  try {
    const result = await api.uploadFile(runtime, selectedFile);
    setUploadResult(result);
  } catch (err) {
    setError(err.message);
  } finally {
    setUploading(false);
  }
};
```

## 架构优势

### 1. 分层清晰

- **Shared**: 契约定义（API路径、DTO）
- **Backend Core**: 业务接口
- **Backend Mediator**: 技术实现
- **Frontend Core**: API 客户端
- **Frontend Shell**: UI 组件

### 2. 类型安全

- 全栈 TypeScript
- 接口定义统一
- 编译时类型检查

### 3. 可复用性

- endpoint 工具函数可复用
- UI 组件模式可复制
- FormData 处理逻辑标准化

### 4. 可扩展性

- 轻松支持多文件上传
- 可添加文件大小/类型限制
- 可集成文件存储服务（S3等）

## 使用指南

### 后端启动

```bash
cd backend
bun run dev  # 开发模式
# 或
bun run build && ./packages/elysia/dist/modular-toolbox-tpl-backend
```

### 前端访问

**Vue**:
```bash
cd frontend/packages/vue
bun run dev
# 访问 http://localhost:5173/example/file-upload
```

**React**:
```bash
cd frontend/packages/react
bun run dev
# 访问 http://localhost:5174/example/file-upload
```

### API 调用示例

```bash
curl -X POST http://localhost:4000/api/example/upload \
  -F "file=@test-upload.json" \
  -H "Accept: application/json"
```

## 测试验证

### 测试结果

```
🚀 Testing file upload endpoint...
📄 File: ./test-upload.json
📊 Size: 251 bytes
🌐 POST http://127.0.0.1:4000/api/example/upload
📡 Status: 200 OK
📋 Headers:
   x-uploaded-filename: test-upload.json
   x-uploaded-size: 251
✅ Upload successful!
```

### 测试覆盖

1. FormData 文件上传
2. 文件内容正确读取
3. 文件元信息（名称、大小、类型）正确返回
4. 自定义响应头正确设置
5. JSON 响应格式符合规范
