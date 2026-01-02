# Aero Desktop 开发与代码规范 (Coding Standards)

## 1. 安全规范 (Security)
*   **密钥管理**: 严禁在任何客户端组件（带有 `"use client"` 的文件）中直接调用 `new GoogleGenAI`。
*   **接口中转**: 所有涉及 Gemini API 的请求必须通过服务端的 `/api` 路由中转，由后端安全地附加 `process.env.API_KEY`。
*   **环境变量**: API 密钥必须存储在服务端的 `.env` 文件中，严禁提交到代码仓库。

## 2. UI/UX 规范 (Visual Design)
*   **动效一致性**: 
    *   所有位置变更必须配合 `framer-motion` 的 `layout` 属性。
    *   图标飞入动效需根据屏幕象限计算随机起始坐标。
*   **视觉风格**: 
    *   弹窗必须使用 `backdrop-blur-xl` (毛玻璃效果)。
    *   背景颜色应保持 `bg-white/5` 或 `bg-slate-900/60` 的半透明状态。
*   **响应式布局**: 
    *   `reorganizeGrid` 逻辑必须实时响应窗口缩放。
    *   移动端横屏模式下强制优化为 4 列布局。

## 3. 性能规范 (Performance)
*   **资产压缩**: 
    *   所有 AI 生成或用户上传的图像必须通过 `Canvas API` 转换为 `webp` 格式。
    *   图片尺寸需根据显示模式（Icon/Card/Gallery）进行预裁剪。
*   **渲染优化**: 
    *   复杂视觉效果（如粒子时钟）必须使用 `Canvas` 绘制，而非大量 DOM 节点。
    *   使用 `React.memo` 或 `useMemo` 避免不必要的桌面网格重绘。

## 4. 存储规范 (Storage)
*   **持久化策略**: 
    *   虚拟文件系统状态存储于 `LocalStorage`。
    *   当存储空间接近上限（5MB）时，系统需自动执行资产降级策略（仅保留 Icon 缩略图）。