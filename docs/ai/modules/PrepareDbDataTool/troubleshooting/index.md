# PrepareDbDataTool 故障排除

本目录包含模块的常见问题。

## 常见问题

### 数据库连接失败

**解决方案**:
1. 检查 host、port、user、password 是否正确
2. 使用其他工具验证连接
3. 检查数据库服务状态和防火墙规则

### 获取表结构失败

**解决方案**:
1. 确认表名正确存在
2. 确认用户有 INFORMATION_SCHEMA 访问权限

### 插入数据失败

**解决方案**:
1. 检查字段生成器配置
2. 使用"预览"功能查看生成的数据
3. 检查约束、外键、唯一键冲突

### WebSocket 进度不更新

**解决方案**:
1. 检查 WebSocket 连接状态
2. 刷新页面重新连接

## 更多问题

参考框架级别的故障排除：[docs/ai/framework/troubleshooting/](../../../framework/troubleshooting/index.md)
