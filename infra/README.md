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
   terraform validate
   ```

5. **Initialize Terraform:**
   ```bash
   terraform init
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
```

**Staging Environment:**
```bash
cd environments/staging
terraform init && terraform plan && terraform apply
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
- **Project Creation**: Database and authentication setup with region selection (default Asia Pacific region ap-southeast-1)
- **API Configuration**: REST, Realtime, and Storage APIs enabled
- **Authentication**: Site URL configuration for OAuth and security
- **Storage**: File upload limits and management configuration (50MB file size limit)
- **Database**: PostgreSQL database with version management
- **Environment Variables**: Automatically configures Supabase URL and API keys for Cloudflare Worker usage

## 🌍 Environment Management

### Production Environment
Located in `environments/production/` with:
- **Domain**: `api.todoapp.com`, `app.todoapp.com`
- **Region**: `us-east-1` (North America region)
- **Security**: Enhanced security settings and resource tagging
- **Resources**: Production-grade resource sizing (Pro plan for Supabase)
- **Monitoring**: Comprehensive monitoring and logging setup
- **Naming**: Standardized naming conventions

### Staging Environment
Located in `environments/staging/` with:
- **Domain**: `staging.api.todoapp.com`, `staging.app.todoapp.com`
- **Region**: `ap-southeast-1` (Asia Pacific region, isolated from production environment)
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

### Deployment Commands
- **Production**: `terraform apply` - Production environment deployment with manual confirmation
- **Staging**: `terraform apply` - Pre-production environment deployment for testing

## 🔧 GitHub Actions Configuration

### Required Secrets Configuration
Configure in GitHub repository Settings → Secrets and variables → Actions:

| Secret Name | Description | How to Obtain |
|------------|------|----------|
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID | Cloudflare Console → Account Overview |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token | Cloudflare Console → My Profile → API Tokens |
| `SUPABASE_ACCESS_TOKEN` | Supabase access token | Supabase Console → Settings → API |
| `SUPABASE_ORGANIZATION_ID` | Supabase organization ID | Supabase Console → Organization Settings |
| `SUPABASE_DATABASE_PASSWORD` | Supabase database password | Set when creating Supabase project |

### Optional Variables Configuration
Configure in GitHub repository Settings → Secrets and variables → Variables:

| Variable Name | Description | Default Value |
|----------|------|--------|
| `API_DOMAIN` | API domain | `api.todoapp.com` |
| `WEB_DOMAIN` | Web domain | `app.todoapp.com` |
| `ZONE_NAME` | Cloudflare zone name | `todoapp.com` |

### Workflow Trigger Methods
- **Automatic Trigger**: Automatically runs when changes are made in `infra/` directory
- **Manual Trigger**: Manually select operations (plan/apply/destroy) through GitHub Actions interface
- **Branch Restrictions**: Only executes on `main` and `dev` branches

## 🌏 Supabase Asia Pacific Region Configuration

### Default Region
- **Default Region**: `ap-southeast-1` (Asia Pacific Southeast region)
- **Supported Regions**: ap-southeast-1, us-east-1, eu-central-1, etc.
- **Configuration Method**: Configure through `supabase_region` variable

### Asia Pacific Region Advantages
- **Lower Latency**: Better access experience for Asia Pacific users
- **Data Compliance**: Meets Asia Pacific data storage requirements
- **Performance Optimization**: Optimized network connections and response times

### Region Configuration Example
```terraform
# Use default Asia Pacific region
supabase_region = "ap-southeast-1"

# Or specify other regions
supabase_region = "us-east-1"  # North America East
supabase_region = "eu-central-1"  # Europe Central
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

## 🛠️ Terraform Commands

### Validation Commands
- **`terraform validate`**: Validates Terraform configuration syntax and structure
- **`terraform plan`**: Generates execution plan to preview changes

### Deployment Commands
- **`terraform init`**: Initializes Terraform with backend configuration
- **`terraform apply`**: Applies infrastructure changes with confirmation

### Usage Examples
```bash
# Validate configuration
terraform validate

# Generate deployment plan
terraform plan

# Initialize Terraform
terraform init

# Deploy infrastructure
terraform apply
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
          terraform validate
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