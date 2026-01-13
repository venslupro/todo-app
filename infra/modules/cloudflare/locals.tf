# Local variables for Cloudflare module.

locals {
  # Resource naming convention: environment-name-app-name-resource-type
  
  # Worker resource naming: stg-todo-worker / prd-todo-worker
  worker_name = "${var.environment}-${var.project_name}-worker"
  
  # Pages resource naming: stg-todo-page / prd-todo-page
  pages_name  = "${var.environment}-${var.project_name}-page"
  
  # DNS record naming
  api_dns_name = "${var.environment}-${var.project_name}-api-dns"
  web_dns_name = "${var.environment}-${var.project_name}-web-dns"
  
  # Worker route naming
  api_route_name = "${var.environment}-${var.project_name}-api-route"
  
  # Account subdomain (based on environment)
  account_subdomain = "${var.environment}-${var.project_name}"
  
  # Default domain configuration
  # Workers default domain: <worker-name>.<account-subdomain>.workers.dev
  worker_default_domain = "${local.worker_name}.${local.account_subdomain}.workers.dev"
  
  # Pages default domain: <project-name>.pages.dev
  pages_default_domain = "${local.pages_name}.pages.dev"
  
  # Final domain to use (prefer custom domain, fallback to default domain if not provided)
  api_domain_final = var.api_domain != "" ? var.api_domain : local.worker_default_domain
  web_domain_final = var.web_domain != "" ? var.web_domain : local.pages_default_domain
  
  # Standard tags
  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
    Module      = "cloudflare"
  }
}