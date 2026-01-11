# Infrastructure as Code (IaC) for Todo App

This directory contains Terraform configurations for deploying the Todo App infrastructure following Google code style guidelines.

## 📁 Directory Structure

The infrastructure follows a modular structure with clear separation of concerns:

```
infra/
├── modules/                    # Reusable infrastructure modules
│   ├── cloudflare/            # Cloudflare-specific resources
│   │   ├── versions.tf        # Terraform version requirements
│   │   ├── providers.tf       # Provider configurations
│   │   ├── variables.tf       # Module input variables
│   │   ├── locals.tf          # Local variables and naming
│   │   ├── data.tf            # Data sources
│   │   ├── main.tf            # Main Cloudflare configuration
│   │   ├── worker.tf          # Worker script configuration
│   │   ├── pages.tf           # Pages project configuration
│   │   ├── durable-objects.tf # Durable Objects for WebSocket
│   │   ├── routes.tf          # Worker routes
│   │   └── outputs.tf         # Module outputs
│   └── supabase/              # Supabase-specific resources
│       ├── versions.tf        # Terraform version requirements
│       ├── variables.tf       # Module input variables
│       ├── locals.tf          # Local variables and naming
│       ├── data.tf            # Data sources
│       ├── main.tf            # Main Supabase configuration
│       └── outputs.tf         # Module outputs
├── environments/               # Environment-specific configurations
│   ├── production/            # Production environment
│   │   ├── versions.tf        # Environment version requirements
│   │   ├── providers.tf       # Environment provider config
│   │   ├── variables.tf       # Environment variables
│   │   ├── locals.tf          # Environment-specific locals
│   │   ├── main.tf            # Environment main configuration
│   │   └── outputs.tf         # Environment outputs
│   └── staging/               # Staging environment
│       ├── versions.tf        # Environment version requirements
│       ├── providers.tf       # Environment provider config
│       ├── variables.tf       # Environment variables
│       ├── locals.tf          # Environment-specific locals
│       ├── main.tf            # Environment main configuration
│       └── outputs.tf         # Environment outputs
├── scripts/                   # Utility scripts
│   ├── terraform-init.sh      # Terraform initialization script
│   ├── validate-config.sh     # Full configuration validation
│   ├── simple-validate.sh     # Quick configuration check
│   ├── deploy-production.sh   # Production deployment script
│   ├── deploy-staging.sh      # Staging deployment script
│   └── validate-structure.sh  # Directory structure validation
├── versions.tf                # Root Terraform version requirements
├── providers.tf               # Root provider configurations
├── variables.tf               # Root input variables
├── locals.tf                  # Root local variables
├── main.tf                    # Root main configuration
├── outputs.tf                 # Root outputs
├── terraform.tfvars.example   # Example variables file
└── README.md                  # This file
```

## 🏗️ Architecture Overview

The infrastructure is organized into logical modules following Google's Terraform best practices:

### Core Modules
- **Cloudflare Module**: Manages Worker scripts, Pages projects, KV namespaces, Durable Objects, and routing
- **Supabase Module**: Handles database projects, API configurations, and authentication

### Environment Separation
- **Production Environment**: Complete configuration for production deployment
- **Staging Environment**: Pre-production testing environment with different configurations
- **Modular Design**: Easy to add additional environments (development, testing, etc.)

## 🚀 Quick Start

### Prerequisites

1. **Cloudflare Account** with:
   - Workers & Pages enabled
   - Domain configured
   - API token with appropriate permissions

2. **Supabase Account** with:
   - Access token for API access
   - Organization ID for project creation
   - Appropriate plan for required resources

3. **Terraform** (>= 1.0.0) installed locally

### Setup

#### Option 1: Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/venslupro/todo-app.git
   cd todo-app/infra
   ```

2. **Configure variables:**
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with your actual values
   ```

3. **Set environment variables:**
   ```bash
   export CLOUDFLARE_API_TOKEN="your-api-token"
   export CLOUDFLARE_ACCOUNT_ID="your-account-id"
   export SUPABASE_ACCESS_TOKEN="your-access-token"
   export SUPABASE_ORGANIZATION_ID="your-organization-id"
   export SUPABASE_DATABASE_PASSWORD="your-database-password"
   ```

