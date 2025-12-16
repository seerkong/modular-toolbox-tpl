# 主题系统维护指南

本指南介绍如何维护和扩展位于 `frontend/packages/mediator/src/styles/` 的主题系统。

## 文件结构

```
frontend/packages/mediator/src/styles/
├── index.css      # 入口点，导入 themes.css 和 base.css
├── themes.css     # 所有主题的 CSS 变量定义
└── base.css       # 使用 CSS 变量的组件样式
```

## 添加新主题

### 1. 在 `themes.css` 中添加主题变量

```css
/* ===== My New Theme ===== */
.theme-my-new {
  /* 基础颜色 */
  --bg: #...;
  --bg-2: #...;
  --bg-3: #...;
  --card: rgba(...);
  --border: #...;
  --text: #...;
  --text-secondary: #...;
  --muted: #...;
  --accent: #...;
  --input-bg: #...;
  --input-border: #...;

  /* 代码块 */
  --code-bg: #...;
  --code-text: #...;
  --code-border: #...;

  /* 状态颜色 */
  --status-done: #...;
  --status-done-bg: rgba(...);
  --status-done-border: #...;
  --status-failed: #...;
  --status-failed-bg: rgba(...);
  --status-failed-border: #...;
  --status-init: #...;
  --status-init-bg: rgba(...);
  --status-init-border: #...;

  /* 警告颜色 */
  --alert-info-border: #...;
  --alert-error-border: #...;

  /* 表格 */
  --table-border: #...;

  /* 芯片/徽章 */
  --chip-bg: #...;
  --chip-border: #...;

  /* 日志 */
  --log-text: #...;
}
```

### 2. 在 Shell 的 `useTheme` Hook 中注册

在 Vue 和 React 的 `useTheme` hook 中添加新主题选项。

### 3. 在 `AppLayout` 组件中添加主题按钮

## 添加新 CSS 变量

添加新 CSS 变量时：

1. **在所有主题中添加** - 必须在 `themes.css` 的每个主题中定义（e-ink, crt-amber, crt-green）
2. **使用适当的颜色** - 根据每个主题的调色板选择适当的颜色
3. **在 `base.css` 中使用** - 使用新变量定义组件样式

## Do's and Don'ts

### DO: 所有颜色使用 CSS 变量

```css
/* GOOD */
.my-component {
  color: var(--text);
  background: var(--card);
  border: 1px solid var(--border);
}
```

### DON'T: 硬编码颜色值

```css
/* BAD - 破坏主题切换 */
.my-component {
  color: #2f2f2f;
  background: #ffffff;
  border: 1px solid #d2d0c8;
}
```

### DO: 在所有主题中定义变量

```css
/* GOOD - 变量在所有主题中定义 */
:root, .theme-e-ink { --my-color: #333; }
.theme-crt-amber { --my-color: #ffddae; }
.theme-crt-green { --my-color: #c6ffd8; }
```

### DON'T: 只在一个主题中添加变量

```css
/* BAD - 只在 e-ink 主题中有效 */
:root { --my-color: #333; }
/* 缺少其他主题! */
```

### DO: 考虑每个主题的对比度

```css
/* GOOD - 每个主题有适当的对比度 */
.theme-e-ink { --code-text: #2f2f2f; }      /* 浅色背景上的深色文本 */
.theme-crt-amber { --code-text: #ffd080; }  /* 深色背景上的琥珀色文本 */
.theme-crt-green { --code-text: #80ffa0; }  /* 深色背景上的绿色文本 */
```

### DON'T: 所有主题使用相同颜色

```css
/* BAD - 相同颜色在所有背景上不起作用 */
.theme-e-ink { --code-text: #333; }
.theme-crt-amber { --code-text: #333; }   /* 在深色背景上不可见! */
.theme-crt-green { --code-text: #333; }   /* 在深色背景上不可见! */
```

### DO: 使用语义化变量名

```css
/* GOOD - 描述用途 */
--status-done: #...;
--alert-info-border: #...;
--code-text: #...;
```

### DON'T: 使用通用颜色名

```css
/* BAD - 不描述用途 */
--green: #...;
--blue-border: #...;
--light-text: #...;
```

### DO: 修改样式后测试所有主题

修改样式后：
1. 切换到每个主题验证外观
2. 检查文本在背景上的可读性
3. 验证状态指示器可区分

### DON'T: 假设一个主题代表所有

只在 e-ink（浅色）主题中测试会遗漏深色主题的问题。

## 变量分类

| 分类 | 变量 | 用途 |
|------|------|------|
| 背景 | `--bg`, `--bg-2`, `--bg-3`, `--card` | 页面背景、卡片 |
| 文本 | `--text`, `--text-secondary`, `--muted` | 主要、次要、微弱文本 |
| 强调 | `--accent` | 按钮、激活状态、高亮 |
| 边框 | `--border`, `--table-border` | 分隔线、轮廓 |
| 输入 | `--input-bg`, `--input-border` | 表单元素 |
| 代码 | `--code-bg`, `--code-text`, `--code-border` | 代码块, `<pre>`, `<code>` |
| 状态 | `--status-done-*`, `--status-failed-*`, `--status-init-*` | 状态标签、徽章 |
| 警告 | `--alert-info-border`, `--alert-error-border` | 警告框 |
| 芯片 | `--chip-bg`, `--chip-border` | 标签 |
| 日志 | `--log-text` | 调试面板、日志输出 |

## 当前支持的主题

| 主题名 | 类名 | 风格 |
|--------|------|------|
| E-Ink | `theme-e-ink` | 电子墨水风格（浅色） |
| CRT Amber | `theme-crt-amber` | CRT 琥珀色风格（深色） |
| CRT Green | `theme-crt-green` | CRT 绿色风格（深色） |
