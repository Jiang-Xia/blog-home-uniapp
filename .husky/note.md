常用的 type 类别（与 commitlint `type-enum` 一致）：

- `feat`：新增功能
- `fix`：修复 bug
- `docs`：仅修改文档（README、CHANGELOG 等）
- `test`：增加或修改测试
- `style`：格式调整（空行、缩进、引用排序等，不改变逻辑）
- `perf`：性能或体验优化
- `refactor`：重构（无新功能、无 bug 修复）
- `chore`：构建流程、依赖或工具变更
- `build`：影响构建系统或外部依赖的变更
- `ci`：CI 配置或脚本变更
- `revert`：回滚提交

**subject 使用简体中文**，格式：`<type>(<scope>): <中文简述>`

示例：

```
chore: 初始化项目结构与工程化配置
feat(rpg): 添加冒险中心分包占位页
fix(http): 修复开发环境接口 baseURL
```
