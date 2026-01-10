# TODO API - 实时协作待办事项应用后端

## 📋 项目概述

这是一个基于现代云原生架构的实时协作TODO列表应用程序后端。应用支持多人实时协作、文件上传、权限管理等高级功能，专为高并发场景设计。

## ✨ 功能特性

### 核心功能
- ✅ **TODO管理**：完整的CRUD操作，支持子任务、标签、优先级
- ✅ **实时协作**：基于WebSocket的实时同步编辑
- ✅ **用户认证**：完整的注册/登录/令牌刷新流程
- ✅ **文件上传**：支持图片和视频（最大4分钟）
- ✅ **团队协作**：TODO分享与权限管理
- ✅ **速率限制**：分布式速率限制保护

### 技术特性
- 🚀 **边缘计算**：基于Cloudflare Workers的全球部署
- 🔒 **安全可靠**：JWT认证、输入验证、SQL防注入
- 📊 **可扩展性**：支持100M+日活用户的架构设计
- 🔄 **实时同步**：毫秒级更新同步
- 🗄️ **数据持久化**：基于Supabase的完整数据管理

## 🏗️ 技术架构

### 系统架构图
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    客户端       │────▶│ Cloudflare边缘  │────▶│   Supabase后端  │
│ (Web/iOS/Android)│     │ (Workers/Pages) │     │  (PostgreSQL/   │
└─────────────────┘     └─────────────────┘     │   Storage/Auth) │
                                                 └─────────────────┘
```

### 技术栈
| 组件 | 技术选择 | 用途 |
|------|----------|------|
| **运行时** | Cloudflare Workers | 边缘计算、API托管 |
| **框架** | Hono | 轻量级Web框架 |
| **数据库** | Supabase PostgreSQL | 主数据存储 |
| **文件存储** | Supabase Storage | 媒体文件存储 |
| **认证** | Supabase Auth | 用户认证管理 |
| **语言** | TypeScript | 类型安全的开发 |
| **部署** | Wrangler CLI | Cloudflare部署工具 |

## 📁 项目结构

```bash
project/
├── api/                    # API处理器和中间件
│   ├── handlers/          # 路由处理器
│   │   ├── auth.ts        # 认证相关
│   │   ├── todo.ts        # TODO管理
│   │   ├── media.ts       # 媒体文件
│   │   ├── team.ts        # 团队协作
│   │   ├── websocket.ts   # WebSocket
│   │   └── system.ts      # 系统状态
│   └── middleware/        # 中间件
│       ├── auth.ts        # 认证中间件
│       ├── rate-limit.ts  # 速率限制
│       ├── error.ts       # 错误处理
│       ├── cors.ts        # CORS配置
│       └── logger.ts      # 请求日志
├── core/                  # 核心业务逻辑
│   ├── models/           # 数据模型
│   │   ├── todo.ts       # TODO模型
│   │   ├── user.ts       # 用户模型
│   │   ├── media.ts      # 媒体模型
│   │   └── share.ts      # 分享模型
│   └── services/         # 业务服务
│       ├── todo-service.ts
│       ├── auth-service.ts
│       ├── media-service.ts
│       ├── share-service.ts
│       ├── websocket-service.ts
│       └── rate-limit-service.ts
├── shared/               # 共享组件
│   ├── errors/          # 错误处理
│   ├── validation/      # 数据验证
│   ├── supabase/        # Supabase客户端
│   └── types/           # TypeScript类型
├── database/            # 数据库相关
│   ├── migrations/      # 迁移文件
│   ├── seed/           # 种子数据
│   ├── functions/       # 数据库函数
│   └── triggers/        # 触发器
├── scripts/             # 实用脚本
│   ├── migrate.ts      # 数据库迁移
│   └── seed.ts         # 数据种子
├── index.ts            # 应用入口点
├── package.json        # 项目配置
├── tsconfig.json       # TypeScript配置
├── wrangler.toml       # Cloudflare配置
└── README.md           # 项目文档
```

## 🚀 快速开始

### 1. 环境要求
- Node.js 18+
- npm 或 yarn
- Supabase 账户
- Cloudflare 账户

### 2. 安装依赖
```bash
# 克隆项目
git clone <repository-url>
cd todo-api

# 安装依赖
npm install

