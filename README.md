# Aero Desktop - 下一代 AI 驱动的沉浸式虚拟桌面系统

Aero Desktop 是一个基于 **Next.js** 架构构建的高拟真 Web 桌面系统。它集成了 Google Gemini AI 核心能力，实现了从 UI 视觉生成到全球实时搜索的深度 AI 化，并提供极致的动效体验。

## 1. 技术框架 (Technical Framework)

项目采用现代化全栈开发方案，确保性能与安全性：

*   **全栈架构**: [Next.js 15+ (App Router)](https://nextjs.org/) - 利用 API Routes 实现服务端 API 密钥保护。
*   **前端引擎**: [React 19](https://react.dev/) - 使用并发渲染与 Hooks 管理复杂状态。
*   **交互动画**: [Framer Motion 12](https://www.framer.com/motion/) - 负责图标飞行入场、3D 翻转、物理拖拽及页面转场。
*   **视觉样式**: [Tailwind CSS](https://tailwindcss.com/) - 声明式毛玻璃效果、响应式布局及自定义动画。
*   **人工智能**: [Google Gemini API (@google/genai)](https://ai.google.dev/)
*   **状态管理**: React Context API - 维护虚拟文件系统、布局状态及全局配置。

## 2. 代码结构 (Project Structure)

```text
.
├── app/                    # Next.js 核心目录
│   ├── api/                # 服务端接口 (API_KEY 安全隔离层)
│   ├── layout.tsx          # 根布局
│   └── page.tsx            # 应用主入口
├── components/             # 核心 UI 组件
├── context/                # 全局状态机
├── config/                 # 应用注册表
├── Docs/                   # 项目文档中心
│   ├── ProjectRules_Doc/   # 项目规则与规范文档
│   ├── RepairDocs/         # 问题处理与维护文档
│   └── UpdataDocs/         # 功能更新与版本说明文档
├── types.ts                # TypeScript 类型定义
└── README.md               # 项目总览
```

## 3. 核心功能与接口信息 (Features & APIs)

### 3.1 核心功能
*   **四向飞行入场 (Fly-in Entrance)**: 初始加载时，图标从屏幕四个象限飞入目标网格。
*   **全面联网搜索 (AI Search Hub)**: 集成 Google Search 工具，支持本地 App 检索与全球实时资讯回答。
*   **三态布局系统 (Multi-Mode Layout)**: 支持 Icon (1:1), Card (3:4), Gallery (9:16) 切换。
*   **快捷方式工作室 (Shortcut Studio)**: 集成 AI 绘图，为应用自动生成多态视觉资产。

### 3.2 服务端 API 接口
详细接口说明请参阅 `Docs/ProjectRules_Doc/CodingStandards.md`。

## 4. 开发与代码规范
详细开发规范请参阅 `Docs/ProjectRules_Doc/CodingStandards.md`。

---
*Aero Engineering Standard - 2025 Next.js Fullstack Edition*