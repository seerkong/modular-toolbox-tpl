在vue,react的包下，和layout目录并列，应当有个modules目录，这个目录中，每个模块独立一个子目录：
modules/
  example/
    router/
      index.ts
    view/
    component/
    api/
    styles/
    hooks/
    contract/         	这里仅定义shared、frontend/core 模块定义的类型之外的，仅用于vue|react上层模块的定义,但不包含逻辑实现部分
    helper/				辅助纯函数辅助方法
    ...					对于react|vue框架工程化，常规需要的其他目录，可以自行添加

在vue,react都引用的frontend/packages/core模块下，和infra同级，也应当建立一个modules目录，每个模块独立一个子目录：
modules/
  example/
    contract/        	这里仅定义shared模块定义的类型之外的，需要暴露给vue|react可访问的公共的类型、数据定义(如container,runtime,state,helper). 但不包含逻辑实现部分
    controller/
    container/
    runtime/			基于contract/中定义的runtime显示定义，扩展的纯函数辅助方法
    state/
    api/				每个模块，调用后端的接口定义，例如普通的get,post,sse,websocket等
    helper/				辅助纯函数辅助方法
    ...					如果需要其他工程化的其他目录，可以自行添加