# PrepareDbDataTool 杂项

本目录包含模块的补充信息。

## 数据存储

模块使用本地 SQLite 数据库存储配置：
- DbProfile: 数据库连接配置
- TableProfile: 表字段生成配置
- CustomValueList: 自定义值列表

## 支持的数据库

当前版本仅支持 MySQL 数据库。

## WebSocket 进度协议

```typescript
interface ProgressMessage {
  type: 'progress' | 'complete' | 'error'
  current: number
  total: number
  message?: string
}
```
