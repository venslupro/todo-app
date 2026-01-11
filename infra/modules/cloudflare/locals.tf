# Local variables for Cloudflare module.

locals {
  # Resource naming conventions.
  worker_name = "${var.project_name}-${var.environment}"
  pages_name  = "${var.project_name}-frontend-${var.environment}"
  kv_name     = "${var.project_name}-kv-${var.environment}"
  
  # Standard tags.
  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
    Module      = "cloudflare"
  }
}