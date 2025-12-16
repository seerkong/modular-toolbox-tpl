# PrepareDbDataTool 模块文档

PrepareDbDataTool 是一个用于初始化测试数据库数据的工具模块。

## 文档列表

| 文档 | 说明 | 何时阅读 |
|------|------|----------|
| [introduce/](./introduce/index.md) | 模块概述 | 了解模块功能时 |
| [howto/](./howto/index.md) | 操作指南 | 使用或开发模块时 |
| [example/](./example/index.md) | 代码示例 | 参考实现细节时 |
| [rule/](./rule/index.md) | 模块规则 | 开发时遵循规范 |
| [misc/](./misc/index.md) | 杂项信息 | 需要补充信息时 |
| [troubleshooting/](./troubleshooting/index.md) | 问题排查 | 遇到问题时 |

## 模块功能

- 数据库连接管理: 配置和测试 MySQL 连接
- 表结构获取: 从数据库获取表结构信息
- 数据生成配置: 为字段配置 Mock 数据生成器
- 批量数据插入: 支持批量生成和插入测试数据

## 代码位置

```
shared/src/modules/PrepareDbDataTool/
backend/packages/core/src/modules/PrepareDbDataTool/
backend/packages/mediator/src/modules/PrepareDbDataTool/
frontend/packages/core/src/modules/PrepareDbDataTool/
frontend/packages/mediator/src/modules/PrepareDbDataTool/
frontend/packages/vue/src/modules/PrepareDbDataTool/
frontend/packages/react/src/modules/PrepareDbDataTool/
```
