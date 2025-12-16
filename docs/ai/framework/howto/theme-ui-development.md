# 主题兼容 UI 开发指南

本指南介绍如何构建与主题系统兼容的 UI 组件。

## 导入样式

在应用入口点导入共享样式：

**Vue (`main.ts`)**:
```typescript
import "@frontend/mediator/styles/index.css";
```

**React (`App.tsx`)**:
```typescript
import "@frontend/mediator/styles/index.css";
```

## 使用主题 Hook

Vue 和 React 都提供 `useTheme` Hook：

**Vue**:
```typescript
import { useTheme } from "../hooks/useTheme";

const { theme, setTheme, themeClass, isCrt } = useTheme();
```

**React**:
```typescript
import { useTheme } from "../hooks/useTheme";

const { theme, setTheme, themeClass, isCrt } = useTheme();
```

应用主题类到根元素：

**Vue**:
```vue
<div class="app-shell" :class="themeClass">
```

**React**:
```tsx
<div className={`app-shell ${themeClass}`}>
```

## Do's and Don'ts

### DO: 在样式中使用 CSS 变量

```vue
<template>
  <div class="my-card">
    <h2 class="my-title">Title</h2>
    <p>Content</p>
  </div>
</template>

<style>
/* GOOD - 使用主题变量 */
.my-card {
  background: var(--card);
  border: 1px solid var(--border);
  color: var(--text);
}

.my-title {
  color: var(--text);
  border-bottom: 1px solid var(--border);
}
</style>
```

### DON'T: 使用硬编码颜色

```vue
<style>
/* BAD - 硬编码颜色会破坏主题切换 */
.my-card {
  background: #ffffff;
  border: 1px solid #d2d0c8;
  color: #2f2f2f;
}
</style>
```

### DO: 在内联样式中使用 CSS 变量

```vue
<template>
  <!-- GOOD -->
  <small style="color: var(--muted)">Hint text</small>
  <div style="background: var(--input-bg); border: 1px solid var(--input-border)">
    Content
  </div>
</template>
```

### DON'T: 在内联样式中使用硬编码颜色

```vue
<template>
  <!-- BAD -->
  <small style="color: #666666">Hint text</small>
  <div style="background: #f0f0f0; border: 1px solid #cccccc">
    Content
  </div>
</template>
```

### DO: 使用现有 CSS 类

```vue
<template>
  <!-- GOOD - 使用预定义类 -->
  <div class="card">
    <div class="section-title">Title</div>
    <div class="alert info">Info message</div>
    <span class="status-pill done">Done</span>
  </div>
</template>
```

### DON'T: 重复发明已有组件

```vue
<template>
  <!-- BAD - 重复 .card 样式 -->
  <div style="background: var(--card); border: 1px solid var(--border);
              border-radius: 12px; padding: 14px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.25)">
    Content
  </div>
</template>
```

### DO: 使用 `<pre><code>` 显示代码块

```vue
<template>
  <!-- GOOD - 语义化且有样式 -->
  <pre><code>{ "key": "value" }</code></pre>
</template>
```

### DON'T: 使用内联样式显示代码块

```vue
<template>
  <!-- BAD - 内联样式不适应主题 -->
  <pre style="background: #1a1a1a; color: #ffffff; padding: 10px;">
    { "key": "value" }
  </pre>
</template>
```

### DO: 使用状态变量显示状态指示器

```css
/* GOOD */
.my-status.success {
  color: var(--status-done);
  background: var(--status-done-bg);
  border-color: var(--status-done-border);
}

.my-status.error {
  color: var(--status-failed);
  background: var(--status-failed-bg);
  border-color: var(--status-failed-border);
}
```

### DON'T: 使用固定颜色显示状态

```css
/* BAD - 颜色不匹配主题调色板 */
.my-status.success {
  color: #00ff00;
  background: #e8f5e9;
}

.my-status.error {
  color: #ff0000;
  background: #ffebee;
}
```

### DO: 显式设置关键元素的 `color`

```css
/* GOOD - 确保文本可见 */
.section-title {
  font-weight: 700;
  color: var(--text);
}

.brand-name {
  font-size: 18px;
  color: var(--text);
}
```

### DON'T: 仅依赖继承设置重要文本

```css
/* BAD - 某些上下文中可能无法正确继承 */
.section-title {
  font-weight: 700;
  /* 缺少 color! */
}
```

## 可用 CSS 类

| 类名 | 用途 |
|------|------|
| `.card` | 带背景、边框、阴影的容器 |
| `.section-title` | 粗体标题文本 |
| `.alert`, `.alert.info`, `.alert.error` | 警告框 |
| `.status-pill`, `.status-pill.done/failed/init` | 状态徽章 |
| `.chip` | 小标签 |
| `.button`, `.button.active`, `.button.danger` | 按钮变体 |
| `.table` | 样式化表格 |
| `.debug-panel` | 调试/日志容器 |
| `.log-line` | 日志文本行 |

## 主题感知组件示例

```vue
<template>
  <div class="card">
    <div class="section-title">Task Status</div>

    <div class="alert info" style="margin-bottom: 10px;">
      Click a task to view details.
    </div>

    <table class="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="task in tasks" :key="task.id">
          <td>{{ task.id }}</td>
          <td>{{ task.name }}</td>
          <td>
            <span class="status-pill" :class="task.status">
              {{ task.status }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="debug-panel" style="margin-top: 10px;">
      <div style="color: var(--muted); font-size: 12px; margin-bottom: 6px;">
        Debug Output
      </div>
      <div v-for="log in logs" :key="log" class="log-line">
        {{ log }}
      </div>
    </div>
  </div>
</template>
```

## CRT 主题特效

CRT 主题 (crt-amber, crt-green) 使用 `isCrt` 标志条件渲染特效：

```vue
<template>
  <div class="app-shell" :class="themeClass">
    <!-- CRT 覆盖层特效 -->
    <div v-if="isCrt" class="crt-layer backdrop"></div>
    <div v-if="isCrt" class="crt-layer scanlines"></div>
    <div v-if="isCrt" class="crt-layer vignette"></div>

    <!-- 正常内容 -->
    <main>...</main>
  </div>
</template>
```

## 测试检查清单

提交 UI 更改前必须验证：

- [ ] 切换到 **e-ink** 主题 - 验证浅色背景可读性
- [ ] 切换到 **crt-amber** 主题 - 验证琥珀色调可读性
- [ ] 切换到 **crt-green** 主题 - 验证绿色调可读性
- [ ] 检查所有文本对比度足够
- [ ] 检查状态指示器可区分
- [ ] 检查代码块可读
