现在这个项目的前端部分，已经经过改造，支持modularity。
接下来要参考前端部分的改造经验
对后端部分进行改造
改造重点
一、将后端backend包，从单模块，改造为类似frontend/ 目录的基于bun的多package
core -> mediator -> elysia

elysia 模块中，依赖elysia.js, 存放和server框架强相关的代码，将这些代码，转换为底层通用的接口格式，调用下层的endpoint实现
在package.json中的模块名是@backend/elysia-shell

mediator 是封装层、分发层、依赖注入层，runtime构造层，core模块的依赖的领域support接口实现层。这个层不允许依赖外层框架如elysia.js的任何相关库。但允许在这一层使用依赖注入库、orm库等
在package.json中的模块名是@backend/mediator


core 模块中，定义核心类型，依赖外部传入的support interface，实现核心逻辑。这一层不能使用外层框架如elysia.js的任何相关库、不允许使用依赖注入库。但允许在这一层使用orm库定义entity，但不允许编写orm service的实现。这一层应当是框架无关的，核心业务逻辑。
在package.json中的模块名是@backend/core


二、目录重构
在core package中，应当是如下结构
infra/
  index.ts
  contract/
  entity/
  runtime/
  logic/
  helper/
  ...
modules/
  Example/
    index.ts
    contract/         这里仅定义shared模块定义的类型之外的，需要暴露给backend/packages下的elysia、mediator模块可访问的公共的类型、数据定义(如runtime,state,service，helper定义). 但不包含逻辑实现部分
    entity/
    runtime/      基于contract/中定义的runtime显示定义，扩展的纯函数辅助方法
    logic/        核心业务逻辑
    helper/       辅助纯函数辅助方法
    ...         如果需要其他工程化的其他目录，可以自行添加
  ...             其他模块

在 mediator package中，应当是如下结构
infra/        公共模块
  index.ts
  datasource.ts
  service/
  endpoint/
  helper/
  ...
modules/
  Example/
    index.ts
    datasource.ts   创建typeorm的DataSource的逻辑. 【注意】允许每个module独立配置一个sqlite数据库文件
    service/      如果模块的数据库操作比较复杂，应当在core模块中定义service的interface, 然后在mediator 模块中实现
    endpoint/     http各类api
      index.ts
      GetJson/
      PostJson/ 
      PostFormData/ 文件上传类型的endpoint
      SSE/
      Websocket/
      ...         按接口类型分文件夹
    helper/       辅助纯函数辅助方法
    ...         如果需要其他工程化的其他目录，可以自行添加
  ...             其他模块

三、文档更新
在docs/ai/ 目录下新增
1 新增给ai使用的如何指导后端添加模块的说明文档

2 新增总结这个项目，我在frontend, backend, shared三大目录下，进行模块化改造的架构设计思想文档

