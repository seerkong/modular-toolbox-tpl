# PrepareDbDataTool 模块概述

PrepareDbDataTool 是一个数据库测试数据准备工具。

## 主要功能

### 1. 数据库连接管理

- 配置 MySQL 连接参数（host, port, user, password, database）
- 测试连接可用性
- 保存和管理多个数据库配置（DbProfile）

### 2. 表结构管理

- 从数据库获取表结构信息
- 为每个字段配置 Mock 数据生成器
- 保存表级别的配置（TableProfile）

### 3. 数据插入执行

- 配置插入总数和批次大小
- 预览生成的数据
- 执行批量插入
- WebSocket 实时进度反馈

## Mock 字段生成器类型

### 字符串字段

| 生成器 | 说明 |
|--------|------|
| IdGenerator | ID 生成（ULID、UUID、SnowflakeId、AutoIncrement）|
| SequenceIn | 从列表顺序取值 |
| RandomIn | 从列表随机取值 |
| Default | 使用数据库默认值或 NULL |

### 数值字段

| 生成器 | 说明 |
|--------|------|
| IdGenerator | 数值 ID（SnowflakeId、AutoIncrement）|
| SequenceIn | 从列表顺序取值 |
| RandomIn | 从列表随机取值 |
| RandomRange | 指定范围内随机数 |
| Default | 使用数据库默认值或 NULL |

## 模块结构

```
shared/src/modules/PrepareDbDataTool/
backend/packages/core/src/modules/PrepareDbDataTool/
backend/packages/mediator/src/modules/PrepareDbDataTool/
frontend/packages/core/src/modules/PrepareDbDataTool/
frontend/packages/mediator/src/modules/PrepareDbDataTool/
frontend/packages/vue/src/modules/PrepareDbDataTool/
frontend/packages/react/src/modules/PrepareDbDataTool/
```

## 功能页面

1. **DatabaseConnection**: 数据库连接配置
2. **SchemaManager**: 表结构管理
3. **CustomValueLists**: 自定义值列表
4. **DataInsert**: 数据插入执行
