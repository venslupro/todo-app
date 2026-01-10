# 环境变量配置说明

## 概述

本项目使用 Cloudflare Workers 和 Supabase 作为后端服务，需要配置以下环境变量才能正常运行。

## 必需的环境变量

### Supabase 配置

```env
# Supabase 项目 URL
SUPABASE_URL=https://your-project.supabase.co

# Supabase 匿名密钥（用于客户端访问）
SUPABASE_ANON_KEY=your-supabase-anon-key

# Supabase 服务角色密钥（用于服务器端操作）
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### JWT 配置

```env
# JWT 密钥，用于用户认证令牌签名
JWT_SECRET=your-jwt-secret-key-here

# JWT 令牌过期时间（秒）
JWT_EXPIRES_IN=86400
```

### 应用配置

```env
# 应用环境（development, production, staging）
NODE_ENV=development

# API 基础 URL
API_BASE_URL=https://your-api.example.com

# 允许的 CORS 域名
ALLOWED_ORIGINS=https://your-frontend.example.com,http://localhost:3000
```

## 可选的环境变量

### 媒体文件配置

```env
# 最大文件上传大小（字节）
MAX_FILE_SIZE=10485760

# 支持的图片 MIME 类型
SUPPORTED_IMAGE_TYPES=image/jpeg,image/png,image/gif,image/webp

# 支持的视频 MIME 类型
SUPPORTED_VIDEO_TYPES=video/mp4,video/webm,video/ogg

# 最大视频时长（秒）
MAX_VIDEO_DURATION=240
```

### 速率限制配置

```env
# API 请求速率限制（每分钟请求数）
RATE_LIMIT_REQUESTS=1000

# 速率限制窗口时间（秒）
RATE_LIMIT_WINDOW=60
```

### 日志配置

```env
# 日志级别（error, warn, info, debug）
LOG_LEVEL=info

# 是否启用详细日志
DEBUG=false
```

## 环境变量设置方式

### 1. 本地开发环境

创建 `.dev.vars` 文件（用于 Wrangler 开发）：

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
JWT_SECRET=your-jwt-secret-key-here
JWT_EXPIRES_IN=86400
NODE_ENV=development
```

### 2. 生产环境

在 Cloudflare Workers 仪表板中设置环境变量：

1. 登录 Cloudflare Dashboard
2. 选择你的 Workers 服务
3. 进入 "Settings" → "Variables"
4. 添加所有必需的环境变量

### 3. GitHub Actions 部署

在 GitHub 仓库的 Secrets 中设置：

1. 进入仓库 Settings → Secrets and variables → Actions
2. 添加以下 Secrets：
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `JWT_SECRET`

## 安全注意事项

1. **密钥安全**：
   - 不要将任何密钥提交到版本控制系统
   - 使用环境变量或密钥管理服务
   - 定期轮换密钥

2. **权限最小化**：
   - 为不同的环境使用不同的 Supabase 项目
   - 限制服务角色密钥的权限
   - 使用行级安全策略（RLS）

3. **监控和审计**：
   - 启用 Supabase 审计日志
   - 监控 API 使用情况
   - 定期检查安全事件

## 验证配置

运行以下命令验证环境变量配置：

```bash
# 检查 TypeScript 编译
npm run type-check

# 运行测试
npm test

# 构建项目
npm run build

# 本地开发测试
npm run dev
```

## 故障排除

### 常见问题

1. **环境变量未加载**：
   - 检查 `.dev.vars` 文件是否存在且格式正确
   - 确认 Cloudflare Workers 环境变量已正确设置

2. **Supabase 连接失败**：
   - 验证 Supabase URL 和密钥是否正确
   - 检查网络连接和防火墙设置

3. **JWT 验证失败**：
   - 确认 JWT_SECRET 在所有环境中一致
   - 检查令牌过期时间设置

### 调试技巧

```typescript
// 在代码中检查环境变量
console.log('Supabase URL:', process.env.SUPABASE_URL);
console.log('Environment:', process.env.NODE_ENV);
```

## 相关文档

- [Cloudflare Workers 环境变量](https://developers.cloudflare.com/workers/configuration/environment-variables/)
- [Supabase 文档](https://supabase.com/docs)
- [JWT 认证](https://jwt.io/introduction)