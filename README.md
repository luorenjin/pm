# 🚀 PM-Pilot

高端精密装备研发项目管理驾驶舱

## 项目简介

PM-Pilot 是一套面向精密装备研发团队的项目管理系统，覆盖项目全生命周期的核心管理场景，包括项目状态大盘、长周期物料追踪、任务行动池和装备规格书构建。

## 功能模块

| 模块 | 说明 |
|------|------|
| 🎛️ **项目状态大盘** | 多项目并行可视化，按红/黄/绿三色预警状态呈现项目健康度 |
| 📦 **长周期物料追踪** | 追踪机械/电气/视觉类长交期物料，自动计算最晚下单日并高亮预警 |
| ✅ **任务池 (Action Items)** | 以"谁、做什么、完成标准(DoD)、截止日"四要素管理行动项，支持逾期预警 |
| 📋 **装备规格书构建器** | 按业务/机械/视觉/现场环境四维度管理设备规格参数，支持跨项目克隆 |

## 技术栈

- **框架**：[Next.js](https://nextjs.org/) 16 (App Router)
- **前端**：React 19 + TypeScript
- **样式**：Tailwind CSS 4
- **ORM**：Prisma 6
- **数据库**：SQLite

## 快速开始

### 环境要求

- Node.js 18+
- npm

### 安装与启动

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env，设置 DATABASE_URL=file:./dev.db

# 初始化数据库
npx prisma migrate dev

# 可选：填充示例数据
npx prisma db seed

# 启动开发服务器
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 即可使用。

### 其他命令

```bash
npm run build   # 生产构建
npm run start   # 启动生产服务器
npm run lint    # 代码检查
```

## 数据模型

```
Project       项目
├── Material  长周期物料（含交期、最晚下单日、到货状态）
├── ActionItem 行动项（含负责人、DoD、截止日、完成状态）
└── Spec      规格参数（按分类 Tab 组织）
```