4. **Validate configuration:**
   ```bash
   ./scripts/validate-structure.sh
   ./scripts/simple-validate.sh
   ```

5. **Initialize Terraform:**
   ```bash
   ./scripts/terraform-init.sh
   ```

6. **Plan deployment:**
   ```bash
   terraform plan
   ```

7. **Apply configuration:**
   ```bash
   terraform apply
   ```

#### Option 2: Environment-Specific Deployment

**Production Environment:**
```bash
cd environments/production
terraform init && terraform plan && terraform apply
# 或使用部署脚本
./scripts/deploy-production.sh
```

**Staging Environment:**
```bash
cd environments/staging
terraform init && terraform plan && terraform apply
# 或使用部署脚本
./scripts/deploy-staging.sh
```

#### Option 3: GitHub Actions Deployment

1. **Configure GitHub Secrets** (Settings → Secrets and variables → Actions):
   ```
   CLOUDFLARE_ACCOUNT_ID = "your-cloudflare-account-id"
   CLOUDFLARE_API_TOKEN = "your-cloudflare-api-token"
   SUPABASE_ACCESS_TOKEN = "your-supabase-access-token"
   SUPABASE_ORGANIZATION_ID = "your-supabase-organization-id"
   SUPABASE_DATABASE_PASSWORD = "your-supabase-database-password"
   ```

2. **Configure GitHub Variables** (Settings → Secrets and variables → Variables):
   ```
   API_DOMAIN = "api.yourdomain.com"
   WEB_DOMAIN = "app.yourdomain.com"
   ZONE_NAME = "yourdomain.com"
   ```

3. **Trigger workflow:**
   - **Staging**: Push to any branch except `main` with changes in `infra/` directory
   - **Production**: Push to `main` branch or manual trigger via GitHub Actions
   - Or manually trigger via GitHub Actions → Backend CI/CD Pipeline → Run workflow

## 🔧 Module Details

### Cloudflare Module
Manages all Cloudflare resources including:
- **Worker Scripts**: API backend deployment with environment bindings
- **Pages Projects**: Frontend application hosting with production branch configuration
- **KV Namespaces**: Rate limiting and caching with proper tagging
- **Durable Objects**: WebSocket support with namespace binding
- **Worker Routes**: API routing configuration with CNAME records
- **DNS Configuration**: Domain mapping for API and frontend

### Supabase Module
Handles Supabase infrastructure including:
- **Project Creation**: Database and authentication setup with region selection (默认亚太地区 ap-southeast-1)
- **API Configuration**: REST, Realtime, and Storage APIs enabled
- **Authentication**: Site URL configuration for OAuth and security
- **Storage**: File upload limits and management configuration (50MB 文件大小限制)
- **Database**: PostgreSQL database with version management
- **Environment Variables**: 自动配置 Supabase URL 和 API 密钥供 Cloudflare Worker 使用

## 🌍 Environment Management

### Production Environment
Located in `environments/production/` with:
- **Domain**: `api.todoapp.com`, `app.todoapp.com`
- **Region**: `us-east-1` (北美地区)
- **Security**: Enhanced security settings and resource tagging
- **Resources**: Production-grade resource sizing (Pro plan for Supabase)
- **Monitoring**: Comprehensive monitoring and logging setup
- **Naming**: Standardized naming conventions

### Staging Environment
Located in `environments/staging/` with:
- **Domain**: `staging.api.todoapp.com`, `staging.app.todoapp.com`
- **Region**: `ap-southeast-1` (亚太地区，与生产环境隔离)
- **Security**: Staging-specific security settings
- **Resources**: Development-grade resource sizing (Free plan for Supabase)
- **Testing**: Pre-production testing environment
- **Naming**: Environment-specific naming with `-staging` suffix

### Environment Configuration
Each environment includes:
- **versions.tf**: Terraform version requirements
- **providers.tf**: Provider-specific configurations
- **variables.tf**: Environment-specific variables
- **locals.tf**: Local variables and naming conventions
- **main.tf**: Module integration and resource configuration
- **outputs.tf**: Environment-specific outputs

### Deployment Scripts
- **Production**: `./scripts/deploy-production.sh` - 手动确认的生产环境部署
- **Staging**: `./scripts/deploy-staging.sh` - 预发布环境部署，用于测试

