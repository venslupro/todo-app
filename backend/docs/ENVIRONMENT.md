# Environment Configuration Guide

## Table of Contents
- [Overview](#overview)
- [Required Environment Variables](#-required-environment-variables)
- [Optional Environment Variables](#-optional-environment-variables)
- [Environment Setup Examples](#-environment-setup-examples)
- [Troubleshooting](#-troubleshooting)

## Overview

This document explains how to configure the environment variables required for running the project, covering local development, testing, and production environments.

## 🔧 Required Environment Variables

### Supabase Configuration

```env
# Supabase project URL (required)
SUPABASE_URL=https://your-project.supabase.co

# Supabase anonymous key (client-side access)
SUPABASE_ANON_KEY=your-supabase-anon-key

# Supabase service role key (server-side operations)
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### Application Configuration

```env
# Application environment (development/production)
NODE_ENV=development

# JWT secret key (required for token signing)
JWT_SECRET=your-jwt-secret-key-here

# JWT token expiration time (seconds, default 24 hours)
JWT_EXPIRES_IN=86400

# Allowed CORS origins (comma-separated)
ALLOWED_ORIGINS=https://your-frontend.example.com,http://localhost:3000
```

## ⚙️ Optional Environment Variables

### File Upload Configuration

```env
# Maximum file size (bytes, default 10MB)
MAX_FILE_SIZE=10485760

# Supported MIME types
SUPPORTED_IMAGE_TYPES=image/jpeg,image/png,image/gif,image/webp
SUPPORTED_VIDEO_TYPES=video/mp4,video/webm,video/ogg
```

### 速率限制

```env
# 每分钟最大请求数 (默认 1000)
RATE_LIMIT_REQUESTS=1000

# 速率限制窗口时间 (秒，默认 60)
RATE_LIMIT_WINDOW=60
```

### 日志配置

```env
# 日志级别 (error/warn/info/debug)
LOG_LEVEL=info

# 是否启用详细日志
DEBUG=false
```

## 🛠️ 环境设置

### 1. 本地开发 (.dev.vars)

创建 `.dev.vars` 文件用于 Wrangler 开发：

```bash
cp .dev.vars.example .dev.vars
# 编辑 .dev.vars 文件，填入实际配置
```

### 2. 生产环境 (Cloudflare Dashboard)

在 Cloudflare Workers 仪表板中设置：

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 选择 Workers 服务
3. 进入 "Settings" → "Variables"
4. 添加所有必需的环境变量

### 3. CI/CD 环境 (GitHub Secrets)

在 GitHub 仓库设置中添加：

1. 进入仓库 Settings → Secrets and variables → Actions
2. 添加以下 Secrets：
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `JWT_SECRET`

## 🔒 安全最佳实践

### 密钥管理
- 使用不同的密钥用于开发和生产环境
- 定期轮换敏感密钥
- 不要将密钥提交到版本控制系统

### 权限控制
- 为不同环境使用独立的 Supabase 项目
- 限制服务角色密钥的数据库权限
- 启用数据库行级安全策略 (RLS)

### 环境隔离
- 开发环境使用测试数据
- 生产环境启用严格的安全策略
- 使用环境特定的配置值

## 🧪 环境验证

### 配置检查

运行以下命令验证环境配置：

```bash
# 检查 TypeScript 编译
npm run type-check

# 运行测试
npm test

# 本地开发测试
npm run dev

# 构建验证
npm run build
```

### 常见问题排查

#### 环境变量未加载
- 检查 `.dev.vars` 文件是否存在且格式正确
- 确认 Cloudflare Workers 环境变量已设置
- 验证环境变量名称拼写

#### Supabase 连接失败
- 检查 Supabase URL 和密钥是否正确
- 验证网络连接和防火墙设置
- 确认 Supabase 项目状态正常

#### JWT 验证失败
- 确保 `JWT_SECRET` 在所有环境一致
- 检查令牌过期时间设置
- 验证令牌签名算法

## 📋 配置示例

### 开发环境配置 (.dev.vars)

```env
SUPABASE_URL=https://your-dev-project.supabase.co
SUPABASE_ANON_KEY=your-dev-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-dev-service-key
JWT_SECRET=dev-jwt-secret-key
JWT_EXPIRES_IN=86400
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
LOG_LEVEL=debug
```

### 生产环境配置

```env
SUPABASE_URL=https://your-prod-project.supabase.co
SUPABASE_ANON_KEY=your-prod-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-prod-service-key
JWT_SECRET=prod-jwt-secret-key
JWT_EXPIRES_IN=3600
NODE_ENV=production
ALLOWED_ORIGINS=https://your-app.com
LOG_LEVEL=info
```

## 🔗 相关资源

- [Supabase 文档](https://supabase.com/docs)
- [Cloudflare Workers 环境变量](https://developers.cloudflare.com/workers/configuration/environment-variables/)
- [JWT 认证指南](https://jwt.io/introduction)

---

**重要**: 部署到生产环境前，请确保所有安全配置已正确设置，并进行了充分测试。