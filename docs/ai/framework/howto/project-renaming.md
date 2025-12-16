# 项目重命名指南

基于此模板创建新项目时的重命名步骤。

## 需要准备的名称

1. **中横线项目名**（kebab-case）：例 `my-app-toolbox`
2. **大驼峰应用名**（PascalCase）：例 `MyAppToolbox`
3. **显示名**（可含空格）：例 `My App Toolbox`

## 第一阶段：配置驱动

编辑 `shared/src/infra/ConstConfig.ts`:

```typescript
export const AppConstConfig = {
  // 项目名称
  kebabName: 'my-app-toolbox',
  pascalName: 'MyAppToolbox',
  displayName: 'My App Toolbox',

  // 数据目录
  dataDir: '~/.my-app-toolbox',

  // 二进制名称
  backendBinaryName: 'my-app-toolbox-backend',
  desktopBinaryName: 'my-app-toolbox-desktop',
  appBundleName: 'My App Toolbox',
  launcherName: 'my-app-toolbox-launcher',

  // 环境变量前缀（可选调整）
  env: {
    dataDir: 'MY_APP_DATA_DIR',
    // ...
  }
}
```

### 配置项说明

| 配置项 | 用途 | 示例值 |
|--------|------|--------|
| `kebabName` | URL、文件名、CLI 命令 | `my-app-toolbox` |
| `pascalName` | 类名、组件名 | `MyAppToolbox` |
| `displayName` | UI 标题、关于页面 | `My App Toolbox` |
| `dataDir` | 默认数据/日志目录 | `~/.my-app-toolbox` |
| `backendBinaryName` | 后端可执行文件名 | `my-app-toolbox-backend` |
| `desktopBinaryName` | 桌面应用可执行文件名 | `my-app-toolbox-desktop` |
| `appBundleName` | macOS .app 包名 | `My App Toolbox` |
| `launcherName` | 启动器名称 | `my-app-toolbox-launcher` |

## 第二阶段：手动调整

### package.json 名称

更新各 `package.json` 的 `name` 字段：

```json
// backend/package.json
{ "name": "my-app-toolbox-backend" }

// frontend/package.json
{ "name": "my-app-toolbox-frontend" }

// desktop/package.json
{ "name": "my-app-toolbox-desktop" }

// shared/package.json
{ "name": "my-app-toolbox-shared" }
```

### Bundle Identifier（可选）

如需自定义 macOS bundle identifier，可在 `desktop/scripts/build-macos.ts` 中基于 `AppConstConfig` 进一步调整：

```typescript
const bundleId = `com.yourcompany.${AppConstConfig.kebabName}`
```

### UI 文案微调（可选）

如果 UI 文案需要与 `displayName` 不同，可在前端组件中微调。

## 验证清单

- [ ] **数据/日志目录**：默认 `AppConstConfig.dataDir`；环境变量可覆盖
- [ ] **桌面产物名**：`AppConstConfig.appBundleName`
- [ ] **可执行文件名**：`desktopBinaryName`、`backendBinaryName`
- [ ] **启动器**：`launcherName`
- [ ] **API 元数据**：`/api/meta`、`/api/config` 可正常读取/写入
- [ ] **前端/桌面标题**：显示 `displayName`

## 验证命令

```bash
# 开发模式验证
bun run dev:frontend:vue-elysia
bun run dev:frontend:react-elysia
bun run dev:desktop:vue
bun run dev:desktop:react

# 构建验证
bun run build:desktop:vue
bun run build:desktop:react
```

## 常见问题

### Q: 环境变量如何覆盖默认数据目录？

设置 `APP_DATA_DIR`（或自定义的 env 键名）环境变量：

```bash
export MY_APP_DATA_DIR=/custom/data/path
```

### Q: 需要修改 OpenSpec 文档中的历史引用吗？

不需要。OpenSpec 文档中的历史引用（如 `xxx-desktop`）仅作来源说明，可保留。

### Q: 如何验证所有名称都已正确更新？

```bash
# 搜索旧项目名
grep -r "modular-toolbox-tpl" --include="*.json" --include="*.ts" --include="*.tsx"
```

确保没有遗漏的旧名称引用。
