# Deployment Guide

## Table of Contents
- [Overview](#overview)
- [Prerequisites](#-prerequisites)
- [Manual Deployment](#-manual-deployment)
- [Automated Deployment with GitHub Actions](#-automated-deployment-with-github-actions)
- [Environment Configuration](#-environment-configuration)
- [Database Deployment](#-database-deployment)
- [Security Configuration](#-security-configuration)
- [Monitoring and Logging](#-monitoring-and-logging)
- [Zero-Downtime Deployment](#-zero-downtime-deployment)
- [Troubleshooting](#-troubleshooting)
- [Best Practices](#-best-practices)

## Overview

This guide covers the deployment process for the Todo App Backend to Cloudflare Workers. The project supports both manual deployment and automated CI/CD deployment via GitHub Actions.

## 🚀 Prerequisites

### Required Tools
- **Cloudflare Wrangler CLI**: `npm install -g wrangler`
- **Cloudflare Account**: With Workers access
- **GitHub Account**: For CI/CD automation

### Environment Setup
1. Install Wrangler CLI:
   ```bash
   npm install -g wrangler
   ```

2. Login to Cloudflare:
   ```bash
   wrangler login
   ```

3. Configure environment variables in `wrangler.toml` or via Cloudflare dashboard

## 🔧 Manual Deployment

### 1. Build the Project
```bash
# Install dependencies
npm install

# Build the project
npm run build
```

### 2. Configure Environment Variables
Update `wrangler.toml` with your configuration:

```toml
name = "todo-app-backend"
compatibility_date = "2024-01-01"

[vars]
SUPABASE_URL = "https://your-project.supabase.co"
SUPABASE_ANON_KEY = "your-anon-key"
JWT_SECRET = "your-jwt-secret"
NODE_ENV = "production"

[[r2_buckets]]
binding = "MY_BUCKET"
bucket_name = "my-bucket"
```

### 3. Deploy to Cloudflare Workers
```bash
# Deploy to production
wrangler deploy

# Deploy to preview environment
wrangler deploy --env preview
```

## ⚡ Automated Deployment with GitHub Actions

### CI/CD Workflow

The project includes GitHub Actions workflows for automated testing and deployment:

#### 1. Continuous Integration (CI)
File: `.github/workflows/ci.yml`

```yaml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm test
      - run: npm run build
```

#### 2. Production Deployment
File: `.github/workflows/deploy.yml`

```yaml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

#### 3. Development Deployment
File: `.github/workflows/deploy-dev.yml`

```yaml
name: Deploy to Development
on:
  push:
    branches: [develop]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          environment: development
```

### GitHub Secrets Configuration

Add the following secrets to your GitHub repository:

1. **CLOUDFLARE_API_TOKEN**: Cloudflare API token with Workers permissions
2. **CLOUDFLARE_ACCOUNT_ID**: Your Cloudflare account ID
3. **SUPABASE_URL**: Your Supabase project URL
4. **SUPABASE_ANON_KEY**: Supabase anonymous key
5. **JWT_SECRET**: JWT secret key

## 🏗️ Environment Configuration

### Production Environment

#### Environment Variables
```env
NODE_ENV=production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-production-jwt-secret
ALLOWED_ORIGINS=https://your-frontend.com
```

#### Wrangler Configuration
```toml
# wrangler.toml
name = "todo-app-backend-prod"
compatibility_date = "2024-01-01"

[env.production]
name = "todo-app-backend-prod"

[vars]
NODE_ENV = "production"
SUPABASE_URL = "https://your-project.supabase.co"
SUPABASE_ANON_KEY = "{{SUPABASE_ANON_KEY}}"
JWT_SECRET = "{{JWT_SECRET}}"
```

### Development Environment

#### Environment Variables
```env
NODE_ENV=development
SUPABASE_URL=https://your-dev-project.supabase.co
SUPABASE_ANON_KEY=your-dev-anon-key
JWT_SECRET=your-dev-jwt-secret
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

## 📊 Database Deployment

### Supabase Setup

1. **Create Supabase Project**:
   - Go to [Supabase](https://supabase.com)
   - Create new project
   - Note the project URL and API keys

2. **Run Database Migrations**:
   ```bash
   # Apply migrations
   npm run db:migrate
   
   # Seed initial data (optional)
   npm run db:seed
   ```

### Migration Scripts

File: `scripts/migrate.ts`
```typescript
// Database migration script
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Run migrations from src/database/migrations/
async function runMigrations() {
  // Migration logic here
}
```

## 🔒 Security Configuration

### JWT Configuration
- Use strong, unique JWT secrets for each environment
- Set appropriate token expiration times
- Rotate secrets regularly

### CORS Configuration
Configure allowed origins in environment variables:
```env
ALLOWED_ORIGINS=https://production-frontend.com,https://staging-frontend.com
```

### Rate Limiting
Configure rate limits in your Cloudflare Workers settings:
- API endpoints: 100 requests/minute
- Authentication endpoints: 10 requests/minute

## 📈 Monitoring and Logging

### Cloudflare Analytics
- Monitor requests and errors in Cloudflare dashboard
- Set up alerts for error rates
- Track performance metrics

### Custom Logging
Add custom logging to your Workers:

```typescript
// In your handler
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    console.log(`Request: ${request.method} ${request.url}`);
    
    try {
      const response = await handleRequest(request, env);
      console.log(`Response: ${response.status}`);
      return response;
    } catch (error) {
      console.error('Error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }
};
```

## 🔄 Zero-Downtime Deployment

### Blue-Green Deployment
1. Deploy to staging environment first
2. Run tests against staging
3. Switch traffic to new version
4. Monitor for issues
5. Rollback if necessary

### Health Checks
Implement health check endpoints:

```typescript
// Health check endpoint
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});
```

## 🚨 Troubleshooting

### Common Deployment Issues

1. **Environment Variables Missing**
   - Check `wrangler.toml` configuration
   - Verify GitHub secrets are set
   - Ensure variables are properly escaped

2. **Build Failures**
   - Run `npm run build` locally first
   - Check TypeScript compilation errors
   - Verify all dependencies are installed

3. **Database Connection Issues**
   - Verify Supabase project is active
   - Check API keys and URLs
   - Test database connection locally

4. **CORS Errors**
   - Verify `ALLOWED_ORIGINS` environment variable
   - Check frontend URL is included
   - Test CORS configuration locally

### Debugging Tips

1. **Local Testing**: Always test deployment configuration locally first
2. **Incremental Deployment**: Deploy to development environment before production
3. **Log Monitoring**: Check Cloudflare Workers logs for errors
4. **Health Checks**: Implement and monitor health check endpoints

## 📝 Best Practices

1. **Use Environment-Specific Configuration**: Separate configs for dev/staging/prod
2. **Automate Everything**: Use CI/CD for reliable deployments
3. **Monitor Deployments**: Set up alerts and monitoring
4. **Test Thoroughly**: Run comprehensive tests before deployment
5. **Plan Rollbacks**: Have a rollback strategy ready
6. **Document Changes**: Keep deployment documentation up to date

## 🔗 Related Documentation

- [Project Overview](PROJECT_SUMMARY.md)
- [API Documentation](API.md)
- [Environment Configuration](ENVIRONMENT.md)
- [Testing Guide](TESTING.md)