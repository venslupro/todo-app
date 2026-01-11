# Local variables for Cloudflare module.

locals {
  # Resource naming conventions.
  worker_name = "${var.project_name}-${var.environment}"
  pages_name  = "${var.project_name}-frontend-${var.environment}"
  kv_name     = "${var.project_name}-kv-${var.environment}"
  
  # Account subdomain for Workers default domain.
  # This is typically the account name, but we'll use a default value.
  # In practice, this should be set based on the actual account subdomain.
  account_subdomain = "todoapp"  # Default subdomain, can be overridden
  
  # Standard tags.
  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
    Module      = "cloudflare"
  }
}