# 或使用 yarn
yarn install
```

### 3. 环境配置
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件
# 添加你的 Supabase 配置
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
ENVIRONMENT=development
```

### 4. 数据库设置
```bash
# 设置环境变量
export SUPABASE_URL=your-project-url
export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 运行数据库迁移
npm run db:migrate

# 运行种子数据（可选）
npm run db:seed
```

### 5. 本地开发
```bash
# 启动开发服务器
npm run dev

# 访问本地服务
# http://localhost:8787
```

### 6. 运行测试
```bash
# 运行单元测试
npm test

# 运行类型检查
npm run type-check

# 运行代码检查
npm run lint

# 格式化代码
npm run format
```

## 📚 API 文档

### 认证
所有需要认证的API都需要在请求头中添加Bearer令牌：
```
Authorization: Bearer <jwt-token>
```

### API端点

#### 系统状态
| 方法 | 端点 | 描述 |
|------|------|------|
| `GET` | `/` | 健康检查 |
| `GET` | `/health` | 健康检查（详细） |
| `GET` | `/version` | 版本信息 |

#### 用户认证
| 方法 | 端点 | 描述 |
|------|------|------|
| `POST` | `/api/v1/auth/register` | 用户注册 |
| `POST` | `/api/v1/auth/login` | 用户登录 |
| `POST` | `/api/v1/auth/refresh` | 刷新令牌 |
| `POST` | `/api/v1/auth/logout` | 用户登出 |
| `GET` | `/api/v1/auth/me` | 获取当前用户 |

#### TODO管理
| 方法 | 端点 | 描述 |
|------|------|------|
| `GET` | `/api/v1/todos` | 获取TODO列表 |
| `POST` | `/api/v1/todos` | 创建TODO |
| `GET` | `/api/v1/todos/:id` | 获取单个TODO |
| `PUT` | `/api/v1/todos/:id` | 更新TODO |
| `DELETE` | `/api/v1/todos/:id` | 删除TODO |

#### 媒体文件
| 方法 | 端点 | 描述 |
|------|------|------|
| `GET` | `/api/v1/media` | 获取媒体列表 |
| `POST` | `/api/v1/media/upload-url` | 获取上传URL |
| `POST` | `/api/v1/media/:id/confirm` | 确认上传 |
| `GET` | `/api/v1/media/:id/url` | 获取媒体URL |
| `DELETE` | `/api/v1/media/:id` | 删除媒体文件 |

#### 团队协作
| 方法 | 端点 | 描述 |
|------|------|------|
| `POST` | `/api/v1/team/shares` | 创建分享 |
| `GET` | `/api/v1/team/shares` | 获取分享列表 |
| `GET` | `/api/v1/team/shares/:id` | 获取单个分享 |
| `PUT` | `/api/v1/team/shares/:id` | 更新分享权限 |
| `DELETE` | `/api/v1/team/shares/:id` | 删除分享 |

#### 实时协作
| 方法 | 端点 | 描述 |
|------|------|------|
| `GET` | `/ws/v1/todo/:id` | 连接到TODO房间 |

### 请求示例
```bash
# 用户登录
curl -X POST http://localhost:8787/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'

# 创建TODO
curl -X POST http://localhost:8787/api/v1/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt-token>" \
  -d '{
    "name": "完成项目提案",
    "description": "编写并提交项目提案",
    "priority": "high",
    "status": "not_started"
  }'

# 获取TODO列表
curl -X GET "http://localhost:8787/api/v1/todos?status=in_progress&limit=10" \
  -H "Authorization: Bearer <jwt-token>"
```

### 响应格式
```json
{
  "code": "OK",
  "message": "Success",
  "data": {
    // 响应数据
  }
}
```

## 🗄️ 数据库架构

### 主要数据表
| 表名 | 描述 | 关键字段 |
|------|------|----------|
| `todos` | TODO项目 | id, name, status, created_by, is_deleted |
| `todo_shares` | TODO分享 | todo_id, user_id, permission, shared_by |
| `media` | 媒体文件 | todo_id, file_path, mime_type, media_type |
| `rate_limits` | 速率限制 | identifier, timestamp |
| `api_keys` | API密钥 | key, user_id, rate_limit, is_active |
| `api_key_requests` | API请求日志 | api_key, timestamp |

