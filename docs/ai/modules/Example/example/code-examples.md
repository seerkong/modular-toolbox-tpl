# Example 模块代码示例

API 契约、端点、组件的代码示例。

## API 契约

### Shared 层 Api.ts

```typescript
// shared/src/modules/Example/Api.ts
export enum ExampleApi {
  GetDemo = '/api/example/demo',
  PostExample = '/api/example/create',
  FileUpload = '/api/example/file-upload',
  Stream = '/api/example/stream',
}
```

### Shared 层 DTO.ts

```typescript
// shared/src/modules/Example/DTO.ts
export interface ExampleResponse {
  message: string
  timestamp: number
}

export interface ExampleFileUploadResponse {
  filename: string
  size: number
  content: string
}
```

## 端点工厂

### GET JSON 端点

```typescript
// backend/packages/mediator/src/modules/Example/endpoint/GetJson/getDemo.ts
import type { EndpointRoute } from '@backend/mediator/infra/types'
import { ExampleApi, ExampleResponse } from '@app/shared'

export function createGetDemoEndpoint(actorMesh): EndpointRoute<ExampleResponse> {
  return {
    method: 'GET',
    path: ExampleApi.GetDemo,
    handler: async () => ({
      message: 'Hello from Example module',
      timestamp: Date.now(),
    }),
  }
}
```

### POST FormData 端点（文件上传）

```typescript
// backend/packages/mediator/src/modules/Example/endpoint/PostFormData/fileUpload.ts
export function createFileUploadEndpoint(): EndpointRoute<ExampleFileUploadResponse> {
  return {
    method: 'POST',
    path: ExampleApi.FileUpload,
    handler: async (ctx) => {
      const formData = await ctx.request.formData()
      const file = formData.get('file') as File
      const arrayBuffer = await file.arrayBuffer()
      const content = new TextDecoder().decode(arrayBuffer)
      return { filename: file.name, size: file.size, content: content.substring(0, 100) }
    },
  }
}
```

## 组件示例

### Vue

```vue
<script setup lang="ts">
import { useFrontendRuntime } from '@frontend/vue/hooks/use-runtime'
const { example } = useFrontendRuntime()
</script>

<template>
  <div class="card">
    <p v-if="example.state.loading">Loading...</p>
    <p v-else>{{ example.state.data?.message }}</p>
  </div>
</template>
```

### React

```tsx
import { useFrontendRuntime } from '@frontend/react/runtime'
import { useReactiveValue } from '@frontend/react/hooks/useReactiveValue'

export function ExampleView() {
  const { example } = useFrontendRuntime()
  const data = useReactiveValue(() => example.state.data)
  return <div className="card">{data?.message}</div>
}
```
