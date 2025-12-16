# 代码放置层级决策

如何决定代码应该放在哪一层。

## 决策问题

**问自己这些问题：**

1. **是否是跨前后端共享的契约？** → Shared 层
2. **是否是纯业务逻辑，不依赖框架？** → Core 层
3. **是否需要 DI、ORM 或其他技术实现？** → Mediator 层
4. **是否是 UI 组件或 HTTP 路由？** → Shell 层

## 决策速查表

| 代码类型 | 应放置的层 | 示例 |
|----------|-----------|------|
| DTO 定义 | Shared | `ExampleResponse`, `CreateUserDTO` |
| API 路径枚举 | Shared | `ExampleApi.GetDemo` |
| 业务接口 | Core | `IExampleService` |
| 纯函数/工具 | Core | `calculateTotal()`, `validateInput()` |
| 实体定义 | Core | `@Entity() class User` |
| TypeORM DataSource | Mediator | `createDataSource()` |
| 服务实现 | Mediator | `class ExampleService implements IExampleService` |
| 控制器 | Mediator | `class ExampleController` |
| DI 容器配置 | Mediator | `container.bind()` |
| HTTP 路由 | Shell | Elysia route handlers |
| Vue/React 组件 | Shell | `ExampleView.vue`, `ExampleView.tsx` |

## 模块边界

- 每个模块应该是**自包含**的
- 模块间通过 Core 层的接口通信，不直接依赖实现
- 共享的 DTO 放在 Shared 层的对应模块目录下
