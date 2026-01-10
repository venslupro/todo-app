# Project Architecture and Technology Stack

## Table of Contents
- [Project Overview](#project-overview)
- [Technology Architecture](#-technology-architecture)
- [Architecture Features](#-architecture-features)
- [Data Flow Architecture](#-data-flow-architecture)
- [Core Modules](#-core-modules)
- [Performance Metrics](#-performance-metrics)

## Project Overview

Todo App Backend is a modern serverless backend service designed specifically for the Cloudflare Workers environment. The project adopts a microservices architecture, providing complete RESTful API and real-time WebSocket functionality.

## 🏗️ Technology Architecture

### Core Frameworks
- **Hono**: Lightweight web framework for building RESTful APIs
- **Durable Objects**: Cloudflare's persistent objects for WebSocket connection management
- **Cloudflare Workers**: Serverless runtime environment

### Data Layer
- **Supabase**: Backend-as-a-Service providing PostgreSQL database and authentication services
- **Row Level Security (RLS)**: Database row-level security policies
- **Real-time Subscriptions**: Real-time database change notifications

### Development Toolchain
- **TypeScript**: Type-safe JavaScript superset
- **ESLint**: Code quality checking following Google code style
- **Jest**: Unit testing framework
- **Wrangler**: Cloudflare Workers development tool

## 📊 Architecture Features

### 1. Serverless Architecture
- Zero-config deployment based on Cloudflare Workers
- Automatic scaling with usage-based billing
- Globally distributed deployment

### 2. Type Safety
- Complete TypeScript type definitions
- Compile-time type checking
- Automatic database type generation

### 3. Performance Optimization
- Supabase client caching mechanism
- Database connection reuse
- Request-level resource management

### 4. Security
- JWT authentication and authorization
- Database row-level security policies
- API rate limiting
- CORS security configuration

## 🔄 Data Flow Architecture

```
Client Request → Cloudflare Workers → Hono Router → Business Service Layer → Supabase Database
                    ↓
              WebSocket Connection → Durable Objects → Real-time Data Push
```

### Request Processing Flow
1. **Authentication Middleware**: JWT token validation and user information extraction
2. **Rate Limiting**: API call frequency control
3. **Request Validation**: Input parameter validation and sanitization
4. **Business Logic**: Service layer processing core business
5. **Data Persistence**: Supabase database operations
6. **Response Formatting**: Unified response format and error handling

## 🎯 Core Modules

### Authentication Module (Auth)
- User registration and login
- JWT token management
- Password reset and security policies

### Todo Management Module
- Todo item CRUD operations
- Status management and priority settings
- Category and tag support

### Team Collaboration Module
- Todo item sharing
- Permission management (read/write/admin)
- Real-time collaboration notifications

### Media File Module
- File upload and storage
- Image and video processing
- File permission control

### WebSocket Real-time Module
- Real-time Todo status updates
- Team collaboration notifications
- Online status management

## 📈 Performance Metrics

### Response Time
- API average response time: < 100ms
- Database query time: < 50ms
- WebSocket connection latency: < 20ms

### Concurrent Capacity
- Supports thousands of concurrent WebSocket connections
- Processes hundreds of API requests per second
- 自动水平扩展

### 可用性
- 99.9% 服务可用性
- 全球多个边缘节点
- 自动故障转移

## 🔧 开发最佳实践

### 代码组织
- 清晰的模块边界
- 单一职责原则
- 依赖注入模式

### 错误处理
- 统一的错误响应格式
- 详细的错误日志记录
- 优雅的错误恢复

### 测试策略
- 单元测试覆盖核心逻辑
- 集成测试验证 API 接口
- 端到端测试确保系统功能

## 🚀 部署架构

### 开发环境
- 本地 Wrangler 开发服务器
- 热重载和调试支持
- 本地数据库连接

### 生产环境
- Cloudflare Workers 全球部署
- Supabase 生产数据库
- GitHub Actions 自动化部署

### 监控和日志
- Cloudflare Workers 日志
- Supabase 性能监控
- 错误追踪和报警

## 📚 相关文档

- [环境配置](ENVIRONMENT.md) - 环境变量和部署配置
- [API 文档](API.md) - 详细的 API 接口说明
- [测试指南](TESTING.md) - 测试框架使用说明
- [部署指南](DEPLOYMENT.md) - 生产环境部署流程

---

**技术优势**: 本项目结合了现代无服务器架构的优势，提供了高性能、高可用性的后端服务，同时保持了开发效率和代码质量。