## 🔧 GitHub Actions 配置

### 必需的 Secrets 配置
在 GitHub 仓库的 Settings → Secrets and variables → Actions 中配置：

| Secret 名称 | 描述 | 获取方式 |
|------------|------|----------|
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare 账户 ID | Cloudflare 控制台 → 账户概览 |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API 令牌 | Cloudflare 控制台 → 我的个人资料 → API 令牌 |
| `SUPABASE_ACCESS_TOKEN` | Supabase 访问令牌 | Supabase 控制台 → 设置 → API |
| `SUPABASE_ORGANIZATION_ID` | Supabase 组织 ID | Supabase 控制台 → 组织设置 |
| `SUPABASE_DATABASE_PASSWORD` | Supabase 数据库密码 | 创建 Supabase 项目时设置 |

### 可选的 Variables 配置
在 GitHub 仓库的 Settings → Secrets and variables → Variables 中配置：

| 变量名称 | 描述 | 默认值 |
|----------|------|--------|
| `API_DOMAIN` | API 域名 | `api.todoapp.com` |
| `WEB_DOMAIN` | Web 域名 | `app.todoapp.com` |
| `ZONE_NAME` | Cloudflare 区域名称 | `todoapp.com` |

### 工作流触发方式
- **自动触发**: 当 `infra/` 目录有变更时自动运行
- **手动触发**: 通过 GitHub Actions 界面手动选择操作 (plan/apply/destroy)
- **分支限制**: 仅在 `main` 和 `dev` 分支上执行

## 🌏 Supabase 亚太地区配置

### 默认区域
- **默认区域**: `ap-southeast-1` (亚太东南地区)
- **支持的区域**: ap-southeast-1, us-east-1, eu-central-1 等
- **配置方法**: 通过 `supabase_region` 变量配置

### 亚太地区优势
- **更低的延迟**: 为亚太地区用户提供更好的访问体验
- **数据合规性**: 满足亚太地区的数据存储要求
- **性能优化**: 优化的网络连接和响应时间

### 区域配置示例
```terraform
# 使用默认亚太地区
supabase_region = "ap-southeast-1"

# 或指定其他区域
supabase_region = "us-east-1"  # 北美东部
supabase_region = "eu-central-1"  # 欧洲中部
```

## 🔒 Security Considerations

- **Sensitive Variables**: API tokens and keys marked as `sensitive = true`
- **Environment Separation**: Clear separation between production and other environments
- **Access Control**: Proper permissions configured for each resource type
- **Secret Management**: Use environment variables or secure storage solutions
- **Resource Tagging**: Standardized tags for cost tracking and access control

## 📊 Output Values

After deployment, Terraform outputs include:

### Infrastructure Outputs
- **worker_url**: API endpoint URL for the Worker application
- **frontend_url**: User-facing application URL for Pages deployment
- **supabase_api_url**: Supabase API endpoint for backend integration
- **supabase_project_id**: Unique identifier for the Supabase project
- **supabase_anon_key**: Public authentication key for client applications
- **supabase_service_key**: Service role key for server operations
- **supabase_database_url**: Database connection URL (sensitive)
- **websocket_namespace_id**: Durable Object namespace ID for WebSocket support
- **kv_namespace_id**: KV namespace ID for caching and rate limiting

### Module Outputs
Each module provides specific outputs for integration:
- **Cloudflare Module**: Worker IDs, Pages project details, namespace IDs
- **Supabase Module**: Project details, API URLs, authentication keys

## 🛠️ Utility Scripts

The `scripts/` directory contains comprehensive utility scripts:

### Validation Scripts
- **validate-structure.sh**: Validates directory structure and file organization
- **validate-config.sh**: Comprehensive configuration validation with detailed checks
- **simple-validate.sh**: Quick configuration check for basic validation

### Deployment Scripts
- **terraform-init.sh**: Automated Terraform initialization with backend configuration
- **deploy-production.sh**: Production deployment automation with validation

### Usage Examples
```bash
# Quick validation
./scripts/simple-validate.sh

# Full structure validation
./scripts/validate-structure.sh

# Complete configuration validation
./scripts/validate-config.sh

# Initialize Terraform
./scripts/terraform-init.sh

# Deploy to production
./scripts/deploy-production.sh
```

