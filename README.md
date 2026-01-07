# TODO App

一个可扩展且设计良好的TODO列表应用程序，允许用户管理他们的TODO事项。

## 功能特性

- ✅ 用户认证和授权
- ✅ TODO的CRUD操作
- ✅ 团队协作功能
- ✅ 实时数据同步
- ✅ 文件上传和媒体附件
- ✅ 高级过滤和排序
- ✅ 响应式前端界面

## 技术栈

### 前端
- **React 18** + TypeScript
- **Vite** 构建工具
- **React Router** 路由管理
- **Supabase** 客户端SDK
- **Tailwind CSS** (可选) 样式框架

### 后端
- **Cloudflare Workers** 无服务器平台
- **Hono** Web框架
- **TypeScript** 类型安全
- **Supabase** 数据库和认证

### 数据库
- **PostgreSQL** (通过Supabase)
- **Row Level Security** 行级安全
- **实时订阅** 实时数据同步

### 部署和基础设施
- **Cloudflare Pages** 前端部署
- **Cloudflare Workers** 后端部署
- **Supabase** 数据库和存储
- **GitHub Actions** CI/CD流水线

## 项目结构

```
todo-app/
├── .github/workflows/          # GitHub Actions工作流
│   ├── ci.yml                  # CI流水线
│   ├── deploy.yml              # 部署流程
│   ├── database-migration.yml  # 数据库迁移
│   └── security-scan.yml       # 安全扫描
├── frontend/                   # 前端应用
│   ├── src/
│   │   ├── components/         # React组件
│   │   ├── contexts/           # React Context
│   │   ├── pages/              # 页面组件
│   │   └── lib/                # 工具库
│   └── package.json
├── src/                        # 后端API
│   ├── routes/                 # API路由
│   │   ├── auth.ts            # 认证API
│   │   ├── todos.ts           # TODO API
│   │   └── teams.ts           # 团队API
│   └── index.ts               # 应用入口
├── supabase/
│   └── migrations/            # 数据库迁移文件
├── worker/                    # Worker特定代码
└── package.json
```

## 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn
- Git
- Supabase 账户
- Cloudflare 账户

### 本地开发

1. **克隆项目**
```bash
git clone https://github.com/venslupro/todo-app.git
cd todo-app
```

2. **安装依赖**
```bash
npm install
cd frontend && npm install && cd ..
cd worker && npm install && cd ..
```

3. **环境配置**
复制 `.env.example` 为 `.env` 并配置相应环境变量。

4. **启动开发服务器**
```bash
# 启动后端开发服务器
npm run dev

# 在新终端启动前端开发服务器
cd frontend && npm run dev
```

### 生产部署

项目配置了完整的CI/CD流水线，推送到 `main` 分支将自动部署到生产环境。

## CI/CD 流水线

本项目使用 GitHub Actions 实现完整的持续集成和持续部署流程。

### 工作流概览

1. **CI Pipeline** (`ci.yml`)
   - 代码质量检查 (ESLint)
   - 类型检查 (TypeScript)
   - 后端测试
   - 前端测试和覆盖率检查
   - 项目构建

2. **部署流程** (`deploy.yml`)
   - 开发环境部署 (develop分支)
   - 生产环境部署 (main分支)
   - 前端部署到 Cloudflare Pages
   - 健康检查验证

3. **数据库迁移** (`database-migration.yml`)
   - 自动运行数据库迁移
   - 迁移验证

4. **安全扫描** (`security-scan.yml`)
   - 依赖漏洞扫描
   - 代码安全分析
   - 敏感信息检测

### 环境变量配置

在 GitHub Repository 的 Settings → Secrets and variables → Actions 中配置以下密钥：

**必需的环境变量**:
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

详细配置说明请参考 [.github/workflows/README.md](.github/workflows/README.md)

## API文档

### 认证API

- `POST /api/v1/auth/register` - 用户注册
- `POST /api/v1/auth/login` - 用户登录
- `POST /api/v1/auth/refresh` - 刷新令牌
- `POST /api/v1/auth/change-password` - 修改密码
- `PUT /api/v1/auth/profile` - 更新用户资料

### TODO API

- `GET /api/v1/todos` - 获取TODO列表（支持过滤、排序、分页）
- `POST /api/v1/todos` - 创建TODO
- `GET /api/v1/todos/:id` - 获取TODO详情
- `PUT /api/v1/todos/:id` - 更新TODO
- `DELETE /api/v1/todos/:id` - 删除TODO

### 团队API

- `GET /api/v1/teams` - 获取用户团队列表
- `POST /api/v1/teams` - 创建团队
- `GET /api/v1/teams/:id` - 获取团队详情
- `PUT /api/v1/teams/:id` - 更新团队
- `DELETE /api/v1/teams/:id` - 删除团队
- `POST /api/v1/teams/:id/members` - 添加团队成员
- `DELETE /api/v1/teams/:id/members/:userId` - 移除团队成员

## 数据库设计

### 核心表结构

- `users` - 用户表
- `todos` - TODO表
- `teams` - 团队表
- `team_members` - 团队成员表
- `media_attachments` - 媒体附件表

详细数据库设计请参考 [supabase/migrations/](supabase/migrations/)

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 支持

如有问题或建议，请创建 Issue 或联系维护者。