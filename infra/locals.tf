# Local variables for consistent naming and configuration.
# This file defines local variables used across the infrastructure.

locals {
  # Project and environment configuration.
  project_name = var.project_name
  
  # Environment name mapping: production -> prd, staging -> stg
  environment = var.environment == "production" ? "prd" : (var.environment == "staging" ? "stg" : "dev")

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
  worker_name = "${local.environment}-${local.project_name}-worker"
  pages_name  = "${local.environment}-${local.project_name}-page"
  kv_name     = "${local.environment}-${local.project_name}-kv"
  
  # Supabase project naming.
  supabase_project_name = "${local.environment}-${local.project_name}-project"
}