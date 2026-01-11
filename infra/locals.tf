# Local variables for consistent naming and configuration.
# This file defines local variables used across the infrastructure.

locals {
  # Project and environment configuration.
  project_name = var.project_name
  environment  = var.environment

  # Standard tags for resource identification and organization.
  tags = {
    Project     = local.project_name
    Environment = local.environment
    ManagedBy   = "terraform"
  }

  # Domain configuration.
  api_domain = var.api_domain
  web_domain = var.web_domain

  # Resource naming conventions.
  worker_name = "${local.project_name}-${local.environment}"
  pages_name  = "${local.project_name}-frontend-${local.environment}"
  kv_name     = "${local.project_name}-kv-${local.environment}"
  
  # Supabase project naming.
  supabase_project_name = "${local.project_name}-${local.environment}"
}