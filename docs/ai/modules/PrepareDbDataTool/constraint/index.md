# PrepareDbDataTool 模块规则

本目录包含模块特定的规则。

## 规则

### RULE-PDBT-001: 仅用于开发测试

PrepareDbDataTool 仅应用于开发和测试环境，禁止在生产环境使用。

### RULE-PDBT-002: 批量操作限制

批量插入时应设置合理的批次大小：
- 建议批次大小：100-1000
- 建议总数上限：根据数据库性能决定

### RULE-PDBT-003: 进度反馈

长时间运行的插入操作必须提供 WebSocket 进度反馈。

## 通用规则

开发此模块时，还需遵循框架级别的规则：

- [架构规则](../../../architecture/rule/index.md)
- [开发规则](../../../framework/rule/index.md)
