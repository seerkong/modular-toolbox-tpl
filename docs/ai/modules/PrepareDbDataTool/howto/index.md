# PrepareDbDataTool 操作指南

本目录包含使用模块的指南。

## 使用流程

1. 配置数据库连接 → 保存 DbProfile
2. 获取表结构 → 配置字段生成器
3. 保存 TableProfile → 执行批量插入

## 详细步骤

### 1. 配置数据库连接

1. 进入 DatabaseConnection 页面
2. 填写连接参数：host、port、user、password、database
3. 点击"测试连接"验证
4. 保存为 DbProfile

### 2. 获取表结构

1. 进入 SchemaManager 页面
2. 选择目标表
3. 点击"获取结构"
4. 查看字段列表

### 3. 配置字段生成器

1. 为每个字段选择生成器类型
2. 配置生成器参数
3. 保存为 TableProfile

### 4. 执行数据插入

1. 进入 DataInsert 页面
2. 选择 TableProfile
3. 配置插入总数和批次大小
4. 点击"预览"查看示例数据
5. 点击"执行"开始插入
