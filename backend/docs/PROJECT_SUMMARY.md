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
- Automatic horizontal scaling

### Availability
- 99.9% service availability
- Multiple global edge nodes
- Automatic failover

## 🔧 Development Best Practices

### Code Organization
- Clear module boundaries
- Single responsibility principle
- Dependency injection patterns

### Error Handling
- Unified error response format
- Detailed error logging
- Graceful error recovery

### Testing Strategy
- Unit tests covering core logic
- Integration tests validating API interfaces
- End-to-end tests ensuring system functionality

## 🚀 Deployment Architecture

### Development Environment
- Local Wrangler development server
- Hot reload and debugging support
- Local database connections

### Production Environment
- Global deployment with Cloudflare Workers
- Supabase production database
- Automated deployment with GitHub Actions

### Monitoring and Logging
- Cloudflare Workers logs
- Supabase performance monitoring
- Error tracking and alerts

## 📚 Related Documentation

- [Environment Configuration](ENVIRONMENT.md) - Environment variables and deployment configuration
- [API Documentation](API.md) - Detailed API interface specifications
- [Testing Guide](TESTING.md) - Testing framework usage instructions
- [Deployment Guide](DEPLOYMENT.md) - Production environment deployment process

---

**Technical Advantages**: This project combines the advantages of modern serverless architecture, providing high-performance, highly available backend services while maintaining development efficiency and code quality.