## 🔄 CI/CD Integration

The infrastructure is designed for seamless CI/CD integration:

### GitHub Actions Workflow
- **Automated Validation**: Configuration validation on every commit
- **Terraform Plan**: Automated planning for infrastructure changes
- **Secure Deployment**: Environment-specific deployment with proper approvals
- **State Management**: Remote state storage for team collaboration

### Environment Variables
- **Secure Handling**: Sensitive data managed through GitHub Secrets
- **Environment-specific**: Different configurations for each environment
- **Automated Testing**: Infrastructure validation in CI pipeline

### Workflow Integration
```yaml
# Example GitHub Actions workflow
name: Terraform Infrastructure
on:
  push:
    branches: [main]
    paths: ['infra/**']

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Validate Infrastructure
        run: |
          cd infra
          ./scripts/validate-structure.sh
          ./scripts/validate-config.sh
```

## 📈 Monitoring and Logging

### Cloudflare Integration
- **Logpush**: Enabled for Worker monitoring and debugging
- **Analytics**: Built-in analytics for Worker performance
- **Error Tracking**: Comprehensive error reporting and logging

### Resource Management
- **Standardized Tagging**: Consistent tags for cost tracking and management
- **Resource Naming**: Predictable naming conventions for easy identification
- **Output Integration**: Easy integration with external monitoring tools

### Health Checks
- **Automated Validation**: Script-based configuration validation
- **State Monitoring**: Terraform state health monitoring
- **Resource Availability**: Automated checks for resource availability

## 🚨 Troubleshooting

### Common Issues

1. **Provider Authentication**: Ensure API tokens have correct permissions
   - Cloudflare: Account-level permissions for Workers, Pages, and DNS
   - Supabase: Project creation and management permissions

2. **Domain Configuration**: Verify domain ownership and DNS settings
   - Ensure domains are properly configured in Cloudflare
   - Check DNS record propagation

3. **Resource Limits**: Check plan limits for Supabase and Cloudflare
   - Supabase: Free/Pro/Team plan limitations
   - Cloudflare: Worker script size and KV namespace limits

4. **State Conflicts**: Use remote state for team collaboration
   - Configure proper backend storage
   - Implement state locking mechanisms

### Validation and Testing

Use the included validation scripts for comprehensive testing:

```bash
# Quick validation check
./scripts/simple-validate.sh

# Full structure validation
./scripts/validate-structure.sh

# Complete configuration validation
./scripts/validate-config.sh
```

### Debugging Steps

1. **Configuration Validation**: Run validation scripts to identify issues
2. **Terraform Plan**: Use `terraform plan` to preview changes
3. **State Inspection**: Use `terraform show` to inspect current state
4. **Log Analysis**: Check Cloudflare logs for Worker issues
5. **API Testing**: Verify Supabase API endpoints are accessible

## 📚 Additional Resources

### Documentation
- [Terraform Documentation](https://www.terraform.io/docs)
- [Cloudflare Terraform Provider](https://registry.terraform.io/providers/cloudflare/cloudflare)
- [Supabase Terraform Provider](https://registry.terraform.io/providers/supabase/supabase)
- [Google Terraform Best Practices](https://cloud.google.com/docs/terraform/best-practices-for-terraform)

### Best Practices
- **Modular Design**: Reusable modules for different environments
- **Environment Separation**: Clear separation of configuration
- **Security First**: Sensitive data handling and access control
- **Validation**: Comprehensive validation and testing
- **Documentation**: Clear documentation and examples

### Support and Community
- **GitHub Issues**: Report bugs and request features
- **Documentation Updates**: Keep documentation current with changes
- **Community Contributions**: Welcome contributions and improvements

## 🎯 Next Steps

1. **Review Configuration**: Validate all settings match your requirements
2. **Set Up CI/CD**: Configure GitHub Actions for automated deployment
3. **Test Deployment**: Deploy to a test environment first
4. **Monitor Performance**: Set up monitoring and alerting
5. **Plan Scaling**: Consider scaling requirements for production use

---

**Note**: This infrastructure follows Google's Terraform best practices and is designed for production use. Always test configurations in a staging environment before deploying to production.