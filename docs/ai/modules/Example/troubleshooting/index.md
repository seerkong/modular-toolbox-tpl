# Example 模块故障排除

本目录包含模块的常见问题。

## 常见问题

### 文件上传返回空内容

**解决方案**:
1. 确保前端使用 `FormData.append('file', file)`
2. 确保后端使用 `formData.get('file')` 获取文件

### SSE 流连接失败

**解决方案**:
1. 检查后端 CORS 配置
2. 确认 SSE 端点路径正确

### React 组件不更新

**解决方案**: 使用 `useReactiveValue` Hook

## 更多问题

参考框架级别的故障排除：[docs/ai/framework/troubleshooting/](../../../framework/troubleshooting/index.md)
