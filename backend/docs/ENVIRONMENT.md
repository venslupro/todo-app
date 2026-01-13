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

### Rate Limiting

```env
# Maximum requests per minute (default 1000)
RATE_LIMIT_REQUESTS=1000

# Rate limit window time (seconds, default 60)
RATE_LIMIT_WINDOW=60
```

### Logging Configuration

```env
# Log level (error/warn/info/debug)
LOG_LEVEL=info

# Enable verbose logging
DEBUG=false
```

## 🛠️ Environment Setup

### 1. Local Development (.dev.vars)

Create `.dev.vars` file for Wrangler development:

```bash
cp .dev.vars.example .dev.vars
# Edit .dev.vars file with actual configuration
```

### 2. Production Environment (Cloudflare Dashboard)

Configure in Cloudflare Workers dashboard:

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select Workers service
3. Go to "Settings" → "Variables"
4. Add all required environment variables

### 3. CI/CD Environment (GitHub Secrets)

Add to GitHub repository settings:

1. Go to repository Settings → Secrets and variables → Actions
 2. Add the following Secrets:
    - `CLOUDFLARE_API_TOKEN`
    - `CLOUDFLARE_ACCOUNT_ID`
    - `SUPABASE_URL`
    - `SUPABASE_SERVICE_ROLE_KEY`
    - `JWT_SECRET`

## 🔒 Security Best Practices

### Key Management
- Use different keys for development and production environments
- Regularly rotate sensitive keys
- Do not commit keys to version control systems

### Permission Control
- Use separate Supabase projects for different environments
- Limit database permissions for service role keys
- Enable database row-level security policies (RLS)

### Environment Isolation
- Use test data in development environment
- Enable strict security policies in production environment
- Use environment-specific configuration values

## 🧪 Environment Validation

### Configuration Check

Run the following commands to verify environment configuration:

```bash
# Check TypeScript compilation
npm run type-check

# Run tests
npm test

# Local development test
npm run dev

# Build verification
npm run build
```

### Common Issue Troubleshooting

#### Environment Variables Not Loaded
- Check if `.dev.vars` file exists and has correct format
- Confirm Cloudflare Workers environment variables are set
- Verify environment variable names spelling

#### Supabase Connection Failed
- Check if Supabase URL and keys are correct
- Verify network connection and firewall settings
- Confirm Supabase project status is normal

#### JWT Validation Failed
- Ensure `JWT_SECRET` is consistent across all environments
- Check token expiration time settings
- Verify token signature algorithm

## 📋 Configuration Examples

### Development Environment Configuration (.dev.vars)

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

### Production Environment Configuration

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

## 🔗 Related Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Cloudflare Workers Environment Variables](https://developers.cloudflare.com/workers/configuration/environment-variables/)
- [JWT Authentication Guide](https://jwt.io/introduction)

---

**Important**: Before deploying to production, ensure all security configurations are properly set up and thoroughly tested.