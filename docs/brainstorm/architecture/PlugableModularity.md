前这个项目的框架部分，我的目的是一个ai原生的，便于ai自动生成的，便于通过低代码/无代码配置化生成的，便于人工手写的，模块化开发框架。我还希望框架部分升级后，过去使用旧版本框架开发的module, 能够尽量把对应文件夹的文件复制到新框架的各个modules目录，然后在这些modules下的index.ts中引用，就能生效。

当前做了一系列的分层和模块化设计等，但是前、后端依然存在一些模块加减不便的地方。请给我生成一个开发规范和改造方案，解决这个问题
例如 我觉得当前模块化做的不好的
backend/packages/mediator/src/index.ts，每次新增模块，都需要在这个文件中做散弹式修改（应改为通过模块 manifest 注册表聚合）
我的一种改造思路是，前后端，需要和框架集中式注册集成的位置，特别是mediator，例如前端的路由，后端的endpoint，每种功能类别的文件夹(例如endpoint)，导出一个这种功能类别的接口结构的对象,在框架层，无需直接import下层模块的具体类，只使用这个模块导出的符合接口结构的导出对象，完成解耦改造

一些注意点
一、前后端使用显式的Runtime对象
创建endpoint时，传入的不应该是单个service, 但是实际上一个业务执行，常常需要多个service，有时还需要读取这个模块专属的配置，因此不能只传service或者多个service的container, 要传入runtime对象

例如
原来的
export type BackendRuntime = {
  config: BackendConfig;
  endpointRoute: BackendEndpointRoute; // 存放原来的endpoints
  actorMesh: BackendActorMesh,
};
应该换成换成
export type BackendRuntime = {
  config: BackendConfig;
  endpointRoute: BackendEndpointRoute; // 存放原来的endpoints
  actorMesh: BackendActorMesh,
};

这个 ActorMesh 可以理解为概念更大的container, 所有的 service，或者其他类似概念的对象实例，都可以模块化组织起来放到这里
使用者使用的是符合某个Actor协议的接口，而无需感知这个actor是如何实现的

export type BackendActorMesh = {
  infra: InfraActorMesh;
  modules: {
    A: ModuleAActorMesh;
    B: ModuleBActorMesh;
  }
}
export type InfraActorMesh {
  InfraService1
  InfraService2
}

每个模块，定义自己运行所需的actor mesh，
export type ModuleAActorMesh = {
  XXXService,
  YYYService
}
以及自己的runtime子集
export type ModuleARuntime = {
  config: {
    modules: {
      ModuleA: {
        // 这个模块所需的module
      }
    }
    
  }
  actorMesh : {
    modules: {
      A: ModuleAActorMesh;
    }
  }
}

在各个模块的endpoint创建自己的接口时，需要的是自己模块的runtime, 例如 ModuleARuntime
这样的话，框架层在在构造endpoint时，传入BackendRuntime的实例，由于是ModuleARuntime的超集，类型也是匹配的
从传入BackendRuntime的实例，取出自己的actor mesh实例

同样，在前端，也是将原来代码的container， 重命名为ActorMesh
并且也创建一个 FrontendRuntime ，实现类似 BackendRuntime 的职责
前端也是将原本传入container的部分，改为传入 runtime

二、类型友好
不可以使用自动发现，必须手动的将某个 module 的 manifest 文件引用到 modules/index.ts 中才生效。
自动发现对类型系统、重构也不友好
