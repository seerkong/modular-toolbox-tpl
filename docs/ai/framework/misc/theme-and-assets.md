# 主题与静态资源

主题系统和静态资源管理。

## 主题系统

### 导入样式

```typescript
import "@frontend/mediator/styles/index.css"
```

### 使用主题 Hook

```typescript
const { theme, setTheme, themeClass, isCrt } = useTheme()
```

### 可用主题

- `e-ink` - 电子墨水风格
- `crt-amber` - CRT 琥珀色风格
- `crt-green` - CRT 绿色风格

### CSS 变量

使用语义化 CSS 变量而非硬编码颜色：

```css
/* 正确 */
background-color: var(--card);
color: var(--text);
border-color: var(--border);

/* 错误 */
background-color: #ffffff;
color: #333333;
```

### 可用 CSS 类

- `.card` - 卡片容器
- `.section-title` - 区块标题
- `.alert` - 警告信息
- `.status-pill` - 状态标签
- `.chip` - 芯片标签
- `.button` - 按钮
- `.table` - 表格
- `.debug-panel` - 调试面板
- `.log-line` - 日志行

## 静态资源管理

### 放置位置

共享静态资源放在 `frontend/static/` 目录：

```
frontend/static/
├── crt/
│   └── some-file.png
└── icons/
    └── logo.svg
```

### 访问方式

通过 URL 访问：`/crt/some-file.png`

### 同步机制

开发和构建脚本会自动将 `frontend/static/` 同步到各 Shell 的 `public/` 目录。

**注意**: 不要直接编辑 Shell 的 `public/` 目录。

## 项目重命名

详见 [howto/project-renaming.md](../howto/project-renaming.md)。
