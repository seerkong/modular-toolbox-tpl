# Example 模块文档

Example 模块是框架的示例模块，展示了完整的模块开发模式。

## 文档列表

| 文档 | 说明 | 何时阅读 |
|------|------|----------|
| [introduce/](./introduce/index.md) | 模块概述 | 了解模块功能时 |
| [howto/](./howto/index.md) | 操作指南 | 需要修改模块时 |
| [example/](./example/index.md) | 代码示例 | 参考实现细节时 |
| [rule/](./rule/index.md) | 模块规则 | 开发时遵循规范 |
| [misc/](./misc/index.md) | 杂项信息 | 需要补充信息时 |
| [troubleshooting/](./troubleshooting/index.md) | 问题排查 | 遇到问题时 |

## 模块功能

- 基础 API: GET/POST JSON 请求
- 文件上传: FormData 处理
- SSE 流: Server-Sent Events

## 代码位置

```
shared/src/modules/Example/
backend/packages/core/src/modules/Example/
backend/packages/mediator/src/modules/Example/
frontend/packages/core/src/modules/Example/
frontend/packages/mediator/src/modules/Example/
frontend/packages/vue/src/modules/Example/
frontend/packages/react/src/modules/Example/
```
