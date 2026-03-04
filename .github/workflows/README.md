# GitHub Actions 工作流说明

本项目包含以下 GitHub Actions 工作流程：

## 📋 工作流列表

### 1. CI Build and Test (ci.yml)
**触发条件：**
- Push 到 main 或 develop 分支
- 向 main 或 develop 分支提交 Pull Request

**功能：**
- ✅ 代码检出
- ✅ Node.js 环境设置（支持 18.x 和 20.x）
- ✅ 安装依赖
- ✅ 运行 ESLint 代码检查
- ✅ 生成 Prisma Client
- ✅ 构建 Next.js 应用
- ✅ 上传构建产物

### 2. CD Deployment (cd.yml)
**触发条件：**
- CI 工作流成功完成且在 main 分支

**功能：**
- 🚀 自动部署到 Vercel（生产环境）
- 📢 部署成功通知

## 🔧 配置说明

### Vercel 部署配置

如需启用自动部署到 Vercel，请在 GitHub 仓库设置中添加以下 Secrets：

1. 进入仓库 Settings → Secrets and variables → Actions
2. 添加以下 secrets：
   - `VERCEL_TOKEN`: Vercel 访问令牌
   - `VERCEL_ORG_ID`: Vercel 组织 ID
   - `VERCEL_PROJECT_ID`: Vercel 项目 ID

#### 获取 Vercel 配置信息：

1. **VERCEL_TOKEN**
   - 访问 https://vercel.com/account/tokens
   - 创建新的 Token

2. **VERCEL_ORG_ID 和 VERCEL_PROJECT_ID**
   - 在本地运行 `vercel link`
   - 查看生成的 `.vercel/project.json` 文件

### 数据库配置

如果使用非 SQLite 数据库，请添加：
- `DATABASE_URL`: 数据库连接字符串

## 📊 工作流程图

```
代码提交 → CI Build → 构建成功 → CD Deployment → 部署到 Vercel
           ↓
        构建失败 → 停止流程
```

## 🎯 最佳实践

1. **分支保护**：建议为 main 分支启用保护规则，要求 CI 通过后才能合并
2. **环境变量**：敏感信息使用 GitHub Secrets 存储
3. **缓存优化**：工作流已配置 npm 缓存以加速构建
4. **多版本测试**：CI 在 Node.js 18.x 和 20.x 上运行，确保兼容性

## 🔄 替代部署方案

如果不使用 Vercel，可以修改 `cd.yml` 文件：

### Docker 部署示例
```yaml
- name: Build Docker image
  run: docker build -t pm-pilot .

- name: Deploy to server
  run: |
    # 添加您的部署脚本
```

### 自托管部署示例
```yaml
- name: Deploy via SSH
  uses: appleboy/ssh-action@master
  with:
    host: ${{ secrets.HOST }}
    username: ${{ secrets.USERNAME }}
    key: ${{ secrets.SSH_KEY }}
    script: |
      cd /path/to/app
      git pull
      npm ci
      npm run build
      pm2 restart pm-pilot
```

## 📝 注意事项

- 首次推送后，GitHub Actions 会自动运行
- 可在仓库的 Actions 标签页查看运行状态
- 构建产物保留 7 天
- 如遇到问题，请检查 Actions 日志输出
