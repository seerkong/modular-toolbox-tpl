# 功能需求
我需要开发一个给测试数据库初始化数据的小应用,在这个仓库中包含web前端和后端
使用场景是给不同的数据库表，插入mock数据。

软件模块
使用左右master-detail布局，每个模块，在页面中占据一个一级菜单

一、数据库连接
用于配置数据库的host, port, username, password
数据库类型只需要支持mysql

二、schema管理
选择一个数据库profile后，输入一个表名称。注意这个表名称，允许包含`$`字符
填写表名后，点击拉取表结构定义字段，能够在一个列表中显示这个表的字段列表
在字段列表中，能够配置每个字段，在创建记录时的字段值的mock kind和mock type

对于db字段值对应编程语言string类型的字段, 支持如下mock选项
```
[
    {
        "kind": "IdGenerator",
        "types": [
            "ULID", // 使用ulid生成器
            "UUID", // 使用uuid生成器
            "SnowflakeId", // 雪花id
        ]
    },
    {
        "kind": "SequenceIn",   // 生成的记录，按顺序从list取值
        "types": [
            "BuiltinPersonList",
            "BuiltinDepartmentList"
        ]
    },
    {
        "kind": "RandomIn", // 从某个列表中，随机选择取值
        "types": [
            "BuiltinPersonList",
            "BuiltinDepartmentList"
        ]
    },
    {
        "kind": "Default", // 使用默认值
        "types": [
            "DbDefault",    // 此时这列数据在生成sql时跳过
            "Null"          // 将这列字段的值在生成sql时，填写为null
        ]
    }
]

```

对于db字段值对应编程语言number类型的字段, 支持如下mock选项
```
[
    {
        "kind": "IdGenerator",
        "types": [
            "AutoIncrement", // mysql数据库自带的自增，必须是主键才有效
            "SnowflakeId", // 雪花id
        ]
    },
    {
        "kind": "SequenceIn",   // 生成的记录，按顺序从list取值
        "types": [
            "BuiltinNumIdList"
        ]
    },
    {
        "kind": "RandomIn", // 从某个列表中，随机选择取值
        "types": [
            "BuiltinNumIdList"
        ]
    },
    {
        "kind": "Default", // 使用默认值
        "types": [
            "DbDefault",    // 此时这列数据在生成sql时跳过
            "Null"          // 将这列字段的值在生成sql时，填写为null
        ]
    }
]

```

每个type的code, 对应一段全代码编写的函数。应当便于我后续扩展增加新的type和实现

对每个字段，配置了各字段如何填入后，可以保存为一个表级别profile
后续，切换其他的数据库选择其他表后，可以重新应用这个profile, 在应用时只有字段名相同，且在编程语言中的表示是字符串/数字和原来一致时，才复用，否则还是需要让用户重新填写kind, type

三、数据插入执行
前置约束
在这个模块中，在符合下面条件后，能够执行数据库插入
* 选择有效的数据库
* 选择了表
* 选择了对这个表每个字段都配置了type, kind的profile

满足前置约束后，需要填写表单，完善这几个字段
* 插入总条目数
* 每批次条目数

填写字段后，允许点击两个按钮
1 预览生成sql (sql格式化后的)
2 执行数据插入

在任务项列表的底部，有个debug区，在debug区头部显示当前执行执行进度，下面显示事件。

# 技术实现约束
参见 docs/brainstorm/prepare-db-data/tech_constrains.md