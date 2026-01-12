# GitHub Secrets Configuration Guide

## Overview
This document describes the environment variables that need to be configured in GitHub Secrets for the CI/CD pipeline to work correctly.

## Required GitHub Secrets

### Staging Environment Secrets
These secrets are used when deploying to the staging environment (non-main branches):

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `SUPABASE_URL_STAGING` | Staging Supabase project URL | `https://your-project-staging.supabase.co` |
| `SUPABASE_ANON_KEY_STAGING` | Staging Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_ROLE_KEY_STAGING` | Staging Supabase service role key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

### Production Environment Secrets
These secrets are used when deploying to the production environment (main branch):

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `SUPABASE_URL_PRODUCTION` | Production Supabase project URL | `https://your-project-production.supabase.co` |
| `SUPABASE_ANON_KEY_PRODUCTION` | Production Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_ROLE_KEY_PRODUCTION` | Production Supabase service role key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

### Common Secrets (Both Environments)
These secrets are shared between both environments:

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token for deployment | `your-cloudflare-api-token` |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID | `your-cloudflare-account-id` |

## Setup Instructions

### 1. Configure GitHub Secrets
1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add all the required secrets listed above

### 2. Supabase Project Setup
You need to create two separate Supabase projects:
- **Staging project**: For testing and development
- **Production project**: For live users

### 3. Cloudflare Setup
1. Create a Cloudflare API token with the following permissions:
   - Account: Workers Scripts:Edit
   - Zone: Workers Routes:Edit
2. Get your Cloudflare Account ID from the dashboard

## Verification

After configuring the secrets, the CI/CD pipeline should:
- ✅ Automatically deploy to staging on non-main branches
- ✅ Allow manual deployment to production on main branch
- ✅ Use the correct environment-specific configurations

## Troubleshooting

### Common Issues

#### "Missing environment variables" error
- Ensure all required secrets are configured in GitHub
- Check that secret names match exactly (case-sensitive)

#### "Invalid Supabase credentials" error
- Verify Supabase project URLs and keys are correct
- Check that the Supabase projects are active

#### "Cloudflare authentication failed" error
- Verify the Cloudflare API token has correct permissions
- Check that the Account ID is correct

#### Deployment to wrong environment
- Ensure branch conditions are correctly configured
- Check that the correct environment variables are being used

## Security Best Practices

- Use different Supabase projects for staging and production
- Regularly rotate API keys and tokens
- Limit permissions for service role keys
- Monitor deployment logs for security issues

## Related Documentation

- [Environment Configuration Guide](ENVIRONMENT.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Supabase Documentation](https://supabase.com/docs)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)