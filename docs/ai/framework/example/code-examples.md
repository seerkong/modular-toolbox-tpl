# 代码示例集

常用代码示例。

## 实体定义示例

```typescript
// backend/packages/core/src/modules/Example/entity/ExampleEntity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm'

@Entity('example')
export class ExampleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'text' })
  name: string

  @CreateDateColumn()
  createdAt: Date
}
```

## 端点工厂示例

```typescript
// backend/packages/mediator/src/modules/Example/endpoint/GetJson/getDemo.ts
import type { EndpointRoute } from '@backend/mediator/infra/types'
import type { ExampleActorMesh } from '../../manifest'
import { ExampleApi, ExampleResponse } from '@app/shared'

export function createGetDemoEndpoint(
  actorMesh: ExampleActorMesh
): EndpointRoute<ExampleResponse> {
  return {
    method: 'GET',
    path: ExampleApi.GetDemo,
    handler: async () => {
      const result = await actorMesh.exampleService.getDemo()
      return result
    },
  }
}
```

## 控制器示例

```typescript
// frontend/packages/mediator/src/modules/Example/controller/ExampleController.ts
import { ExampleState } from '@frontend/core/modules/Example/state'
import { ExampleApiClient } from '@frontend/core/modules/Example/api'

export class ExampleController {
  constructor(
    private state: ExampleState,
    private api: ExampleApiClient
  ) {}

  async loadDemo() {
    this.state.loading = true
    try {
      const result = await this.api.getDemo()
      this.state.data = result
    } finally {
      this.state.loading = false
    }
  }
}
```

## React 组件示例

```tsx
// frontend/packages/react/src/modules/Example/view/ExampleView.tsx
import { useFrontendRuntime } from '@frontend/react/runtime'
import { useReactiveValue } from '@frontend/react/hooks/useReactiveValue'

export function ExampleView() {
  const { example } = useFrontendRuntime()
  const data = useReactiveValue(() => example.state.data)
  const loading = useReactiveValue(() => example.state.loading)

  return (
    <div className="card">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <p>{data?.message}</p>
      )}
      <button
        className="button"
        onClick={() => example.controller.loadDemo()}
      >
        Load Demo
      </button>
    </div>
  )
}
```

## Vue 组件示例

```vue
<!-- frontend/packages/vue/src/modules/Example/view/ExampleView.vue -->
<script setup lang="ts">
import { useFrontendRuntime } from '@frontend/vue/hooks/use-runtime'

const { example } = useFrontendRuntime()
</script>

<template>
  <div class="card">
    <p v-if="example.state.loading">Loading...</p>
    <p v-else>{{ example.state.data?.message }}</p>
    <button class="button" @click="example.controller.loadDemo()">
      Load Demo
    </button>
  </div>
</template>
```

## 按钮主题兼容示例

```vue
<!-- 正确：使用 CSS 类 -->
<button class="button">默认按钮</button>
<button class="button button-active">激活按钮</button>
<button class="button button-danger">危险按钮</button>

<!-- 错误：内联颜色 -->
<button style="background-color: #007bff;">按钮</button>
```
