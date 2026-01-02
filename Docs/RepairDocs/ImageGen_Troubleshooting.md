
# 生图功能排查指南 (Image Generation Troubleshooting)

## 1. 常见错误代码与现象
*   **500 Internal Server Error**: 后端服务报错，通常是 API 密钥无效或模型调用参数错误。
*   **404 KEY_RESTRICTED**: 当前使用的 API 密钥没有权限调用生图模型。
*   **无反应/无限加载**: 前端脚本错误，或 `analyze-url` 接口超时。

## 2. 修复步骤
### A. 重新选择 API Key (核心解决步骤)
由于 `gemini-2.5-flash-image` 需要 Paid Project 的 API Key，请执行以下操作：
1. 刷新页面，返回登录界面。
2. 点击 **"Select API Key"** 按钮。
3. 在弹出的对话框中，务必选择一个关联了**付费账户 (Billing Account)** 的 GCP 项目密钥。
4. 重新尝试生图。

### B. 检查网络连接
*   如果控制台出现 `jsdelivr.net` 或 `esm.sh` 的 404 错误，说明部分依赖库加载失败。
*   建议使用更稳定的网络环境，或检查浏览器代理设置。

### C. Prompt 调优
*   过于简短或触发安全过滤的 Prompt 会导致生图失败。
*   **Aero Desktop** 已内置了丰富的 Style Prompt，建议优先使用预设风格。

## 3. 技术规范参考
*   模型: `gemini-2.5-flash-image`
*   方法: `ai.models.generateContent`
*   支持比例: `1:1`, `3:4`, `4:3`, `9:16`, `16:9`
