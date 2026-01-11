# Local variables for Supabase module.

locals {
  # Project naming convention.
  project_name = "${var.project_name}-${var.environment}"
  
  # Standard tags.
  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
    Module      = "supabase"
  }
}