# Example 模块概述

Example 模块是框架的参考实现，展示了以下功能：

## API 端点

- `GET /api/example/demo` - 获取演示数据
- `POST /api/example/create` - 创建示例记录
- `POST /api/example/file-upload` - 上传文件并返回元数据
- `GET /api/example/stream` - 服务端推送事件流

## 模块结构

### Shared 层

```
shared/src/modules/Example/
├── Api.ts      # API 路径枚举
└── DTO.ts      # 数据传输对象
```

### Backend 层

```
backend/packages/core/src/modules/Example/
├── contract/   # 服务接口
└── runtime/    # 运行时配置

backend/packages/mediator/src/modules/Example/
├── service/    # 服务实现
├── endpoint/   # API 端点
│   ├── GetJson/
│   ├── PostJson/
│   ├── PostFormData/
│   └── SSE/
└── manifest.ts # 模块清单
```

### Frontend 层

```
frontend/packages/core/src/modules/Example/
├── contract/   # 类型定义
├── api/        # API 客户端
├── state/      # 状态管理
└── runtime/    # 运行时

frontend/packages/mediator/src/modules/Example/
├── controller/ # 控制器
└── manifest.ts # 模块清单

frontend/packages/vue/src/modules/Example/
└── view/       # Vue 视图组件

frontend/packages/react/src/modules/Example/
└── view/       # React 视图组件
```

## 学习价值

通过阅读 Example 模块代码，可以学习：

1. 如何定义 API 契约和 DTO
2. 如何实现后端服务和端点
3. 如何组织端点按传输类型
4. 如何实现前端 API 客户端
5. 如何使用响应式状态
6. 如何实现中介者协调逻辑
7. 如何编写 Vue 和 React 视图组件
8. 如何实现文件上传功能
9. 如何实现 SSE 流处理