### 数据模型关系
```
todos (1) ──── (n) todo_shares
   │                    │
   │                    │
   └── (n) media        └── (1) users
```

### 完整SQL架构
详细SQL架构见 [database/migrations/](database/migrations/) 目录。

## 🚢 部署

### Cloudflare Workers 部署
```bash
# 登录到Cloudflare
npx wrangler login

# 部署到开发环境
npm run deploy

# 部署到生产环境
npm run deploy -- --env production
```

### 环境变量配置
在生产环境中设置以下环境变量：

| 变量名 | 描述 | 示例 |
|--------|------|------|
| `SUPABASE_URL` | Supabase项目URL | `https://xyz.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase匿名密钥 | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase服务角色密钥 | `eyJ...` |
| `ENVIRONMENT` | 环境名称 | `production` |

### 监控和日志
- **错误监控**：通过console.error自动记录
- **性能监控**：请求耗时日志
- **访问日志**：所有请求的详细日志

## 🧪 测试

### 测试结构
```
test/
├── unit/              # 单元测试
│   ├── services/     # 服务层测试
│   ├── models/       # 模型测试
│   └── validation/   # 验证测试
├── integration/      # 集成测试
│   └── api/         # API端点测试
└── e2e/             # 端到端测试
```

### 运行测试
```bash
# 运行所有测试
npm test

# 运行单元测试
npm test -- --testPathPattern=unit

# 运行集成测试
npm test -- --testPathPattern=integration

# 生成测试覆盖率报告
npm test -- --coverage
```

## 🔧 开发指南

### 代码规范
- **代码风格**：遵循Google TypeScript风格指南
- **命名约定**：camelCase（变量/函数），PascalCase（类/接口）
- **错误处理**：使用统一错误类，避免try-catch嵌套
- **注释规范**：JSDoc格式的注释

### 添加新功能
1. 在 `core/models/` 中添加数据模型
2. 在 `core/services/` 中实现业务逻辑
3. 在 `api/handlers/` 中添加路由处理器
4. 在 `database/migrations/` 中添加数据库迁移
5. 添加相应的单元测试

### 调试技巧
```bash
# 本地调试
npm run dev -- --inspect

# 查看日志
tail -f wrangler.log

# 数据库调试
npm run db:migrate -- --verbose
```

## 🤝 贡献指南

### 开发流程
1. Fork 项目仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

### 提交信息规范
使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：
- `feat:` 新功能
- `fix:` 修复bug
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 构建过程或辅助工具的变动

### 代码审查
- 所有PR需要至少1位审查者批准
- 确保所有测试通过
- 遵循现有代码风格
- 更新相关文档

## 📊 性能优化

### 数据库优化
- 所有常用查询字段都建立了索引
- 使用连接池管理数据库连接
- 定期清理过期数据（如速率限制记录）

### 缓存策略
- 使用Supabase内置的查询缓存
- 边缘节点的请求缓存
- 静态资源CDN缓存

### 速率限制
- 默认限制：100次请求/分钟
- 敏感操作限制：10次请求/分钟
- 基于IP和用户的双重限制

## 🔒 安全考虑

### 认证安全
- JWT令牌，有效期1小时
- 刷新令牌机制
- 密码强度验证
- 登录失败限制

### 数据安全
- SQL参数化查询，防止注入
- 输入验证和清理
- 文件类型和大小限制
- 行级安全策略

### API安全
- HTTPS强制
- CORS配置
- 速率限制
- 请求签名验证

## 📈 监控和告警

### 关键指标
- 请求成功率
- 响应时间（P50, P95, P99）
- 错误率
- 数据库连接池使用率
- 存储空间使用率

### 告警规则
- 错误率 > 1%
- 响应时间P95 > 2秒
- 数据库连接数 > 80%
- 存储使用率 > 85%

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Cloudflare Workers](https://workers.cloudflare.com/) - 边缘计算平台
- [Supabase](https://supabase.com/) - 开源Firebase替代品
- [Hono](https://hono.dev/) - 轻量级Web框架
- 所有贡献者和用户

## 📞 支持

- 📖 [文档网站](https://docs.example.com)
- 🐛 [问题跟踪](https://github.com/yourusername/todo-api/issues)
- 💬 [讨论区](https://github.com/yourusername/todo-api/discussions)
- 📧 [联系邮箱](mailto:support@example.com)